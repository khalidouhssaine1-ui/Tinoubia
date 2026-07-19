"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { featureSchema } from "@/lib/validations/location.schema";
import type { ActionResult } from "@/lib/actions/properties";

const MANAGERS = ["super_admin", "admin"] as const;

export async function updatePropertyTypeMeta(id: string, name: string, icon: string): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const supabase = await createClient();

  const { error } = await supabase.from("property_types").update({ name, icon }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "update", "property_type", id, { name, icon });
  revalidatePath("/admin/categories");
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
