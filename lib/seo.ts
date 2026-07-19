import { AGENCY_EMAIL, AGENCY_PHONE_DISPLAY } from "@/lib/nav-config";
import type { PropertyWithRelations } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Tinoubia Immobilier",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/mainpic.png`,
    telephone: AGENCY_PHONE_DISPLAY,
    email: AGENCY_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      addressCountry: "MA",
    },
    areaServed: "Marrakech, Morocco",
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

const ACCOMMODATION_TYPE: Record<string, string> = {
  apartments: "Apartment",
  villas: "House",
  riads: "House",
};

export function propertyJsonLd(property: PropertyWithRelations, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.seo_description || property.description || undefined,
    url,
    datePosted: property.created_at,
    image: property.media.filter((m) => m.resource_type === "image").map((m) => m.secure_url),
    about: {
      "@type": ACCOMMODATION_TYPE[property.property_type.slug] ?? "Accommodation",
      name: property.title,
      numberOfRooms: property.bedrooms ?? undefined,
      floorSize: property.living_area
        ? { "@type": "QuantitativeValue", value: property.living_area, unitCode: "MTK" }
        : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: property.city?.name,
        addressRegion: property.neighborhood?.name,
        addressCountry: "MA",
      },
      ...(property.latitude != null && property.longitude != null
        ? { geo: { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude } }
        : {}),
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : property.status === "reserved"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      businessFunction: property.listing_type === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
    },
  };
}
