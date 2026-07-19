import type { Metadata } from "next";
import { requireProfile } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar role={profile.role} className="hidden w-64 shrink-0 lg:sticky lg:top-0 lg:flex lg:h-screen" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar profile={profile} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
