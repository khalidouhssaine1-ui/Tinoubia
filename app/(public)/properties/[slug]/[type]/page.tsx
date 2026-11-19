import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyListingPage } from "@/components/properties/property-listing-page";
import { parseFiltersFromSearchParams } from "@/lib/search-params";
import { getCategoryBySlug } from "@/lib/data/categories";
import type { ListingType } from "@/types";

const TYPES: Record<string, { listingType: ListingType; label: string }> = {
  "for-sale": { listingType: "sale", label: "for Sale" },
  "for-rent": { listingType: "rent", label: "for Rent" },
};

interface Params {
  slug: string;
  type: string;
}

async function resolveParams(params: Params) {
  const type = TYPES[params.type];
  if (!type) return null;
  const category = await getCategoryBySlug(params.slug);
  if (!category) return null;
  return { category: { slug: category.slug, label: category.name }, type };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const rawParams = await params;
  const resolved = await resolveParams(rawParams);
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
  const resolved = await resolveParams(await params);
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
