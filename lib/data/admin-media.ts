import { createClient } from "@/lib/supabase/server";

export async function getAllMedia(query?: string) {
  const supabase = await createClient();
  let q = supabase
    .from("property_media")
    .select("*, property:properties!inner(id, title, slug)")
    .order("created_at", { ascending: false });

  if (query) {
    q = q.ilike("property.title", `%${query}%`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}
