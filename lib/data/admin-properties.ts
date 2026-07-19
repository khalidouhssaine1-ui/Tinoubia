import { createClient } from "@/lib/supabase/server";

export interface AdminPropertyFilters {
  status?: string;
  listingType?: string;
  query?: string;
  page?: number;
}

export async function getAdminProperties(filters: AdminPropertyFilters = {}) {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("properties")
    .select("id, title, reference, slug, listing_type, rental_term, status, price, currency, featured, views_count, city:cities(name)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.listingType) query = query.eq("listing_type", filters.listingType);
  if (filters.query) query = query.ilike("title", `%${filters.query}%`);

  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) throw error;

  return { data: data ?? [], count: count ?? 0, page, pageSize };
}
