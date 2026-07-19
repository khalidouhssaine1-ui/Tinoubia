import type { PropertyFilters } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

function str(params: SearchParams, key: string): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

function num(params: SearchParams, key: string): number | undefined {
  const v = str(params, key);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function bool(params: SearchParams, key: string): boolean | undefined {
  const v = str(params, key);
  return v === "true" ? true : undefined;
}

/** Parses the shared filter query-string contract used by every listing route. */
export function parseFiltersFromSearchParams(params: SearchParams): PropertyFilters {
  return {
    listingType: str(params, "listingType") as PropertyFilters["listingType"],
    rentalTerm: str(params, "rentalTerm") as PropertyFilters["rentalTerm"],
    categorySlug: str(params, "category") as PropertyFilters["categorySlug"],
    citySlug: str(params, "city"),
    neighborhoodSlug: str(params, "neighborhood"),
    minPrice: num(params, "minPrice"),
    maxPrice: num(params, "maxPrice"),
    bedrooms: num(params, "bedrooms"),
    bathrooms: num(params, "bathrooms"),
    minArea: num(params, "minArea"),
    maxArea: num(params, "maxArea"),
    furnished: bool(params, "furnished"),
    pool: bool(params, "pool"),
    garden: bool(params, "garden"),
    terrace: bool(params, "terrace"),
    parking: bool(params, "parking"),
    availableOnly: bool(params, "availableOnly"),
    featuredOnly: bool(params, "featured"),
    query: str(params, "q"),
    sort: (str(params, "sort") as PropertyFilters["sort"]) ?? "newest",
    view: (str(params, "view") as PropertyFilters["view"]) ?? "grid",
    page: num(params, "page") ?? 1,
  };
}
