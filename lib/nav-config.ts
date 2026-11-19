export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

/**
 * The main menu. The "For Sale" / "For Rent" dropdowns list the categories
 * managed in the admin, so a new category appears here automatically.
 */
export function buildMainNav(categories: { slug: string; name: string }[]): NavItem[] {
  const children = (type: "for-sale" | "for-rent"): NavChild[] =>
    categories.map((c) => ({ label: c.name, href: `/properties/${c.slug}/${type}` }));

  return [
    { label: "Home", href: "/" },
    { label: "For Sale", href: "/for-sale", children: children("for-sale") },
    { label: "For Rent", href: "/for-rent", children: children("for-rent") },
    { label: "Properties", href: "/properties" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
}

// wa.me needs digits only, country code, no "+". Env var overrides if set.
export const AGENCY_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212607157847";
export const AGENCY_PHONE_DISPLAY = "+212 607-157847";
export const AGENCY_EMAIL = "hmounayt17@gmail.com";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${AGENCY_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
