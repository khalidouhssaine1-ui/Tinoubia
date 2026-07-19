import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { ContactForm } from "@/components/shared/contact-form";
import { PropertyMap } from "@/components/property-detail/property-map";
import { AGENCY_EMAIL, AGENCY_PHONE_DISPLAY, whatsappLink } from "@/lib/nav-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Tinoubia Immobilier — by phone, WhatsApp, email or our contact form.",
  alternates: { canonical: "/contact" },
};

const OFFICE_LOCATION = { lat: 31.6373, lng: -8.0089 };

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Us"
        subtitle="We'd love to help you find your next property — reach out any way that suits you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <div className="container-luxe section-y !pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-xl text-charcoal">Get in Touch</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <Phone className="size-4 text-bronze" />
                  <a href={`tel:${AGENCY_PHONE_DISPLAY.replace(/\s/g, "")}`} className="text-charcoal hover:text-bronze">
                    {AGENCY_PHONE_DISPLAY}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-4 text-bronze" />
                  <a href={`mailto:${AGENCY_EMAIL}`} className="text-charcoal hover:text-bronze">
                    {AGENCY_EMAIL}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="size-4 text-bronze" />
                  <span className="text-charcoal">Gueliz, Marrakech, Morocco</span>
                </li>
              </ul>
              <a
                href={whatsappLink("Hello, I'd like to get in touch with Tinoubia Immobilier.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white hover:bg-[#1ebc59]"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div>
              <h2 className="mb-3 font-heading text-lg text-charcoal">Our Office</h2>
              <PropertyMap
                latitude={OFFICE_LOCATION.lat}
                longitude={OFFICE_LOCATION.lng}
                title="Tinoubia Immobilier"
                googleMapsUrl={`https://maps.google.com/?q=${OFFICE_LOCATION.lat},${OFFICE_LOCATION.lng}`}
              />
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </>
  );
}
