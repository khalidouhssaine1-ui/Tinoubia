export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

const SALE_CHILDREN: NavChild[] = [
  { label: "Apartments", href: "/properties/apartments/for-sale" },
  { label: "Villas", href: "/properties/villas/for-sale" },
  { label: "Riads", href: "/properties/riads/for-sale" },
];

const RENT_CHILDREN: NavChild[] = [
  { label: "Apartments", href: "/properties/apartments/for-rent" },
  { label: "Villas", href: "/properties/villas/for-rent" },
  { label: "Riads", href: "/properties/riads/for-rent" },
];

export const MAIN_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "For Sale", href: "/for-sale", children: SALE_CHILDREN },
  { label: "For Rent", href: "/for-rent", children: RENT_CHILDREN },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// wa.me needs digits only, country code, no "+". Env var overrides if set.
export const AGENCY_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212607157847";
export const AGENCY_PHONE_DISPLAY = "+212 607-157847";
export const AGENCY_EMAIL = "hmounayt17@gmail.com";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${AGENCY_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
