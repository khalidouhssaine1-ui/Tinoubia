"use client";

import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Testimonial } from "@/types";

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Carousel opts={{ align: "start", loop: true }} className="mt-10">
      <CarouselContent>
        {testimonials.map((t) => (
          <CarouselItem key={t.id} className="sm:basis-1/2 lg:basis-1/3">
            <div className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
              <div className="flex gap-0.5 text-bronze">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-4 ${i < t.rating ? "fill-bronze" : "fill-none text-border"}`} />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/80">&ldquo;{t.message}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-sand/40 font-heading text-sm text-charcoal">
                  {t.client_name.charAt(0)}
                </div>
                <p className="text-sm font-medium text-charcoal">{t.client_name}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-6 flex justify-center gap-2">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}
