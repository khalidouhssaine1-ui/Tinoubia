import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { JsonLd } from "@/components/shared/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tinoubia Immobilier — Find a Property That Feels Like Home",
    template: "%s | Tinoubia Immobilier",
  },
  description:
    "Tinoubia Immobilier helps you buy and rent apartments, villas and riads in Morocco — a premium, trustworthy real-estate experience from search to signature.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Tinoubia Immobilier",
    title: "Tinoubia Immobilier — Find a Property That Feels Like Home",
    description:
      "Buy and rent apartments, villas and riads with Tinoubia Immobilier.",
    images: ["/mainpic.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinoubia Immobilier",
    description: "Find a property that feels like home.",
    images: ["/mainpic.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <JsonLd data={organizationJsonLd()} />
        <TooltipProvider delay={150}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
