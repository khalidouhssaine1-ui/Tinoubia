"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { MAIN_NAV, AGENCY_PHONE_DISPLAY, whatsappLink } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-current hover:bg-white/10"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm bg-charcoal text-ivory border-l border-white/10 p-0">
        <SheetHeader className="border-b border-white/10 px-6 py-5">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Logo light />
        </SheetHeader>

        <nav className="flex flex-col px-4 py-4">
          {MAIN_NAV.map((item) => (
            <div key={item.href} className="border-b border-white/5 last:border-none">
              {item.children ? (
                <button
                  className="flex w-full items-center justify-between py-4 text-left text-base font-medium"
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  aria-expanded={expanded === item.label}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-300",
                      expanded === item.label && "rotate-180",
                    )}
                  />
                </button>
              ) : (
                <SheetClose render={<Link href={item.href} className="block py-4 text-base font-medium" />}>
                  {item.label}
                </SheetClose>
              )}

              <div
                className={cn(
                  "grid overflow-hidden transition-all duration-300 ease-out",
                  expanded === item.label ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0">
                  {item.children?.map((child) => (
                    <SheetClose
                      key={child.href}
                      render={
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2.5 text-sm text-ivory/80 hover:bg-white/5"
                        />
                      }
                    >
                      {child.label}
                    </SheetClose>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-6 py-6">
          <Button
            render={<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
            className="bg-bronze hover:bg-bronze/90 text-white"
          >
            Chat on WhatsApp
          </Button>
          <a
            href={`tel:${AGENCY_PHONE_DISPLAY.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 text-sm text-ivory/70"
          >
            <Phone className="size-4" /> {AGENCY_PHONE_DISPLAY}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
