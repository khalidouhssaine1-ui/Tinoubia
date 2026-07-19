import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyListingPage } from "@/components/properties/property-listing-page";
import { PropertyDetail } from "@/components/property-detail/property-detail";
import { parseFiltersFromSearchParams } from "@/lib/search-params";
import { resolveLocationSlug } from "@/lib/data/locations";
import { getPropertyBySlug } from "@/lib/data/properties";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: { params: Props["params"] }): Promise<Metadata> {
  const { slug } = await params;

  const location = await resolveLocationSlug(slug);
  if (location) {
    const label = location.kind === "city" ? location.city.name : location.neighborhood.name;
    return {
      title: `Properties in ${label}`,
      description: `Apartments, villas and riads available in ${label}, Marrakech.`,
      alternates: { canonical: `/properties/${slug}` },
    };
  }

  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const cover = property.media.find((m) => m.is_cover) ?? property.media[0];

  return {
    title: property.seo_title || property.title,
    description: property.seo_description || property.description?.slice(0, 160),
    alternates: { canonical: `/properties/${slug}` },
    openGraph: {
      type: "website",
      images: property.og_image ? [property.og_image] : cover ? [cover.secure_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: property.og_image ? [property.og_image] : cover ? [cover.secure_url] : undefined,
    },
  };
}

export default async function SlugRouterPage({ params, searchParams }: Props) {
  const { slug } = await params;

  const location = await resolveLocationSlug(slug);
  if (location) {
    const sp = await searchParams;
    const label = location.kind === "city" ? location.city.name : location.neighborhood.name;
    const filters =
      location.kind === "city"
        ? { ...parseFiltersFromSearchParams(sp), citySlug: location.city.slug }
        : { ...parseFiltersFromSearchParams(sp), neighborhoodSlug: location.neighborhood.slug };

    return (
      <PropertyListingPage
        title={`Properties in ${label}`}
        subtitle={`Explore apartments, villas and riads available in ${label}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Properties", href: "/properties" }, { label }]}
        basePath={`/properties/${slug}`}
        filters={filters}
      />
    );
  }

  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  return <PropertyDetail property={property} />;
}
