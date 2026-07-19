import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { MobileStickyBar } from "@/components/layout/mobile-sticky-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
      <MobileStickyBar />
    </>
  );
}
