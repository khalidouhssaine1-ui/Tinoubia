import { createClient } from "@/lib/supabase/server";

export async function getActivityLogs(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, actor:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
