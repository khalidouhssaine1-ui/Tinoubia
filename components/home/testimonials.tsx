import { Reveal } from "@/components/shared/reveal";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { getTestimonials } from "@/lib/data/testimonials";

export async function Testimonials() {
  const testimonials = await getTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-luxe">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Client Testimonials</p>
          <h2 className="mt-3 font-heading text-3xl text-charcoal sm:text-4xl">What Our Clients Say</h2>
        </Reveal>
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
