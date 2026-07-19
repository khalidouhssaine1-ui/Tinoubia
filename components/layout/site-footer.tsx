import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Logo } from "@/components/layout/logo";
import { AGENCY_EMAIL, AGENCY_PHONE_DISPLAY, whatsappLink } from "@/lib/nav-config";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "For Sale", href: "/for-sale" },
      { label: "For Rent", href: "/for-rent" },
      { label: "All Properties", href: "/properties" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Apartments", href: "/properties/apartments/for-sale" },
      { label: "Villas", href: "/properties/villas/for-sale" },
      { label: "Riads", href: "/properties/riads/for-sale" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-luxe grid gap-12 py-16 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light variant="full" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
            A premium real-estate agency guiding clients through buying and renting
            apartments, villas and riads — with the care and discretion a home
            deserves.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-bronze hover:text-bronze"
            >
              <FaFacebookF className="size-3.5" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-bronze hover:text-bronze"
            >
              <FaInstagram className="size-4" />
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/40">{col.title}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ivory/75 transition-colors hover:text-bronze">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ivory/40">Get in touch</p>
          <ul className="mt-5 space-y-3 text-sm text-ivory/75">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-bronze" />
              <a href={`tel:${AGENCY_PHONE_DISPLAY.replace(/\s/g, "")}`}>{AGENCY_PHONE_DISPLAY}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-bronze" />
              <a href={`mailto:${AGENCY_EMAIL}`}>{AGENCY_EMAIL}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-bronze" />
              Gueliz, Marrakech, Morocco
            </li>
          </ul>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm font-medium text-bronze hover:text-sand"
          >
            Chat with us on WhatsApp →
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 text-xs text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Tinoubia Immobilier. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/admin/login" className="hover:text-ivory/70">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
