import { PageBanner } from "@/components/shared/page-banner";
import { PropertyFiltersPanel } from "@/components/properties/property-filters";
import { PropertyToolbar } from "@/components/properties/property-toolbar";
import { PropertyResults } from "@/components/properties/property-results";
import { PaginationControls } from "@/components/properties/pagination-controls";
import { queryPropertiesWithAmenities } from "@/lib/data/properties";
import type { PropertyFilters } from "@/types";

interface Crumb {
  label: string;
  href?: string;
}

export async function PropertyListingPage({
  title,
  subtitle,
  breadcrumbs,
  basePath,
  filters,
  lockListingType = false,
  lockCategory = false,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs: Crumb[];
  basePath: string;
  filters: PropertyFilters;
  lockListingType?: boolean;
  lockCategory?: boolean;
}) {
  const { data, count, page, pageSize } = await queryPropertiesWithAmenities({ ...filters, pageSize: 12 });
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <>
      <PageBanner title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />

      <div className="container-luxe section-y !pt-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <PropertyFiltersPanel
            basePath={basePath}
            filters={filters}
            lockListingType={lockListingType}
            lockCategory={lockCategory}
          />

          <div className="min-w-0 flex-1">
            <PropertyToolbar basePath={basePath} total={count} view={filters.view ?? "grid"} sort={filters.sort ?? "newest"} />

            <div className="mt-6">
              <PropertyResults properties={data} view={filters.view} />
            </div>

            <div className="mt-10 flex justify-center">
              <PaginationControls basePath={basePath} page={page} totalPages={totalPages} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
