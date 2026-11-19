import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

interface Crumb {
  label: string;
  href?: string;
}

export function PageBanner({ title, subtitle, breadcrumbs }: { title: string; subtitle?: string; breadcrumbs: Crumb[] }) {
  return (
    <section className="relative overflow-hidden bg-charcoal pb-8 pt-24 sm:pt-28">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(164,124,72,0.25),transparent_60%)]" />
      <div className="container-luxe relative z-10">
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-ivory/60">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-ivory">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ivory/90">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="font-heading text-3xl text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-white/70">{subtitle}</p>}
      </div>
    </section>
  );
}
