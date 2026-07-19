import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/users-manager";
import { getUsers } from "@/lib/data/admin-users";
import { requireRole } from "@/lib/permissions";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const profile = await requireRole(["super_admin"]);
  const users = await getUsers();
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Users</h1>
        <p className="text-sm text-muted-foreground">Manage staff accounts and roles.</p>
      </div>
      <UsersManager users={users} currentUserId={profile.id} hasServiceRole={hasServiceRole} />
    </div>
  );
}
