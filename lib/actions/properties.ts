"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canDeleteProperties } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/sign";
import { slugify } from "@/lib/utils";
import {
  propertyBasicSchema,
  propertyDetailsSchema,
  propertyLocationSchema,
  propertyContactSchema,
  propertySeoSchema,
  type PropertyBasicInput,
  type PropertyDetailsInput,
  type PropertyLocationInput,
  type PropertySeoInput,
} from "@/lib/validations/property.schema";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createProperty(input: PropertyBasicInput): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = propertyBasicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid property data" };

  const supabase = await createClient();
  const slug = `${slugify(parsed.data.title)}-${nanoid(6)}`;
  const { reference, ...basics } = parsed.data;

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...basics, ...(reference ? { reference } : {}), slug, created_by: profile.id })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Could not create property" };

  await logActivity(profile.id, "create", "property", data.id, { title: parsed.data.title });
  revalidatePath("/admin/properties");
  return { success: true, id: data.id };
}

async function patchProperty(id: string, patch: Record<string, unknown>, action: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .update(patch as never)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Not permitted or property not found" };

  await logActivity(profile.id, action, "property", id, { fields: Object.keys(patch) });
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${id}/edit`);
  return { success: true, id };
}

export async function updatePropertyBasics(id: string, input: PropertyBasicInput) {
  const parsed = propertyBasicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid basic info" };
  return patchProperty(id, parsed.data, "update_basic_info");
}

export async function updatePropertyDetails(id: string, input: PropertyDetailsInput) {
  const parsed = propertyDetailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid property details" };
  const { feature_ids, ...rest } = parsed.data;

  const result = await patchProperty(id, rest, "update_details");
  if (!result.success) return result;

  const supabase = await createClient();
  await supabase.from("property_features").delete().eq("property_id", id);
  if (feature_ids.length > 0) {
    await supabase.from("property_features").insert(feature_ids.map((feature_id) => ({ property_id: id, feature_id })));
  }
  revalidatePath(`/admin/properties/${id}/edit`);
  return result;
}

export async function updatePropertyLocation(id: string, input: PropertyLocationInput) {
  const parsed = propertyLocationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid location data" };
  return patchProperty(id, parsed.data, "update_location");
}

export async function updatePropertyContact(id: string, agentId: string | null) {
  const parsed = propertyContactSchema.safeParse({ agent_id: agentId });
  if (!parsed.success) return { success: false, error: "Invalid agent" };
  return patchProperty(id, parsed.data, "update_contact");
}

export async function updatePropertySeo(id: string, input: PropertySeoInput) {
  const parsed = propertySeoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid SEO data" };
  return patchProperty(id, parsed.data, "update_seo");
}

export async function setPropertyStatus(id: string, status: string) {
  const patch: Record<string, unknown> = { status };
  if (status === "available") patch.published_at = new Date().toISOString();
  return patchProperty(id, patch, `status_${status}`);
}

export async function setPropertyFeatured(id: string, featured: boolean) {
  return patchProperty(id, { featured }, featured ? "mark_featured" : "unmark_featured");
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!canDeleteProperties(profile.role)) return { success: false, error: "Not permitted" };

  const supabase = await createClient();
  const { data: media } = await supabase
    .from("property_media")
    .select("cloudinary_public_id, resource_type")
    .eq("property_id", id);

  for (const item of media ?? []) {
    await deleteCloudinaryAsset(item.cloudinary_public_id, item.resource_type as "image" | "video").catch(() => {});
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "delete", "property", id);
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function duplicateProperty(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: source, error } = await supabase.from("properties").select("*").eq("id", id).single();
  if (error || !source) return { success: false, error: "Property not found" };

  const { data: features } = await supabase.from("property_features").select("feature_id").eq("property_id", id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude these from `rest`
  const { id: _oldId, reference: _reference, slug: _slug, created_at: _createdAt, updated_at: _updatedAt, published_at: _publishedAt, views_count: _viewsCount, ...rest } = source;

  const newSlug = `${slugify(source.title)}-copy-${nanoid(6)}`;

  const { data: created, error: insertError } = await supabase
    .from("properties")
    .insert({
      ...rest,
      title: `${source.title} (Copy)`,
      slug: newSlug,
      status: "draft",
      featured: false,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (insertError || !created) return { success: false, error: insertError?.message ?? "Could not duplicate" };

  if (features && features.length > 0) {
    await supabase
      .from("property_features")
      .insert(features.map((f) => ({ property_id: created.id, feature_id: f.feature_id })));
  }

  await logActivity(profile.id, "duplicate", "property", created.id, { source_id: id });
  revalidatePath("/admin/properties");
  return { success: true, id: created.id };
}
