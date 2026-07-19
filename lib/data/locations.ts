import { createClient } from "@/lib/supabase/server";
import type { City, Neighborhood } from "@/types";

export interface CityWithCount extends City {
  propertyCount: number;
}

export interface NeighborhoodWithCity extends Neighborhood {
  city: City;
  propertyCount: number;
}

export async function getCitiesWithCounts(): Promise<CityWithCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cities").select("*, properties(count)");
  if (error) throw error;
  return (data ?? [])
    .map((row) => ({
      ...(row as unknown as City),
      propertyCount: (row as unknown as { properties: { count: number }[] }).properties?.[0]?.count ?? 0,
    }))
    .sort((a, b) => b.propertyCount - a.propertyCount);
}

/** Only returns neighborhoods that currently have at least one visible property — used to decide which /properties/[location] pages actually exist. */
export async function getNeighborhoodsWithProperties(limit?: number): Promise<NeighborhoodWithCity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*, city:cities(*), properties(count)")
    .order("name");
  if (error) throw error;

  const mapped = (data ?? [])
    .map((row) => ({
      ...(row as unknown as Neighborhood & { city: City }),
      propertyCount: (row as unknown as { properties: { count: number }[] }).properties?.[0]?.count ?? 0,
    }))
    .filter((n) => n.propertyCount > 0)
    .sort((a, b) => b.propertyCount - a.propertyCount);

  return limit ? mapped.slice(0, limit) : mapped;
}

export async function getNeighborhoodBySlug(citySlug: string, neighborhoodSlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*, city:cities!inner(*)")
    .eq("slug", neighborhoodSlug)
    .eq("city.slug", citySlug)
    .maybeSingle();
  if (error) throw error;
  return data as (Neighborhood & { city: City }) | null;
}

export async function getCityBySlug(citySlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cities").select("*").eq("slug", citySlug).maybeSingle();
  if (error) throw error;
  return data as City | null;
}

export type LocationMatch =
  | { kind: "city"; city: CityWithCount }
  | { kind: "neighborhood"; neighborhood: NeighborhoodWithCity };

/**
 * Resolves a single flat slug (e.g. `/properties/marrakech` or
 * `/properties/gueliz`) to a city or neighborhood — but only if it currently
 * has at least one publicly visible property, per the "only create location
 * pages that have listings" rule. Returns null otherwise so the caller can
 * fall through to treating the slug as a property detail page.
 */
export async function resolveLocationSlug(slug: string): Promise<LocationMatch | null> {
  const [cities, neighborhoods] = await Promise.all([getCitiesWithCounts(), getNeighborhoodsWithProperties()]);

  const city = cities.find((c) => c.slug === slug && c.propertyCount > 0);
  if (city) return { kind: "city", city };

  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  if (neighborhood) return { kind: "neighborhood", neighborhood };

  return null;
}
