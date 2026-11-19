"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { cn } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

/**
 * Continuously auto-scrolling, swipeable carousel of uniform-size property
 * cards. Pauses on hover, respects prefers-reduced-motion (falls back to a
 * static swipeable row), and loops when there are enough slides to overflow.
 */
export function PropertyCarousel({ properties }: { properties: PropertyWithRelations[] }) {
  const reduced = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: !reduced && properties.length > 3, align: "start", dragFree: true },
    reduced
      ? []
      : [AutoScroll({ speed: 0.8, startDelay: 800, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on("select", update).on("reInit", update).on("init", update);
    // Nudge once on the next frame so the initial arrow state reflects layout,
    // without a synchronous setState inside the effect body.
    const raf = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(raf);
      emblaApi.off("select", update).off("reInit", update).off("init", update);
    };
  }, [emblaApi]);

  function scroll(dir: "prev" | "next") {
    if (!emblaApi) return;
    // Pause auto-scroll on manual nav, then advance.
    const auto = emblaApi.plugins()?.autoScroll;
    auto?.stop?.();
    if (dir === "prev") emblaApi.scrollPrev();
    else emblaApi.scrollNext();
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {properties.map((property, i) => (
            <div
              key={property.id}
              className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_55%] lg:flex-[0_0_40%] xl:flex-[0_0_30%]"
            >
              <PropertyCard property={property} priority={i < 2} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => scroll("prev")}
        className={cn(
          "absolute -left-3 top-[38%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-charcoal shadow-md transition hover:bg-bronze hover:text-white lg:flex",
          !canPrev && "opacity-0",
        )}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scroll("next")}
        className={cn(
          "absolute -right-3 top-[38%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-charcoal shadow-md transition hover:bg-bronze hover:text-white lg:flex",
          !canNext && "opacity-0",
        )}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
