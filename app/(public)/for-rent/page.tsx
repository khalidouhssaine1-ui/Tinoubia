import type { Metadata } from "next";
import { PropertyListingPage } from "@/components/properties/property-listing-page";
import { parseFiltersFromSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Properties for Rent",
  description: "Furnished and unfurnished apartments, villas and riads for rent with Tinoubia Immobilier.",
  alternates: { canonical: "/for-rent" },
};

export default async function ForRentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = { ...parseFiltersFromSearchParams(await searchParams), listingType: "rent" as const };

  return (
    <PropertyListingPage
      title="Properties for Rent"
      subtitle="Furnished and unfurnished homes available now."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "For Rent" }]}
      basePath="/for-rent"
      filters={filters}
      lockListingType
    />
  );
}
