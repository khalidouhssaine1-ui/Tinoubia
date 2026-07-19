import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { AGENCY_PHONE_DISPLAY, whatsappLink } from "@/lib/nav-config";

export function ContactCta() {
  return (
    <section className="section-y">
      <div className="container-luxe">
        <Reveal className="relative overflow-hidden rounded-3xl bg-bronze px-6 py-14 text-center sm:px-16">
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-white/10" />
          <div className="relative z-10">
            <h2 className="font-heading text-3xl text-white sm:text-4xl">
              Ready to Find Your Next Property?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">
              Speak with a Tinoubia advisor today — by phone, WhatsApp, or through our
              contact form. We&apos;ll help you find exactly what you&apos;re looking for.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button render={<Link href="/contact" />} nativeButton={false} size="lg" className="bg-charcoal text-white hover:bg-charcoal/90">
                Contact Us
              </Button>
              <Button
                render={<a href={whatsappLink()} target="_blank" rel="noopener noreferrer" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <MessageCircle className="size-4" /> WhatsApp Us
              </Button>
              <a href={`tel:${AGENCY_PHONE_DISPLAY.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-medium text-white/90">
                <Phone className="size-4" /> {AGENCY_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
