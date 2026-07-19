"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { agencyInfoSchema } from "@/lib/validations/settings.schema";
import type { ActionResult } from "@/lib/actions/properties";

export async function updateAgencyInfo(input: unknown): Promise<ActionResult> {
  const profile = await requireRole(["super_admin"]);
  const parsed = agencyInfoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid settings" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "agency_info", value: parsed.data, updated_at: new Date().toISOString() });

  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "update_settings", "settings", null, { key: "agency_info" });
  revalidatePath("/admin/settings");
  return { success: true };
}
