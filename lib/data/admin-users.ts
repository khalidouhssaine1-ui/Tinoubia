import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}
