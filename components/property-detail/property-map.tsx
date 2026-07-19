"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
  const [inView, setInView] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !API_KEY || !mapRef.current || latitude == null || longitude == null) return;
    let cancelled = false;
    setOptions({ key: API_KEY, v: "weekly" });

    Promise.all([importLibrary("maps"), importLibrary("marker")])
      .then(([{ Map }, { AdvancedMarkerElement }]) => {
        if (cancelled || !mapRef.current) return;
        const map = new Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapId: "tinoubia-property-detail",
        });
        new AdvancedMarkerElement({ position: { lat: latitude, lng: longitude }, map, title });
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
    };
  }, [inView, latitude, longitude, title]);

  if (latitude == null || longitude == null) return null;

  if (!API_KEY || error) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        <MapPin className="size-6 text-bronze" />
        Map preview unavailable.
        {googleMapsUrl && (
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-bronze hover:underline">
            Open in Google Maps →
          </a>
        )}
      </div>
    );
  }

  return <div ref={mapRef} className="h-72 w-full overflow-hidden rounded-2xl sm:h-96" />;
}
