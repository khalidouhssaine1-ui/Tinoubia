import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { MobileStickyBar } from "@/components/layout/mobile-sticky-bar";
import { getCategories } from "@/lib/data/categories";
import { buildMainNav } from "@/lib/nav-config";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Categories are managed in the admin; the menu and footer list them.
  const categories = (await getCategories()).map(({ slug, name }) => ({ slug, name }));

  return (
    <>
      <SiteHeader nav={buildMainNav(categories)} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <SiteFooter categories={categories} />
      <WhatsAppFloat />
      <MobileStickyBar />
    </>
  );
}
