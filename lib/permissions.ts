import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

export { ROLE_HIERARCHY, canDeleteProperties, canManageUsers, canManageAllLeads, canManageAllProperties } from "@/lib/role-utils";

/**
 * Server-side session + role check used at the top of every admin Server
 * Action and route handler. RLS enforces the same rules at the database
 * level, but mutations must never rely on the client having hidden a button —
 * this is the actual gate.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile | null) ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    redirect("/admin/login");
  }
  return profile;
}

/** Throws (never silently no-ops) so callers can't forget to handle denial. */
export async function requireRole(allowed: UserRole[]): Promise<Profile> {
  const profile = await requireProfile();
  if (!allowed.includes(profile.role)) {
    throw new Error("FORBIDDEN: insufficient role for this action");
  }
  return profile;
}
