import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyListingPage } from "@/components/properties/property-listing-page";
import { parseFiltersFromSearchParams } from "@/lib/search-params";
import type { ListingType, PropertyCategorySlug } from "@/types";

const CATEGORIES: Record<string, { slug: PropertyCategorySlug; label: string }> = {
  apartments: { slug: "apartments", label: "Apartments" },
  villas: { slug: "villas", label: "Villas" },
  riads: { slug: "riads", label: "Riads" },
};

const TYPES: Record<string, { listingType: ListingType; label: string }> = {
  "for-sale": { listingType: "sale", label: "for Sale" },
  "for-rent": { listingType: "rent", label: "for Rent" },
};

interface Params {
  slug: string;
  type: string;
}

function resolveParams(params: Params) {
  const category = CATEGORIES[params.slug];
  const type = TYPES[params.type];
  if (!category || !type) return null;
  return { category, type };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const rawParams = await params;
  const resolved = resolveParams(rawParams);
  if (!resolved) return {};
  return {
    title: `${resolved.category.label} ${resolved.type.label}`,
    description: `${resolved.category.label} ${resolved.type.label} in Marrakech with Tinoubia Immobilier.`,
    alternates: { canonical: `/properties/${rawParams.slug}/${rawParams.type}` },
  };
}

export default async function CategoryListingPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = resolveParams(await params);
  if (!resolved) notFound();
  const { category, type } = resolved;

  const filters = {
    ...parseFiltersFromSearchParams(await searchParams),
    categorySlug: category.slug,
    listingType: type.listingType,
  };

  const rawParams = await params;

  return (
    <PropertyListingPage
      title={`${category.label} ${type.label}`}
      subtitle={`Browse ${category.label.toLowerCase()} ${type.label.toLowerCase()} in Marrakech.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Properties", href: "/properties" },
        { label: `${category.label} ${type.label}` },
      ]}
      basePath={`/properties/${rawParams.slug}/${rawParams.type}`}
      filters={filters}
      lockListingType
      lockCategory
    />
  );
}
