"use client";

import { useEffect, useRef } from "react";
import { loadLeaflet } from "@/lib/leaflet-loader";

const DEFAULT_CENTER: [number, number] = [31.6295, -7.9811]; // Marrakech

/**
 * Free, no-API-key click-to-pick location picker (Leaflet + OpenStreetMap, CDN).
 * Clicking the map drops/moves the pin and reports lat/lng to the form.
 */
export function MapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current) return;

        const hasPos = latitude != null && longitude != null;
        const center: [number, number] = hasPos ? [Number(latitude), Number(longitude)] : DEFAULT_CENTER;
        map = L.map(mapRef.current).setView(center, hasPos ? 14 : 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.divIcon({
          className: "",
          html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#A47C48" stroke="#151816" stroke-width="1" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#F5F1E8" stroke="none"/></svg>`,
          iconSize: [32, 32],
          iconAnchor: [16, 30],
        });

        let currentMarker = hasPos ? L.marker(center, { icon }).addTo(map) : null;

        map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (currentMarker) currentMarker.setLatLng([lat, lng]);
          else currentMarker = L.marker([lat, lng], { icon }).addTo(map!);
          onChange(lat, lng);
        });

        setTimeout(() => map?.invalidateSize(), 0);
      })
      .catch((err) => console.error("[map-picker] Leaflet init failed:", err));

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-xl border border-border sm:h-80" />
      <p className="mt-1.5 text-xs text-muted-foreground">Click on the map to set the property location.</p>
    </div>
  );
}
