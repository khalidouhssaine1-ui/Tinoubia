"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { cn, formatArea, formatPrice, LISTING_TYPE_LABEL, PROPERTY_STATUS_LABEL, RENTAL_TERM_LABEL } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

const MAX_PREVIEW_IMAGES = 6;

export function PropertyCard({
  property,
  className,
  priority = false,
  layout = "grid",
}: {
  property: PropertyWithRelations;
  className?: string;
  priority?: boolean;
  layout?: "grid" | "list";
}) {
  const images = useMemo(() => {
    const cover = property.media.find((m) => m.is_cover) ?? property.media[0];
    const rest = property.media.filter((m) => m.id !== cover?.id);
    return [cover, ...rest].filter(Boolean).slice(0, MAX_PREVIEW_IMAGES) as typeof property.media;
  }, [property.media]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const locationLabel = [property.neighborhood?.name, property.city?.name].filter(Boolean).join(", ");
  const isNonStandardStatus = property.status !== "available";
  const isList = layout === "list";

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (images.length <= 1 || !frameRef.current) return;
    const { left, width } = frameRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - left) / width, 0), 0.999);
    setActiveIndex(Math.floor(ratio * images.length));
  }

  return (
    <Link
      href={`/properties/${property.slug}`}
      className={cn(
        "group relative flex overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:hover:translate-y-0",
        isList ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      <div
        ref={frameRef}
        onMouseEnter={() => setHovering(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHovering(false);
          setActiveIndex(0);
        }}
        className={cn("relative overflow-hidden bg-muted", isList ? "aspect-[4/3] sm:aspect-auto sm:w-80 sm:shrink-0" : "aspect-[4/3]")}
      >
        <div
          className={cn("flex h-full transition-transform duration-500 ease-out", hovering && "scale-95")}
          style={{ width: `${images.length * 100}%`, transform: `translateX(-${activeIndex * (100 / images.length)}%)` }}
        >
          {images.map((media, index) => (
            <div key={media.id} className="relative h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
              <Image
                src={media.secure_url}
                alt={media.alt_text || property.title}
                fill
                sizes={isList ? "(min-width: 640px) 320px, 100vw" : "(min-width: 1280px) 380px, (min-width: 768px) 45vw, 92vw"}
                className="object-cover"
                priority={priority && index === 0}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
            {images.map((media, index) => (
              <span
                key={media.id}
                className={cn(
                  "h-1 flex-1 rounded-full bg-white/40 transition-colors duration-200",
                  index === activeIndex && "bg-white",
                )}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3 pt-6">
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-charcoal text-ivory hover:bg-charcoal">
              {LISTING_TYPE_LABEL[property.listing_type]}
            </Badge>
            {property.listing_type === "rent" && property.rental_term && (
              <Badge variant="secondary" className="bg-white/90 text-charcoal">
                {RENTAL_TERM_LABEL[property.rental_term]}
              </Badge>
            )}
            {property.featured && (
              <Badge className="bg-bronze text-white hover:bg-bronze">Featured</Badge>
            )}
            {isNonStandardStatus && (
              <Badge variant="secondary" className="bg-white/90 text-charcoal">
                {PROPERTY_STATUS_LABEL[property.status]}
              </Badge>
            )}
          </div>
          <FavoriteButton propertyId={property.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg leading-snug text-charcoal">{property.title}</h3>
        </div>

        {locationLabel && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-bronze" />
            {locationLabel}
          </p>
        )}

        {isList && property.description && (
          <p className="hidden text-sm text-muted-foreground sm:line-clamp-2">{property.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="size-4" /> {property.bathrooms}
            </span>
          )}
          {property.living_area != null && (
            <span className="flex items-center gap-1.5">
              <Maximize className="size-4" /> {formatArea(property.living_area)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <p className="font-heading text-lg text-bronze">
            {formatPrice(property.price, property.currency)}
            {property.listing_type === "rent" && <span className="text-xs text-muted-foreground"> /mo</span>}
          </p>
          <span className="text-xs font-medium uppercase tracking-wide text-charcoal/70 transition-colors group-hover:text-bronze">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
