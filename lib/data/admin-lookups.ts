import { createClient } from "@/lib/supabase/server";
import type { Agent, City, Country, Feature, Neighborhood, PropertyType } from "@/types";

export async function getPropertyTypesLookup(): Promise<PropertyType[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("property_types").select("*").order("name");
  return (data ?? []) as PropertyType[];
}

export async function getFeaturesLookup(): Promise<Feature[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("features").select("*").order("name");
  return data ?? [];
}

export async function getCountriesLookup(): Promise<Country[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("countries").select("*").order("name");
  return data ?? [];
}

export async function getCitiesLookup(): Promise<City[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("*").order("name");
  return data ?? [];
}

export async function getNeighborhoodsLookup(): Promise<Neighborhood[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("neighborhoods").select("*").order("name");
  return data ?? [];
}

export async function getAgentsLookup(): Promise<Agent[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("agents").select("*").eq("is_active", true).order("name");
  return data ?? [];
}
