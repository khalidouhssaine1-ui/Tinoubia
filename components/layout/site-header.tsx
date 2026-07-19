"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { MAIN_NAV, whatsappLink } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-[0_1px_0_0_var(--border)] py-3"
          : "bg-gradient-to-b from-black/40 via-black/10 to-transparent py-5",
      )}
    >
      <div className="container-luxe flex items-center justify-between">
        <Logo light={light} />

        <nav className="hidden lg:flex items-center gap-8">
          {MAIN_NAV.map((item) => (
            <NavDropdown key={item.href} item={item} light={light} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            render={<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
            size="sm"
            className={cn(
              "hidden sm:inline-flex gap-2 rounded-full transition-colors",
              light ? "bg-white/10 text-white hover:bg-white/20 backdrop-blur" : "bg-bronze text-white hover:bg-bronze/90",
            )}
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </Button>
          <div className={cn(!light ? "text-charcoal" : "text-white")}>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
