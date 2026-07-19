import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadsTable, type Row } from "@/components/admin/leads/leads-table";
import { getLeads } from "@/lib/data/admin-leads";

export const metadata: Metadata = { title: "Leads" };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const leads = await getLeads({ status, query: q });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-charcoal">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} enquiries</p>
        </div>
        <Button
          render={<a href="/api/admin/leads/export" />}
          nativeButton={false}
          variant="outline"
          className="gap-1.5"
        >
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <form className="max-w-sm">
        <Input name="q" defaultValue={q} placeholder="Search by name, email or phone..." />
      </form>

      <LeadsTable rows={leads as unknown as Row[]} />
    </div>
  );
}
