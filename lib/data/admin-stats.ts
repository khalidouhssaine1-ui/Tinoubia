import { createClient } from "@/lib/supabase/server";
import type { PropertyStatus } from "@/types";

export interface DashboardStats {
  total: number;
  byStatus: Record<PropertyStatus, number>;
  forSale: number;
  forRent: number;
  totalLeads: number;
  newLeads: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [{ count: total }, statusRows, { count: forSale }, { count: forRent }, { count: totalLeads }, { count: newLeads }] =
    await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("status"),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("listing_type", "sale"),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("listing_type", "rent"),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

  const byStatus: Record<string, number> = {
    draft: 0,
    available: 0,
    reserved: 0,
    rented: 0,
    sold: 0,
    archived: 0,
  };
  for (const row of statusRows.data ?? []) {
    const status = (row as { status: string }).status;
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  return {
    total: total ?? 0,
    byStatus: byStatus as Record<PropertyStatus, number>,
    forSale: forSale ?? 0,
    forRent: forRent ?? 0,
    totalLeads: totalLeads ?? 0,
    newLeads: newLeads ?? 0,
  };
}

export async function getMostViewedProperties(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("id, title, slug, views_count, status, listing_type")
    .order("views_count", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecentProperties(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("id, title, slug, status, listing_type, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
