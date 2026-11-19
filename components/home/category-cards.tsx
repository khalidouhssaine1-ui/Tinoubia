import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { getCategoryCounts } from "@/lib/data/properties";
import { DEFAULT_CATEGORY_IMAGE, getCategories } from "@/lib/data/categories";

export async function CategoryCards() {
  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()]);
  if (categories.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-luxe">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Browse by Category</p>
          <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">A Home for Every Way of Living</h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 0.08}>
              <Link
                href={`/properties/${cat.slug}/for-sale`}
                className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-2xl shadow-md"
              >
                <Image
                  src={cat.image_url || DEFAULT_CATEGORY_IMAGE}
                  alt={cat.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent transition-colors group-hover:from-charcoal/95" />
                <div className="relative z-10 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-sand">
                    {counts[cat.slug] ?? 0} listings
                  </p>
                  <h3 className="mt-2 font-heading text-2xl text-white">{cat.name}</h3>
                  {cat.description && <p className="mt-1 text-sm text-white/70">{cat.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore {cat.name} →
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
