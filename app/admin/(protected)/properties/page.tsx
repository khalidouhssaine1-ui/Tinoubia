import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertiesTable, type Row } from "@/components/admin/properties/properties-table";
import { getAdminProperties } from "@/lib/data/admin-properties";

export const metadata: Metadata = { title: "Properties" };

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const listingType = typeof sp.listingType === "string" ? sp.listingType : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const { data, count } = await getAdminProperties({ status, listingType, query: q });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-charcoal">Properties</h1>
          <p className="text-sm text-muted-foreground">{count} total properties</p>
        </div>
        <Button render={<Link href="/admin/properties/new" />} nativeButton={false} className="gap-1.5 bg-bronze text-white hover:bg-bronze/90">
          <Plus className="size-4" /> Add Property
        </Button>
      </div>

      <PropertiesTable rows={data as unknown as Row[]} />
    </div>
  );
}
