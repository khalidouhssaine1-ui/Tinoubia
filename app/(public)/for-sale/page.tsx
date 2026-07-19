import type { Metadata } from "next";
import { PropertyListingPage } from "@/components/properties/property-listing-page";
import { parseFiltersFromSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Properties for Sale",
  description: "Apartments, villas and riads for sale with Tinoubia Immobilier.",
  alternates: { canonical: "/for-sale" },
};

export default async function ForSalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = { ...parseFiltersFromSearchParams(await searchParams), listingType: "sale" as const };

  return (
    <PropertyListingPage
      title="Properties for Sale"
      subtitle="Apartments, villas and riads ready for their next owner."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "For Sale" }]}
      basePath="/for-sale"
      filters={filters}
      lockListingType
    />
  );
}
