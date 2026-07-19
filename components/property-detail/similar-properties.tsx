import { PropertyCard } from "@/components/properties/property-card";
import { Reveal } from "@/components/shared/reveal";
import { getSimilarProperties } from "@/lib/data/properties";
import type { Property } from "@/types";

export async function SimilarProperties({ property }: { property: Property }) {
  const similar = await getSimilarProperties(property, 4);
  if (similar.length === 0) return null;

  return (
    <section className="border-t border-border pt-10">
      <Reveal>
        <h2 className="font-heading text-2xl text-charcoal">Similar Properties</h2>
      </Reveal>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {similar.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06}>
            <PropertyCard property={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
