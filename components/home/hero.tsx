import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/home/search-bar";

export function Hero({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-charcoal pb-16 pt-40 sm:pb-24">
      <Image
        src="/mainpic.webp"
        alt="A luxury Tinoubia Immobilier villa at dusk, with an infinity pool and Atlas Mountain views"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

      <div className="container-luxe relative z-10">
        <p className="text-xs uppercase tracking-[0.35em] text-sand">Tinoubia Immobilier</p>
        <h1 className="mt-4 max-w-3xl text-balance font-heading text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">
          Find a Property That Feels Like Home
        </h1>
        <p className="mt-5 max-w-xl text-balance text-base text-white/80 sm:text-lg">
          Tinoubia Immobilier guides you through buying and renting apartments, villas
          and riads across Morocco — with the discretion and care a home deserves.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/for-sale" />}
            nativeButton={false}
            size="lg"
            className="bg-bronze text-white hover:bg-bronze/90"
          >
            Explore Properties for Sale
          </Button>
          <Button
            render={<Link href="/for-rent" />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white"
          >
            Explore Properties for Rent
          </Button>
        </div>

        <SearchBar className="mt-10" categories={categories} />
      </div>
    </section>
  );
}
