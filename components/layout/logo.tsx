import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Two lockups of the same mark:
 *  - "header" (default): skyline + "TINOUBIA" only, cropped from the full
 *    logo — used in the site header/mobile drawer, where the "IMMOBILIER"
 *    bar read as clutter at nav size.
 *  - "full": the complete lockup including the "IMMOBILIER" bar — used in
 *    the footer, where there's room for it.
 * Each has a pre-recolored pure-white variant for dark/transparent
 * backgrounds (a CSS `invert` filter looked washed out at small sizes).
 */
const SOURCES = {
  header: { dark: "/logo-header.png", white: "/logo-header-white.png", width: 1142, height: 640 },
  full: { dark: "/logo.png", white: "/logo-white.png", width: 1142, height: 750 },
};

export function Logo({
  light = false,
  variant = "header",
  className,
}: {
  light?: boolean;
  variant?: "header" | "full";
  className?: string;
}) {
  const source = SOURCES[variant];

  return (
    <Link href="/" className={cn("flex items-center shrink-0", className)}>
      <Image
        src={light ? source.white : source.dark}
        alt="Tinoubia Immobilier"
        width={source.width}
        height={source.height}
        className={cn("w-auto object-contain", variant === "header" ? "h-14" : "h-24")}
        priority
        unoptimized
      />
    </Link>
  );
}
