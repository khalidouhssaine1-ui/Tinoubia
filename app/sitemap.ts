import type { MetadataRoute } from "next";
import { getAllPublicPropertySlugs } from "@/lib/data/properties";
import { getCitiesWithCounts, getNeighborhoodsWithProperties } from "@/lib/data/locations";
import { getCategories } from "@/lib/data/categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const TYPES = ["for-sale", "for-rent"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, cities, neighborhoods, categories] = await Promise.all([
    getAllPublicPropertySlugs(),
    getCitiesWithCounts(),
    getNeighborhoodsWithProperties(),
    getCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/for-sale`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/for-rent`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((category) =>
    TYPES.map((type) => ({
      url: `${SITE_URL}/properties/${category.slug}/${type}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  );

  const locationRoutes: MetadataRoute.Sitemap = [
    ...cities.filter((c) => c.propertyCount > 0).map((c) => ({
      url: `${SITE_URL}/properties/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...neighborhoods.map((n) => ({
      url: `${SITE_URL}/properties/${n.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${SITE_URL}/properties/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...locationRoutes, ...propertyRoutes];
}
