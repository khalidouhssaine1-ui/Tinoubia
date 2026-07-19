import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";

const STATS = [
  { value: 12, suffix: "+", label: "Years of Experience" },
  { value: 480, suffix: "+", label: "Properties Placed" },
  { value: 96, suffix: "%", label: "Client Satisfaction" },
  { value: 30, suffix: "+", label: "Neighborhoods Covered" },
];

export function AgencyPresentation() {
  return (
    <section className="section-y overflow-hidden bg-charcoal text-ivory">
      <div className="container-luxe grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-sand">The Agency</p>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl">
            Rooted in Marrakech, Devoted to Every Client
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-ivory/70">
            Tinoubia Immobilier was founded on a simple belief: finding a home should feel
            personal, not transactional. Our team combines deep local expertise with a
            meticulous, discreet approach — guiding clients through every apartment,
            villa and riad transaction with the same care we&apos;d want for our own family.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="font-heading text-3xl text-bronze sm:text-4xl"
                />
                <p className="mt-1 text-sm text-ivory/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
            alt="A Tinoubia Immobilier property showcase"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
