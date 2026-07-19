"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { formatPrice } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function PropertyMapView({ properties }: { properties: PropertyWithRelations[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const located = properties.filter((p) => p.latitude != null && p.longitude != null);

  useEffect(() => {
    if (!API_KEY) return;
    if (!mapRef.current || located.length === 0) return;

    let cancelled = false;
    setOptions({ key: API_KEY, v: "weekly" });

    Promise.all([importLibrary("maps"), importLibrary("marker")])
      .then(([{ Map, InfoWindow }, { AdvancedMarkerElement }]) => {
        if (cancelled || !mapRef.current) return;

        const bounds = new google.maps.LatLngBounds();
        const map = new Map(mapRef.current, {
          mapId: "tinoubia-properties",
          center: { lat: located[0].latitude!, lng: located[0].longitude! },
          zoom: 12,
        });

        located.forEach((property) => {
          const position = { lat: property.latitude!, lng: property.longitude! };
          bounds.extend(position);
          const marker = new AdvancedMarkerElement({ position, map, title: property.title });
          const info = new InfoWindow({
            content: `<div style="font-family:Inter,sans-serif;padding:2px"><strong>${property.title}</strong><br/>${formatPrice(property.price, property.currency)}<br/><a href="/properties/${property.slug}" style="color:#A47C48">View details</a></div>`,
          });
          marker.addListener("click", () => info.open({ anchor: marker, map }));
        });

        if (located.length > 1) map.fitBounds(bounds);
      })
      .catch(() => setError("Unable to load Google Maps."));

    return () => {
      cancelled = true;
    };
  }, [located]);

  if (!API_KEY) {
    return (
      <FallbackList properties={located} note="Map view requires a Google Maps API key to be configured." />
    );
  }

  if (error) return <FallbackList properties={located} note={error} />;

  if (located.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No properties with a map location in this view.
      </div>
    );
  }

  return <div ref={mapRef} className="h-[32rem] w-full overflow-hidden rounded-2xl" />;
}

function FallbackList({ properties, note }: { properties: PropertyWithRelations[]; note: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-6">
      <p className="text-sm text-muted-foreground">{note}</p>
      <ul className="mt-4 space-y-2">
        {properties.map((p) => (
          <li key={p.id}>
            <Link href={`/properties/${p.slug}`} className="text-sm font-medium text-bronze hover:underline">
              {p.title} — {formatPrice(p.price, p.currency)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
