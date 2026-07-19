"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { userInviteSchema } from "@/lib/validations/auth.schema";
import type { ActionResult } from "@/lib/actions/properties";

const MISSING_SERVICE_ROLE_ERROR =
  "SUPABASE_SERVICE_ROLE_KEY is not configured on the server — add it to your environment (Supabase Dashboard → Project Settings → API → service_role secret) to create staff accounts.";

export async function inviteUser(input: unknown): Promise<ActionResult> {
  const profile = await requireRole(["super_admin"]);
  const parsed = userInviteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid user details" };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: MISSING_SERVICE_ROLE_ERROR };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Sends a real Supabase invite email with a link for the new user to set
  // their own password — no temporary/plaintext password ever passes through
  // our server or client.
  const { data: created, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { full_name: parsed.data.full_name },
    redirectTo: `${siteUrl}/admin/login`,
  });

  if (error || !created.user) return { success: false, error: error?.message ?? "Could not invite user" };

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    role: parsed.data.role,
    is_active: true,
  });

  if (profileError) return { success: false, error: profileError.message };

  await logActivity(profile.id, "invite_user", "profile", created.user.id, { email: parsed.data.email, role: parsed.data.role });
  revalidatePath("/admin/users");
  return { success: true, id: created.user.id };
}

export async function updateUserRole(id: string, role: string): Promise<ActionResult> {
  const profile = await requireRole(["super_admin"]);
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "update_role", "profile", id, { role });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserProfile(id: string, fullName: string): Promise<ActionResult> {
  const profile = await requireRole(["super_admin"]);
  const name = fullName.trim();
  if (name.length < 2) return { success: false, error: "Name is too short" };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "update_profile", "profile", id, { full_name: name });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserActive(id: string, isActive: boolean): Promise<ActionResult> {
  const profile = await requireRole(["super_admin"]);
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, isActive ? "activate_user" : "deactivate_user", "profile", id);
  revalidatePath("/admin/users");
  return { success: true };
}
