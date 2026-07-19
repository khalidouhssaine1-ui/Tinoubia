import type { UserRole } from "@/types";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Properties", href: "/admin/properties", icon: "Building2" },
  { label: "Media Library", href: "/admin/media", icon: "Images" },
  { label: "Locations", href: "/admin/locations", icon: "MapPin", roles: ["super_admin", "admin"] },
  { label: "Categories", href: "/admin/categories", icon: "Tags", roles: ["super_admin", "admin"] },
  { label: "Leads", href: "/admin/leads", icon: "Inbox", roles: ["super_admin", "admin", "agent"] },
  { label: "Users", href: "/admin/users", icon: "Users", roles: ["super_admin"] },
  { label: "Settings", href: "/admin/settings", icon: "Settings", roles: ["super_admin"] },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: "History", roles: ["super_admin", "admin"] },
];
