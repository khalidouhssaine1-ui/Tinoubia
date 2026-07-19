"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus, Pencil, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { inviteUser, setUserActive, updateUserRole, updateUserProfile } from "@/lib/actions/users";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

const ROLES: UserRole[] = ["super_admin", "admin", "agent", "editor"];

const ROLE_STYLES: Record<UserRole, string> = {
  super_admin: "bg-bronze/15 text-bronze border-bronze/20",
  admin: "bg-olive/15 text-olive border-olive/20",
  agent: "bg-sand/25 text-charcoal border-sand/40",
  editor: "bg-muted text-muted-foreground border-border",
};

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UsersManager({
  users: initialUsers,
  currentUserId,
  hasServiceRole,
}: {
  users: Profile[];
  currentUserId: string;
  hasServiceRole: boolean;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", role: "agent" as UserRole });
  const [isPending, startTransition] = useTransition();
  const [isEditPending, startEditTransition] = useTransition();

  function handleInvite() {
    if (!form.full_name.trim() || !form.email.trim()) return;
    startTransition(async () => {
      const result = await inviteUser(form);
      if (result.success && result.id) {
        setUsers((prev) => [
          { id: result.id!, full_name: form.full_name, email: form.email, role: form.role, phone: null, avatar_url: null, is_active: true, created_at: new Date().toISOString() },
          ...prev,
        ]);
        toast.success("Invite sent — they'll receive an email to set their password.");
        setOpen(false);
        setForm({ full_name: "", email: "", role: "agent" });
      } else {
        toast.error(result.error || "Could not create user");
      }
    });
  }

  function handleRoleChange(id: string, role: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: role as UserRole } : u)));
    startTransition(async () => {
      const result = await updateUserRole(id, role);
      if (!result.success) toast.error(result.error || "Could not update role");
    });
  }

  function handleToggleActive(id: string, active: boolean) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: active } : u)));
    startTransition(async () => {
      const result = await setUserActive(id, active);
      if (!result.success) toast.error(result.error || "Could not update status");
    });
  }

  function openEdit(user: Profile) {
    setEditingUser(user);
    setEditName(user.full_name || "");
  }

  function handleSaveName() {
    if (!editingUser) return;
    const id = editingUser.id;
    startEditTransition(async () => {
      const result = await updateUserProfile(id, editName);
      if (result.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, full_name: editName.trim() } : u)));
        toast.success("Name updated");
        setEditingUser(null);
      } else {
        toast.error(result.error || "Could not update name");
      }
    });
  }

  return (
    <div className="space-y-4">
      {!hasServiceRole && (
        <div className="flex items-start gap-3 rounded-2xl border border-bronze/30 bg-bronze/10 p-4 text-sm text-charcoal">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-bronze" />
          <p>
            Inviting new users needs <code className="rounded bg-bronze/15 px-1 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> configured
            on the server. Add it to your environment (Supabase Dashboard → Project Settings → API → service_role secret) to
            enable the button below.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersIcon className="size-4" />
          {users.length} team {users.length === 1 ? "member" : "members"}
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-1.5 bg-bronze text-white hover:bg-bronze/90" disabled={!hasServiceRole} />}>
            <UserPlus className="size-4" /> Add User
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a new user</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInvite} disabled={isPending} className="w-full bg-bronze text-white hover:bg-bronze/90">
                {isPending ? "Sending invite..." : "Send Invite"}
              </Button>
              <p className="text-xs text-muted-foreground">
                They&apos;ll get an email with a link to set their own password — no password is created or shared by you.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-medium text-ivory">
                {initials(u.full_name, u.email)}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium text-charcoal">
                  <span className="truncate">{u.full_name || "—"}</span>
                  {u.id === currentUserId && <Badge variant="secondary">You</Badge>}
                  <button
                    onClick={() => openEdit(u)}
                    className="text-muted-foreground transition-colors hover:text-bronze"
                    aria-label="Edit name"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </p>
                <p className="truncate text-sm text-muted-foreground">{u.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Badge variant="outline" className={cn("capitalize", ROLE_STYLES[u.role])}>
                {u.role.replace("_", " ")}
              </Badge>
              <Select value={u.role} onValueChange={(v) => v && handleRoleChange(u.id, v)} disabled={u.id === currentUserId}>
                <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  checked={u.is_active}
                  onCheckedChange={(v) => handleToggleActive(u.id, v)}
                  disabled={u.id === currentUserId}
                />
                <span className="text-xs text-muted-foreground">{u.is_active ? "Active" : "Disabled"}</span>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <UsersIcon className="size-8 text-muted-foreground" />
            <p className="mt-3 font-medium text-charcoal">No team members yet</p>
            <p className="text-sm text-muted-foreground">Invite your first staff account to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingUser} onOpenChange={(v) => !v && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit name</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Full Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName} disabled={isEditPending} className="bg-bronze text-white hover:bg-bronze/90">
              {isEditPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
