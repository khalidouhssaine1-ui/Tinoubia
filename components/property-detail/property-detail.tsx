import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { PageBanner } from "@/components/shared/page-banner";
import { Gallery } from "@/components/property-detail/gallery";
import { InfoTable } from "@/components/property-detail/info-table";
import { AmenitiesList } from "@/components/property-detail/amenities-list";
import { AgentCard } from "@/components/property-detail/agent-card";
import { ShareButtons } from "@/components/property-detail/share-buttons";
import { PropertyMap } from "@/components/property-detail/property-map";
import { EnquiryForm } from "@/components/property-detail/enquiry-form";
import { SimilarProperties } from "@/components/property-detail/similar-properties";
import { incrementPropertyViews } from "@/lib/data/properties";
import { formatPrice, LISTING_TYPE_LABEL, PROPERTY_STATUS_LABEL, RENTAL_TERM_LABEL } from "@/lib/utils";
import { JsonLd } from "@/components/shared/json-ld";
import { propertyJsonLd } from "@/lib/seo";
import type { PropertyWithRelations } from "@/types";

export async function PropertyDetail({ property }: { property: PropertyWithRelations }) {
  incrementPropertyViews(property.id).catch(() => {});

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const propertyUrl = `${siteUrl}/properties/${property.slug}`;
  const locationLabel = [property.neighborhood?.name, property.city?.name].filter(Boolean).join(", ");
  const fullAddress = property.show_full_address ? property.address : null;

  return (
    <>
      <JsonLd data={propertyJsonLd(property, propertyUrl)} />
      <PageBanner
        title={property.title}
        subtitle={`Ref: ${property.reference}${locationLabel ? ` · ${locationLabel}` : ""}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
          { label: property.title },
        ]}
      />

      <div className="container-luxe section-y !pt-10">
        <Gallery media={property.media} title={property.title} />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-charcoal text-ivory hover:bg-charcoal">
                  {LISTING_TYPE_LABEL[property.listing_type]}
                </Badge>
                {property.listing_type === "rent" && property.rental_term && (
                  <Badge variant="secondary">{RENTAL_TERM_LABEL[property.rental_term]}</Badge>
                )}
                <Badge variant="secondary">{property.property_type.name}</Badge>
                {property.featured && <Badge className="bg-bronze text-white hover:bg-bronze">Featured</Badge>}
                {property.status !== "available" && (
                  <Badge variant="secondary">{PROPERTY_STATUS_LABEL[property.status]}</Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading text-3xl text-charcoal sm:text-4xl">{property.title}</h1>
                  {(fullAddress || locationLabel) && (
                    <p className="mt-1.5 text-muted-foreground">{fullAddress || locationLabel}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-heading text-2xl text-bronze sm:text-3xl">
                    {formatPrice(property.price, property.currency)}
                    {property.listing_type === "rent" && <span className="text-sm text-muted-foreground"> /mo</span>}
                  </p>
                  <ShareButtons url={propertyUrl} title={property.title} />
                </div>
              </div>
            </div>

            <InfoTable property={property} />

            {property.description && (
              <div>
                <h2 className="font-heading text-xl text-charcoal">Description</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-charcoal/80">{property.description}</p>
              </div>
            )}

            <AmenitiesList features={property.features} />

            <div>
              <h2 className="font-heading text-xl text-charcoal">Location</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {fullAddress ? `${fullAddress} — ` : ""}
                {locationLabel}
              </p>
              <div className="mt-3">
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  googleMapsUrl={property.google_maps_url}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            {property.agent && <AgentCard agent={property.agent} property={property} />}
            <EnquiryForm
              propertyId={property.id}
              propertyTitle={property.title}
              propertyReference={property.reference}
              propertyUrl={propertyUrl}
            />
          </aside>
        </div>

        <div className="mt-14">
          <Suspense fallback={null}>
            <SimilarProperties property={property} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
