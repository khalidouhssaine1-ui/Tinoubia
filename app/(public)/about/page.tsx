import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/shared/page-banner";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Testimonials } from "@/components/home/testimonials";
import { ContactCta } from "@/components/home/contact-cta";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Tinoubia Immobilier — a premium real-estate agency guiding clients through buying and renting apartments, villas and riads in Morocco.",
  alternates: { canonical: "/about" },
};

const STATS = [
  { value: 12, suffix: "+", label: "Years of Experience" },
  { value: 480, suffix: "+", label: "Properties Placed" },
  { value: 96, suffix: "%", label: "Client Satisfaction" },
  { value: 30, suffix: "+", label: "Neighborhoods Covered" },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Tinoubia Immobilier"
        subtitle="A premium real-estate agency rooted in Marrakech, devoted to every client."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="section-y">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Our Story</p>
            <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">
              Real Estate, Guided by Care
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
              Tinoubia Immobilier was founded on a simple belief: finding a home should
              feel personal, not transactional. From the ochre courtyards of the Medina
              to the palm-lined estates of the Palmeraie, our team combines deep local
              expertise with a meticulous, discreet approach — guiding clients through
              every apartment, villa and riad transaction with the same care we&apos;d
              want for our own family.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
              Whether you&apos;re searching for a pied-à-terre in Gueliz, a family villa
              in Hivernage, or a restored riad in the historic Medina, our advisors are
              with you from the first visit to the signed keys.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} className="font-heading text-2xl text-bronze sm:text-3xl" />
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/mainpic.webp"
              alt="A Tinoubia Immobilier property"
              fill
              unoptimized
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      <WhyChooseUs />
      <Testimonials />
      <ContactCta />
    </>
  );
}
