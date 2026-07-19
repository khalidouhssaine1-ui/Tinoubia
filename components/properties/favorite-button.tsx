"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({ propertyId, className }: { propertyId: string; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(propertyId);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-colors", active ? "fill-bronze text-bronze" : "text-charcoal")} />
    </button>
  );
}
