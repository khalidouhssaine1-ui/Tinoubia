"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function NavDropdown({ item, light }: { item: NavItem; light: boolean }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "text-sm font-medium transition-colors",
          light ? "text-white/90 hover:text-white" : "text-charcoal/80 hover:text-charcoal",
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors",
          light ? "text-white/90 hover:text-white" : "text-charcoal/80 hover:text-charcoal",
        )}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-50 mt-3 w-48 -translate-x-1/2 rounded-xl border border-border bg-popover p-2 shadow-xl"
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-secondary"
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
