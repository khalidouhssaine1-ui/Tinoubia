import { createClient } from "@/lib/supabase/server";
import type { InstagramVideo } from "@/types";

export async function getInstagramVideos(limit?: number): Promise<InstagramVideo[]> {
  const supabase = await createClient();
  let query = supabase
    .from("instagram_videos")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as InstagramVideo[];
}
