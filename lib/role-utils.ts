import type { UserRole } from "@/types";

// Pure role-check helpers with no server dependencies — safe to import from
// Client Components (e.g. to conditionally render a delete button). The
// actual enforcement always happens server-side via requireRole()/RLS;
// these are for UI convenience only.

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 4,
  admin: 3,
  agent: 2,
  editor: 1,
};

export function canDeleteProperties(role: UserRole) {
  return role === "super_admin" || role === "admin";
}

export function canManageUsers(role: UserRole) {
  return role === "super_admin";
}

export function canManageAllLeads(role: UserRole) {
  return role === "super_admin" || role === "admin";
}

export function canManageAllProperties(role: UserRole) {
  return role === "super_admin" || role === "admin" || role === "editor";
}
