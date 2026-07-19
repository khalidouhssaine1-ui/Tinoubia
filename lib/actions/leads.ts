"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { leadUpdateSchema, leadNoteSchema } from "@/lib/validations/lead.schema";
import type { ActionResult } from "@/lib/actions/properties";

export async function updateLead(id: string, input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = leadUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid lead update" };

  const supabase = await createClient();
  const { error, data } = await supabase.from("leads").update(parsed.data).eq("id", id).select("id").maybeSingle();
  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Not permitted or lead not found" };

  await logActivity(profile.id, "update_lead", "lead", id, parsed.data);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  return { success: true };
}

export async function addLeadNote(input: unknown): Promise<ActionResult> {
  const profile = await requireProfile();
  const parsed = leadNoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid note" };

  const supabase = await createClient();
  const { error } = await supabase.from("lead_notes").insert({ ...parsed.data, author_id: profile.id });
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "add_note", "lead", parsed.data.lead_id);
  revalidatePath(`/admin/leads/${parsed.data.lead_id}`);
  return { success: true };
}
