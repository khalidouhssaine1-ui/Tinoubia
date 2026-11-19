"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function AdminTopbar({ profile }: { profile: Profile }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const initials = (profile.full_name || profile.email).charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 gap-0 border-none bg-sidebar p-0">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <AdminSidebar role={profile.role} className="h-full flex-1" />
          </SheetContent>
        </Sheet>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 text-xs text-muted-foreground hover:text-charcoal sm:flex"
        >
          View site <ExternalLink className="size-3" />
        </a>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2" />}>
          <span className="flex size-7 items-center justify-center rounded-full bg-bronze/15 text-xs font-medium text-bronze">
            {initials}
          </span>
          <span className="hidden text-sm sm:inline">{profile.full_name || profile.email}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-1.5 py-1">
            <p className="text-sm font-medium">{profile.full_name || "Admin"}</p>
            <p className="text-xs capitalize text-muted-foreground">{profile.role.replace("_", " ")}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive">
            <LogOut className="size-4" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
