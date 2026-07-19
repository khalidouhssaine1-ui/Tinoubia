"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 31.6295, lng: -7.9811 }; // Marrakech

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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!API_KEY || !mapRef.current) return;
    let cancelled = false;
    setOptions({ key: API_KEY, v: "weekly" });

    Promise.all([importLibrary("maps"), importLibrary("marker")])
      .then(([{ Map }, { AdvancedMarkerElement }]) => {
        if (cancelled || !mapRef.current) return;

        const center = latitude != null && longitude != null ? { lat: latitude, lng: longitude } : DEFAULT_CENTER;
        const map = new Map(mapRef.current, { center, zoom: 13, mapId: "tinoubia-map-picker" });

        const marker = new AdvancedMarkerElement({
          position: latitude != null && longitude != null ? center : undefined,
          map,
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          marker.position = e.latLng;
          onChange(e.latLng.lat(), e.latLng.lng());
        });
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!API_KEY || error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        <MapPin className="size-5 text-bronze" />
        Map picker requires a Google Maps API key. Enter latitude/longitude manually below.
      </div>
    );
  }

  return <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-xl sm:h-80" />;
}
