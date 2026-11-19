import { createClient } from "@/lib/supabase/server";
import { toSafeSearchTerm } from "@/lib/utils";
import type { Agent, Lead, LeadNote, Profile, Property } from "@/types";

export interface LeadFilters {
  status?: string;
  query?: string;
}

export async function getLeads(filters: LeadFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("*, property:properties(id, title, slug), assigned_agent:agents(id, name)")
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  const search = filters.query ? toSafeSearchTerm(filters.query) : "";
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLeadById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, property:properties(id, title, slug, reference), assigned_agent:agents(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as (Lead & { property: Pick<Property, "id" | "title" | "slug" | "reference"> | null; assigned_agent: Agent | null }) | null;
}

export async function getLeadNotes(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*, author:profiles(full_name, email)")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as (LeadNote & { author: Pick<Profile, "full_name" | "email"> | null })[];
}
