import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

interface Crumb {
  label: string;
  href?: string;
}

/**
 * Slim dark breadcrumb strip that sits under the fixed header — just enough to
 * keep the transparent white header readable, then the light content begins.
 * Used instead of a tall hero banner on listing and detail pages.
 */
export function BreadcrumbBar({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  return (
    <div className="bg-charcoal">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <div className="container-luxe pt-24 pb-4 sm:pt-28">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ivory/60">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-ivory">
                  {crumb.label}
                </Link>
              ) : (
                <span className="line-clamp-1 text-ivory/90">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
