"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/sign";
import type { ActionResult } from "@/lib/actions/properties";

export interface NewMediaItem {
  cloudinary_public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
}

export async function addPropertyMedia(propertyId: string, items: NewMediaItem[]): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { count: existing } = await supabase
    .from("property_media")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { data: maxPos } = await supabase
    .from("property_media")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startPosition = (maxPos?.position ?? -1) + 1;

  const rows = items.map((item, i) => ({
    property_id: propertyId,
    cloudinary_public_id: item.cloudinary_public_id,
    secure_url: item.secure_url,
    resource_type: item.resource_type,
    width: item.width ?? null,
    height: item.height ?? null,
    duration: item.duration ?? null,
    position: startPosition + i,
    is_cover: (existing ?? 0) === 0 && i === 0,
  }));

  const { error } = await supabase.from("property_media").insert(rows);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "add_media", "property", propertyId, { count: items.length });
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/admin/media");
  return { success: true };
}

export async function deletePropertyMedia(mediaId: string, propertyId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: media } = await supabase
    .from("property_media")
    .select("cloudinary_public_id, resource_type, is_cover")
    .eq("id", mediaId)
    .maybeSingle();

  if (!media) return { success: false, error: "Media not found" };

  await deleteCloudinaryAsset(media.cloudinary_public_id, media.resource_type as "image" | "video").catch(() => {});

  const { error } = await supabase.from("property_media").delete().eq("id", mediaId);
  if (error) return { success: false, error: error.message };

  if (media.is_cover) {
    const { data: next } = await supabase
      .from("property_media")
      .select("id")
      .eq("property_id", propertyId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) await supabase.from("property_media").update({ is_cover: true }).eq("id", next.id);
  }

  await logActivity(profile.id, "delete_media", "property", propertyId, { media_id: mediaId });
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/admin/media");
  return { success: true };
}

export async function reorderPropertyMedia(propertyId: string, orderedIds: string[]): Promise<ActionResult> {
  await requireProfile();
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((mediaId, position) =>
      supabase.from("property_media").update({ position }).eq("id", mediaId).eq("property_id", propertyId),
    ),
  );

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { success: true };
}

export async function setCoverMedia(propertyId: string, mediaId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  await supabase.from("property_media").update({ is_cover: false }).eq("property_id", propertyId);
  const { error } = await supabase.from("property_media").update({ is_cover: true }).eq("id", mediaId);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "set_cover_media", "property", propertyId, { media_id: mediaId });
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { success: true };
}

export async function updatePropertyMediaMeta(
  mediaId: string,
  propertyId: string,
  data: { alt_text?: string; caption?: string },
): Promise<ActionResult> {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("property_media").update(data).eq("id", mediaId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { success: true };
}

export async function setPropertyBrochure(
  propertyId: string,
  brochure: { url: string; publicId: string },
): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Remove any previous brochure asset from Cloudinary so replacements don't orphan files.
  const { data: existing } = await supabase
    .from("properties")
    .select("brochure_public_id")
    .eq("id", propertyId)
    .maybeSingle();

  const prevId = (existing as { brochure_public_id: string | null } | null)?.brochure_public_id;
  if (prevId && prevId !== brochure.publicId) {
    await deleteCloudinaryAsset(prevId, "raw").catch(() => {});
  }

  const { error } = await supabase
    .from("properties")
    .update({ brochure_url: brochure.url, brochure_public_id: brochure.publicId } as never)
    .eq("id", propertyId);

  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "set_brochure", "property", propertyId);
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { success: true };
}

export async function removePropertyBrochure(propertyId: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("properties")
    .select("brochure_public_id")
    .eq("id", propertyId)
    .maybeSingle();

  const prevId = (existing as { brochure_public_id: string | null } | null)?.brochure_public_id;
  if (prevId) await deleteCloudinaryAsset(prevId, "raw").catch(() => {});

  const { error } = await supabase
    .from("properties")
    .update({ brochure_url: null, brochure_public_id: null } as never)
    .eq("id", propertyId);

  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "remove_brochure", "property", propertyId);
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { success: true };
}
