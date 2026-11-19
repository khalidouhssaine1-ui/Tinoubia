import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { PropertyType } from "@/types";

/** Shown on a category card when the category has no image of its own. */
export const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";

export function sortCategories<T extends Pick<PropertyType, "name" | "sort_order">>(categories: T[]): T[] {
  return [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name));
}

/**
 * Every property category, in the order set in the admin. Cached per request,
 * so the header, footer, filters and page can all call it for one query.
 * Never throws: on a database error it logs and returns [] so the site's
 * chrome (header/footer) still renders.
 */
export const getCategories = cache(async (): Promise<PropertyType[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("property_types").select("*");
  if (error) {
    console.error("[categories] failed to load property types", error);
    return [];
  }
  return sortCategories((data ?? []) as PropertyType[]);
});

export async function getCategoryBySlug(slug: string): Promise<PropertyType | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}
