import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/permissions";
import type { AgencyInfoInput } from "@/lib/validations/settings.schema";

export const metadata: Metadata = { title: "Settings" };

const DEFAULT_AGENCY_INFO: AgencyInfoInput = {
  name: "Tinoubia Immobilier",
  phone: "",
  whatsapp: "",
  email: "hmounayt17@gmail.com",
  address: "",
  instagram: "",
  facebook: "",
};

export default async function AdminSettingsPage() {
  await requireRole(["super_admin"]);
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", "agency_info").maybeSingle();

  const initial = { ...DEFAULT_AGENCY_INFO, ...(data?.value as Partial<AgencyInfoInput> | undefined) };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Settings</h1>
        <p className="text-sm text-muted-foreground">Agency contact details used across the public site.</p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
