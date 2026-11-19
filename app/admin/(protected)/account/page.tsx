import type { Metadata } from "next";
import { requireProfile } from "@/lib/permissions";
import { NewPasswordForm } from "@/components/admin/new-password-form";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const profile = await requireProfile();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your sign-in details for the admin.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="text-charcoal">{profile.full_name || "—"}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="break-all text-charcoal">{profile.email}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="capitalize text-charcoal">{profile.role.replace("_", " ")}</dd>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg text-charcoal">Change Password</h2>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">
          At least 8 characters. You stay signed in on this device after changing it.
        </p>
        <NewPasswordForm />
      </div>
    </div>
  );
}
