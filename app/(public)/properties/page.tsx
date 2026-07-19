import type { Metadata } from "next";
import { PropertyListingPage } from "@/components/properties/property-listing-page";
import { parseFiltersFromSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "All Properties",
  description: "Browse every apartment, villa and riad currently available with Tinoubia Immobilier.",
  alternates: { canonical: "/properties" },
};

export default async function AllPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFiltersFromSearchParams(await searchParams);

  return (
    <PropertyListingPage
      title="All Properties"
      subtitle="Every apartment, villa and riad currently available with Tinoubia Immobilier."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Properties" }]}
      basePath="/properties"
      filters={filters}
    />
  );
}
