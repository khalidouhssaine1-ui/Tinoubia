"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { featureSchema } from "@/lib/validations/location.schema";
import { categorySchema } from "@/lib/validations/category.schema";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/properties";

const MANAGERS = ["super_admin", "admin"] as const;

/** Categories show up in the public menu, footer, filters and homepage. */
function revalidateCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function createPropertyType(input: unknown): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };

  const slug = slugify(parsed.data.name);
  if (!slug) return { success: false, error: "The name needs at least one letter or number." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_types")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { success: false, error: "A category with this name already exists." };
    return { success: false, error: error.message };
  }

  await logActivity(profile.id, "create", "property_type", data.id, { ...parsed.data, slug });
  revalidateCategoryPages();
  return { success: true, id: data.id };
}

/**
 * Updates a category's name, description, photo and order. The slug (its URL)
 * is kept as-is so existing links and search results keep working.
 */
export async function updatePropertyType(id: string, input: unknown): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };

  const supabase = await createClient();
  const { error } = await supabase.from("property_types").update(parsed.data).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "update", "property_type", id, parsed.data);
  revalidateCategoryPages();
  return { success: true };
}

export async function deletePropertyType(id: string): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("property_type_id", id);
  if (countError) return { success: false, error: countError.message };
  if (count) {
    return {
      success: false,
      error: `${count} ${count === 1 ? "property uses" : "properties use"} this category. Move ${count === 1 ? "it" : "them"} to another category first.`,
    };
  }

  const { error } = await supabase.from("property_types").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "delete", "property_type", id);
  revalidateCategoryPages();
  return { success: true };
}

export async function createFeature(input: unknown): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const parsed = featureSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid feature" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("features").insert(parsed.data).select("id").single();
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "create", "feature", data.id, parsed.data);
  revalidatePath("/admin/categories");
  return { success: true, id: data.id };
}

export async function deleteFeature(id: string): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const supabase = await createClient();

  const { error } = await supabase.from("features").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "delete", "feature", id);
  revalidatePath("/admin/categories");
  return { success: true };
}
