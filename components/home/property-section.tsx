import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCarousel } from "@/components/home/property-carousel";
import { Reveal } from "@/components/shared/reveal";
import type { PropertyWithRelations } from "@/types";

export function PropertySection({
  eyebrow,
  title,
  subtitle,
  properties,
  viewAllHref,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  properties: PropertyWithRelations[];
  viewAllHref: string;
  tone?: "light" | "muted";
}) {
  if (properties.length === 0) return null;

  return (
    <section className={tone === "muted" ? "bg-muted/50 section-y" : "section-y"}>
      <div className="container-luxe">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">{eyebrow}</p>
            <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className="group flex shrink-0 items-center gap-1.5 text-sm font-medium text-charcoal transition-colors hover:text-bronze"
          >
            View All
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal className="mt-10">
          <PropertyCarousel properties={properties} />
        </Reveal>
      </div>
    </section>
  );
}
