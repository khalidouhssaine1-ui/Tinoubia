"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Star, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { setPropertyFeatured } from "@/lib/actions/properties";
import { formatPrice, LISTING_TYPE_LABEL, PROPERTY_STATUS_LABEL, RENTAL_TERM_LABEL } from "@/lib/utils";

export interface Row {
  id: string;
  title: string;
  reference: string | null;
  slug: string;
  listing_type: "sale" | "rent";
  rental_term: "short_term" | "long_term" | null;
  status: string;
  price: number;
  currency: string;
  featured: boolean;
  views_count: number;
  city?: { name: string } | null;
}

export function PropertiesTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Views</th>
            <th className="px-4 py-3 font-medium">Featured</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <RowItem key={row.id} row={row} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No properties yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RowItem({ row }: { row: Row }) {
  const [featured, setFeatured] = useState(row.featured);
  const [, startTransition] = useTransition();

  return (
    <tr>
      <td className="px-4 py-3">
        <Link href={`/admin/properties/${row.id}/edit`} className="font-medium text-charcoal hover:text-bronze">
          {row.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          {row.reference} {row.city ? `· ${row.city.name}` : ""}
        </p>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {LISTING_TYPE_LABEL[row.listing_type]}
        {row.listing_type === "rent" && row.rental_term && (
          <span className="block text-xs">{RENTAL_TERM_LABEL[row.rental_term]}</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{formatPrice(row.price, row.currency)}</td>
      <td className="px-4 py-3">
        <Badge variant="secondary">{PROPERTY_STATUS_LABEL[row.status] ?? row.status}</Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{row.views_count}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={featured}
            onCheckedChange={(v) => {
              setFeatured(v);
              startTransition(async () => {
                const result = await setPropertyFeatured(row.id, v);
                if (!result.success) {
                  setFeatured(!v);
                  toast.error(result.error || "Could not update");
                }
              });
            }}
          />
          {featured && <Star className="size-3.5 fill-bronze text-bronze" />}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <Link href={`/admin/properties/${row.id}/edit`} className="inline-flex items-center gap-1 text-xs font-medium text-bronze hover:underline">
          <Pencil className="size-3.5" /> Edit
        </Link>
      </td>
    </tr>
  );
}
