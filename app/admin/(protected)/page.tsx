import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Home, KeyRound, ShoppingBag, Inbox, MailPlus, FileEdit, Star, Eye } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { StatusChart } from "@/components/admin/status-chart";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getMostViewedProperties, getRecentProperties } from "@/lib/data/admin-stats";
import { LISTING_TYPE_LABEL, PROPERTY_STATUS_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, mostViewed, recent] = await Promise.all([
    getDashboardStats(),
    getMostViewedProperties(),
    getRecentProperties(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your property portfolio and enquiries.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total Properties" value={stats.total} icon={Building2} tone="bronze" />
        <StatCard label="Property Page Views" value={stats.totalViews} icon={Eye} tone="bronze" />
        <StatCard label="Available" value={stats.byStatus.available} icon={Home} />
        <StatCard label="Reserved" value={stats.byStatus.reserved} icon={FileEdit} />
        <StatCard label="Rented" value={stats.byStatus.rented} icon={KeyRound} />
        <StatCard label="Sold" value={stats.byStatus.sold} icon={ShoppingBag} />
        <StatCard label="Draft" value={stats.byStatus.draft} icon={FileEdit} />
        <StatCard label="For Sale" value={stats.forSale} icon={Building2} tone="olive" />
        <StatCard label="For Rent" value={stats.forRent} icon={KeyRound} tone="olive" />
        <StatCard label="Total Enquiries" value={stats.totalLeads} icon={Inbox} tone="bronze" />
        <StatCard label="New Enquiries" value={stats.newLeads} icon={MailPlus} tone="bronze" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg text-charcoal">Properties by Status</h2>
          <StatusChart byStatus={stats.byStatus} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-heading text-lg text-charcoal">
            <Star className="size-4 text-bronze" /> Most Viewed Properties
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {mostViewed.length === 0 && <p className="py-4 text-sm text-muted-foreground">No views recorded yet.</p>}
            {mostViewed.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/admin/properties/${p.id}/edit`} className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal hover:text-bronze">
                  {p.title}
                </Link>
                <span className="text-xs text-muted-foreground">{p.views_count} views</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg text-charcoal">Recently Added</h2>
          <Link href="/admin/properties" className="text-sm font-medium text-bronze hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5">
                    <Link href={`/admin/properties/${p.id}/edit`} className="font-medium text-charcoal hover:text-bronze">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{LISTING_TYPE_LABEL[p.listing_type as "sale" | "rent"]}</td>
                  <td className="py-2.5">
                    <Badge variant="secondary">{PROPERTY_STATUS_LABEL[p.status]}</Badge>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
