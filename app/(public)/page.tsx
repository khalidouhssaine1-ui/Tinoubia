import { Hero } from "@/components/home/hero";
import { PropertySection } from "@/components/home/property-section";
import { CategoryCards } from "@/components/home/category-cards";
import { LocationCards } from "@/components/home/location-cards";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { AgencyPresentation } from "@/components/home/agency-presentation";
import { Testimonials } from "@/components/home/testimonials";
import { ContactCta } from "@/components/home/contact-cta";
import { InstagramVideos } from "@/components/home/instagram-videos";
import { getFeaturedProperties, getLatestProperties } from "@/lib/data/properties";
import { getInstagramVideos } from "@/lib/data/videos";

export default async function HomePage() {
  const [featured, forSale, forRent, videos] = await Promise.all([
    getFeaturedProperties(10),
    getLatestProperties(10, "sale"),
    getLatestProperties(10, "rent"),
    getInstagramVideos(8),
  ]);

  return (
    <>
      <Hero />

      <PropertySection
        eyebrow="Handpicked"
        title="Featured Properties"
        subtitle="A curated selection of our most exceptional current listings."
        properties={featured}
        viewAllHref="/properties?featured=true"
      />

      <CategoryCards />

      <InstagramVideos videos={videos} />

      <PropertySection
        eyebrow="For Sale"
        title="Properties for Sale"
        subtitle="Apartments, villas and riads ready for their next owner."
        properties={forSale}
        viewAllHref="/for-sale"
        tone="muted"
      />

      <PropertySection
        eyebrow="For Rent"
        title="Properties for Rent"
        subtitle="Furnished and unfurnished homes available now."
        properties={forRent}
        viewAllHref="/for-rent"
      />

      <LocationCards />

      <WhyChooseUs />

      <AgencyPresentation />

      <Testimonials />

      <ContactCta />
    </>
  );
}
