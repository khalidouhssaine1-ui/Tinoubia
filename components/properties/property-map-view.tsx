"use client";

import { useEffect, useRef } from "react";
import { loadLeaflet } from "@/lib/leaflet-loader";
import { formatPrice } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

/** Free, no-API-key multi-marker map using Leaflet + OpenStreetMap (CDN). */
export function PropertyMapView({ properties }: { properties: PropertyWithRelations[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const located = properties.filter((p) => p.latitude != null && p.longitude != null);

  useEffect(() => {
    if (!mapRef.current || located.length === 0) return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current) return;

        map = L.map(mapRef.current, { scrollWheelZoom: false });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#A47C48" stroke="#151816" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#F5F1E8" stroke="none"/></svg>`,
          iconSize: [30, 30],
          iconAnchor: [15, 28],
        });

        const bounds: [number, number][] = [];
        located.forEach((property) => {
          // Supabase returns numeric columns as strings — coerce for Leaflet.
          const pos: [number, number] = [Number(property.latitude), Number(property.longitude)];
          bounds.push(pos);
          L.marker(pos, { icon, title: property.title })
            .addTo(map!)
            .bindPopup(
              `<div style="font-family:Inter,sans-serif;padding:2px"><strong>${property.title}</strong><br/>${formatPrice(
                property.price,
                property.currency,
              )}<br/><a href="/properties/${property.slug}" style="color:#A47C48">View details</a></div>`,
            );
        });

        if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
        else map.setView(bounds[0], 14);
        setTimeout(() => map?.invalidateSize(), 0);
      })
      .catch((err) => console.error("[property-map-view] Leaflet init failed:", err));

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [located]);

  if (located.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No properties with a map location in this view.
      </div>
    );
  }

  return <div ref={mapRef} className="h-[32rem] w-full overflow-hidden rounded-2xl border border-border" />;
}
