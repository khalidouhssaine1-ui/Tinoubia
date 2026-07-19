import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { getNeighborhoodsWithProperties } from "@/lib/data/locations";

const NEIGHBORHOOD_IMAGES: Record<string, string> = {
  gueliz: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
  hivernage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
  palmeraie: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80",
  medina: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80",
};

export async function LocationCards() {
  const neighborhoods = await getNeighborhoodsWithProperties(4);
  if (neighborhoods.length === 0) return null;

  return (
    <section className="bg-muted/50 section-y">
      <div className="container-luxe">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Browse by Location</p>
          <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">Marrakech&apos;s Finest Addresses</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {neighborhoods.map((n, i) => (
            <Reveal key={n.id} delay={i * 0.06}>
              <Link
                href={`/properties/location/${n.city.slug}/${n.slug}`}
                className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl shadow-sm sm:h-64"
              >
                <Image
                  src={NEIGHBORHOOD_IMAGES[n.slug] ?? NEIGHBORHOOD_IMAGES.gueliz}
                  alt={n.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
                <div className="relative z-10 p-4">
                  <h3 className="font-heading text-lg text-white">{n.name}</h3>
                  <p className="text-xs text-white/70">{n.propertyCount} properties</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
