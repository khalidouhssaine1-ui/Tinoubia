"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Images,
  Video,
  MapPin,
  Tags,
  Inbox,
  Users,
  Settings,
  History,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Images,
  Video,
  MapPin,
  Tags,
  Inbox,
  Users,
  Settings,
  History,
};

export function AdminSidebar({ role, className }: { role: UserRole; className?: string }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className={cn("flex h-full flex-col bg-sidebar text-sidebar-foreground", className)}>
      <Link href="/admin" className="flex items-center gap-2.5 px-5 py-6">
        <Image src="/logo-white.png" alt="Tinoubia Immobilier" width={228} height={150} className="h-8 w-auto" unoptimized />
      </Link>

      <div className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
