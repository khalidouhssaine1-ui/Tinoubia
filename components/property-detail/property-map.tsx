"use client";

import { useEffect, useRef } from "react";
import { loadLeaflet } from "@/lib/leaflet-loader";

/**
 * Free, no-API-key map using Leaflet + OpenStreetMap tiles (loaded from CDN).
 * Uses a custom SVG pin so we don't depend on Leaflet's default marker images.
 */
export function PropertyMap({
  latitude,
  longitude,
  title,
  googleMapsUrl,
}: {
  latitude: number | null;
  longitude: number | null;
  title: string;
  googleMapsUrl: string | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Supabase returns numeric columns as strings — coerce so Leaflet gets numbers.
  const lat = latitude == null ? null : Number(latitude);
  const lng = longitude == null ? null : Number(longitude);

  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current) return;

        map = L.map(mapRef.current, { center: [lat, lng], zoom: 15, scrollWheelZoom: false });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html: `<svg width="34" height="34" viewBox="0 0 24 24" fill="#A47C48" stroke="#151816" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#F5F1E8" stroke="none"/></svg>`,
          iconSize: [34, 34],
          iconAnchor: [17, 32],
        });

        L.marker([lat, lng], { icon, title }).addTo(map);
        // Ensure tiles lay out correctly once the container is sized.
        setTimeout(() => map?.invalidateSize(), 0);
      })
      .catch((err) => console.error("[property-map] Leaflet init failed:", err));

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [lat, lng, title]);

  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="h-72 w-full overflow-hidden rounded-2xl border border-border sm:h-96" />
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-bronze hover:underline"
        >
          Open in Google Maps →
        </a>
      )}
    </div>
  );
}
