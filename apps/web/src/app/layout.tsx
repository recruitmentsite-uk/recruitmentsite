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

/**
 * Job inventory must load at request time. `vercel build` in CI pulls masked
 * `[Encrypted]` placeholders for SUPABASE_SERVICE_ROLE_KEY, so static generation
 * would bake empty listings into production.
 */
export const dynamic = "force-dynamic";

/** Public GSC HTML-tag token for https://recruitmentsite.co.uk/ (rbee.mehmood@gmail.com). */
const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
  "CrM01OiQJtFNiEG1CGWSxCjf2haL9lg1gNyqPQgE5sM";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — UK Jobs with Salary Shown Upfront`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  metadataBase: new URL(getSiteUrl() || DEFAULT_SITE_URL),
  keywords: [
    "UK jobs",
    "nurse jobs UK",
    "registered nurse jobs",
    "care assistant jobs",
    "HCA jobs",
    "RMN jobs",
    "practice nurse jobs",
    "occupational therapist jobs",
    "healthcare jobs UK",
    "NHS jobs with salary",
    "electrician jobs UK",
    "plumber jobs UK",
    "software developer jobs UK",
    "DevOps jobs UK",
    "jobs with salary shown",
    "flat fee recruitment UK",
    "hire UK staff",
    "Recruitment Site",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "employment",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — UK Jobs with Salary Shown Upfront`,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
  },
  alternates: {
    canonical: getSiteUrl() || DEFAULT_SITE_URL,
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
