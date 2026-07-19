import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { getCategoryCounts } from "@/lib/data/properties";

const CATEGORIES = [
  {
    slug: "apartments",
    label: "Apartments",
    description: "Contemporary living in the city's most sought-after addresses.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "villas",
    label: "Villas",
    description: "Private estates with pools, gardens and uninterrupted views.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "riads",
    label: "Riads",
    description: "Restored courtyard houses in the heart of the Medina.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
  },
];

export async function CategoryCards() {
  const counts = await getCategoryCounts();

  return (
    <section className="section-y">
      <div className="container-luxe">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Browse by Category</p>
          <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">A Home for Every Way of Living</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 0.08}>
              <Link
                href={`/properties/${cat.slug}/for-sale`}
                className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-2xl shadow-md"
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent transition-colors group-hover:from-charcoal/95" />
                <div className="relative z-10 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-sand">
                    {counts[cat.slug as keyof typeof counts] ?? 0} listings
                  </p>
                  <h3 className="mt-2 font-heading text-2xl text-white">{cat.label}</h3>
                  <p className="mt-1 text-sm text-white/70">{cat.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore {cat.label} →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
