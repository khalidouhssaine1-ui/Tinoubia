"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agencyInfoSchema, type AgencyInfoInput } from "@/lib/validations/settings.schema";
import { updateAgencyInfo } from "@/lib/actions/settings";

export function SettingsForm({ initial }: { initial: AgencyInfoInput }) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgencyInfoInput>({ resolver: zodResolver(agencyInfoSchema), defaultValues: initial });

  async function onSubmit(values: AgencyInfoInput) {
    setSaving(true);
    const result = await updateAgencyInfo(values);
    setSaving(false);
    if (result.success) toast.success("Settings saved");
    else toast.error(result.error || "Could not save settings");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5 rounded-2xl border border-border bg-card p-6">
      <Field label="Agency Name" error={errors.name?.message}><Input {...register("name")} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone"><Input {...register("phone")} /></Field>
        <Field label="WhatsApp Number"><Input {...register("whatsapp")} /></Field>
      </div>
      <Field label="Contact Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
      <Field label="Address"><Input {...register("address")} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Instagram URL"><Input {...register("instagram")} /></Field>
        <Field label="Facebook URL"><Input {...register("facebook")} /></Field>
      </div>
      <Button type="submit" disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
