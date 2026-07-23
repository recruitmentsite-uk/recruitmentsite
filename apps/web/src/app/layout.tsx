import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@placeuk/shared";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { JsonLd } from "@/components/JsonLd";
import { MarketingOnly } from "@/components/ConditionalShell";
import { DEFAULT_SITE_URL, getSiteUrl } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — UK Recruitment, Automated`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  metadataBase: new URL(getSiteUrl() || DEFAULT_SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen flex flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <MarketingOnly>
          <Header />
        </MarketingOnly>
        <main className="flex-1">{children}</main>
        <MarketingOnly>
          <Footer />
        </MarketingOnly>
        <MarketingOnly>
          <CookieBanner />
        </MarketingOnly>
      </body>
    </html>
  );
}
