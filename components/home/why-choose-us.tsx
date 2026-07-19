import { ShieldCheck, KeyRound, Compass, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Trusted & Transparent",
    description: "Every listing is verified, every step documented — no surprises, no pressure.",
  },
  {
    icon: Compass,
    title: "Local Market Expertise",
    description: "Deep knowledge of Marrakech's neighborhoods, from the Medina to the Palmeraie.",
  },
  {
    icon: KeyRound,
    title: "End-to-End Support",
    description: "From first visit to signed keys, one dedicated agent guides the whole journey.",
  },
  {
    icon: HeartHandshake,
    title: "Discretion & Care",
    description: "A personal, unhurried approach — because a home is never just a transaction.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-y">
      <div className="container-luxe">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Why Choose Tinoubia</p>
          <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">
            A Standard of Service Built on Trust
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((point, i) => (
            <Reveal key={point.title} delay={i * 0.08}>
              <div className="flex size-12 items-center justify-center rounded-full bg-bronze/10 text-bronze">
                <point.icon className="size-6" />
              </div>
              <h3 className="mt-5 font-heading text-lg text-charcoal">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
