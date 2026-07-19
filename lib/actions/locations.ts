"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { countrySchema, citySchema, neighborhoodSchema } from "@/lib/validations/location.schema";
import type { ActionResult } from "@/lib/actions/properties";

const MANAGERS = ["super_admin", "admin"] as const;

export async function createCountry(input: unknown): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const parsed = countrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid country" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("countries").insert(parsed.data).select("id").single();
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "create", "country", data.id, parsed.data);
  revalidatePath("/admin/locations");
  return { success: true, id: data.id };
}

export async function createCity(input: unknown): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const parsed = citySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid city" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("cities").insert(parsed.data).select("id").single();
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "create", "city", data.id, parsed.data);
  revalidatePath("/admin/locations");
  return { success: true, id: data.id };
}

export async function createNeighborhood(input: unknown): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const parsed = neighborhoodSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid neighborhood" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("neighborhoods").insert(parsed.data).select("id").single();
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "create", "neighborhood", data.id, parsed.data);
  revalidatePath("/admin/locations");
  return { success: true, id: data.id };
}

export async function deleteLocation(
  table: "countries" | "cities" | "neighborhoods",
  id: string,
): Promise<ActionResult> {
  const profile = await requireRole([...MANAGERS]);
  const supabase = await createClient();

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    return {
      success: false,
      error: error.code === "23503" ? "Cannot delete — still in use by existing properties." : error.message,
    };
  }

  await logActivity(profile.id, "delete", table.slice(0, -1), id);
  revalidatePath("/admin/locations");
  return { success: true };
}
