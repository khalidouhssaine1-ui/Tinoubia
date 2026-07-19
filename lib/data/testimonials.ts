import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";

export async function getTestimonials(featuredOnly = false): Promise<Testimonial[]> {
  const supabase = await createClient();
  let query = supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (featuredOnly) query = query.eq("featured", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
