import { createClient } from "@/lib/supabase/server";
import { toSafeSearchTerm } from "@/lib/utils";
import type {
  Feature,
  ListingType,
  Property,
  PropertyCategorySlug,
  PropertyFilters,
  PropertyWithRelations,
} from "@/types";

// Supabase/PostgREST only applies a `.eq('embed.column', ...)` filter as a true
// pre-aggregation join condition when the embed uses `!inner` — a plain embed
// silently ignores the filter. Build the select string per-query so we only
// pay for an inner join on the relations actually being filtered.
function buildPropertySelect(opts: { filterCategory?: boolean; filterCity?: boolean; filterNeighborhood?: boolean }) {
  return `
    *,
    property_type:property_types${opts.filterCategory ? "!inner" : ""}(*),
    city:cities${opts.filterCity ? "!inner" : ""}(*),
    neighborhood:neighborhoods${opts.filterNeighborhood ? "!inner" : ""}(*),
    country:countries(*),
    agent:agents(*),
    media:property_media(*),
    property_features(feature:features(*))
  `;
}

const PROPERTY_SELECT = buildPropertySelect({});

type RawPropertyRow = Property & {
  property_type: PropertyWithRelations["property_type"];
  city: PropertyWithRelations["city"];
  neighborhood: PropertyWithRelations["neighborhood"];
  country: PropertyWithRelations["country"];
  agent: PropertyWithRelations["agent"];
  media: PropertyWithRelations["media"];
  property_features: { feature: Feature }[];
};

function mapProperty(row: RawPropertyRow): PropertyWithRelations {
  return {
    ...row,
    media: [...(row.media ?? [])].sort((a, b) => a.position - b.position),
    features: (row.property_features ?? []).map((pf) => pf.feature).filter(Boolean),
  };
}

const PAGE_SIZE_DEFAULT = 12;

/** Amenity filters exposed in the listing UI; each maps to a `features.slug`. */
const AMENITY_FILTERS = ["pool", "garden", "terrace", "parking"] as const;
type AmenitySlug = (typeof AMENITY_FILTERS)[number];

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * IDs of properties that have every one of the given amenities. Amenities live
 * in the property_features join table, so they're resolved first and fed into
 * the main listing query as an id filter — that keeps pagination and the total
 * count correct (narrowing after `.range()` left pages short or empty). RLS on
 * property_features already limits this to publicly visible properties.
 */
async function getPropertyIdsWithAllFeatures(
  supabase: SupabaseServerClient,
  slugs: readonly AmenitySlug[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from("property_features")
    .select("property_id, feature:features!inner(slug)")
    .in("feature.slug", [...slugs]);
  if (error) throw error;

  const found = new Map<string, Set<string>>();
  for (const row of (data ?? []) as unknown as { property_id: string; feature: { slug: string } | null }[]) {
    if (!row.feature) continue;
    const set = found.get(row.property_id) ?? new Set<string>();
    set.add(row.feature.slug);
    found.set(row.property_id, set);
  }

  return [...found].filter(([, set]) => set.size === slugs.length).map(([id]) => id);
}

export interface QueryPropertiesResult {
  data: PropertyWithRelations[];
  count: number;
  page: number;
  pageSize: number;
}

export async function queryProperties(
  filters: PropertyFilters & { pageSize?: number },
): Promise<QueryPropertiesResult> {
  const supabase = await createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const select = buildPropertySelect({
    filterCategory: Boolean(filters.categorySlug),
    filterCity: Boolean(filters.citySlug),
    filterNeighborhood: Boolean(filters.neighborhoodSlug),
  });
  let query = supabase.from("properties").select(select, { count: "exact" });

  if (filters.listingType) query = query.eq("listing_type", filters.listingType);
  if (filters.rentalTerm) query = query.eq("rental_term", filters.rentalTerm);
  if (filters.categorySlug) query = query.eq("property_type.slug", filters.categorySlug);
  if (filters.citySlug) query = query.eq("city.slug", filters.citySlug);
  if (filters.neighborhoodSlug) query = query.eq("neighborhood.slug", filters.neighborhoodSlug);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.bathrooms) query = query.gte("bathrooms", filters.bathrooms);
  if (filters.minArea) query = query.gte("living_area", filters.minArea);
  if (filters.maxArea) query = query.lte("living_area", filters.maxArea);
  if (filters.furnished) query = query.eq("furnished", true);
  if (filters.featuredOnly) query = query.eq("featured", true);

  const search = filters.query ? toSafeSearchTerm(filters.query) : "";
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const amenities = AMENITY_FILTERS.filter((slug) => filters[slug]);
  if (amenities.length > 0) {
    const ids = await getPropertyIdsWithAllFeatures(supabase, amenities);
    if (ids.length === 0) return { data: [], count: 0, page, pageSize };
    query = query.in("id", ids);
  }

  if (filters.availableOnly) {
    query = query.eq("status", "available");
  } else {
    // Mirrors the properties_select RLS predicate for anon visitors: available
    // + reserved always show, sold/rented only when explicitly kept visible,
    // draft/archived never appear here regardless.
    query = query.or("status.in.(available,reserved),and(status.in.(sold,rented),show_when_unavailable.eq.true)");
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "area-asc":
      query = query.order("living_area", { ascending: true, nullsFirst: true });
      break;
    case "area-desc":
      query = query.order("living_area", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    data: ((data ?? []) as unknown as RawPropertyRow[]).map(mapProperty),
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyWithRelations[]> {
  const { data } = await queryProperties({ featuredOnly: true, sort: "newest", pageSize: limit });
  return data;
}

export async function getLatestProperties(limit = 8, listingType?: ListingType): Promise<PropertyWithRelations[]> {
  const { data } = await queryProperties({ listingType, sort: "newest", pageSize: limit });
  return data;
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProperty(data as unknown as RawPropertyRow);
}

export async function getSimilarProperties(property: Property, limit = 4): Promise<PropertyWithRelations[]> {
  const { data } = await queryProperties({
    listingType: property.listing_type,
    pageSize: limit * 4,
  });
  return data
    .filter((p) => p.id !== property.id)
    .sort((a, b) => {
      const score = (p: PropertyWithRelations) =>
        (p.property_type_id === property.property_type_id ? 2 : 0) +
        (p.city_id === property.city_id ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export async function incrementPropertyViews(propertyId: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_property_views", { p_property_id: propertyId });
}

export async function getCategoryCounts(): Promise<Record<PropertyCategorySlug, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("property_types").select("slug, properties(count)");
  const counts: Record<string, number> = { apartments: 0, villas: 0, riads: 0 };
  for (const row of data ?? []) {
    const rel = (row as unknown as { slug: string; properties: { count: number }[] }).properties;
    counts[row.slug] = rel?.[0]?.count ?? 0;
  }
  return counts as Record<PropertyCategorySlug, number>;
}

/** Slim query for sitemap generation — RLS already restricts this to publicly visible rows. */
export async function getAllPublicPropertySlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("properties").select("slug, updated_at");
  if (error) throw error;
  return data ?? [];
}
