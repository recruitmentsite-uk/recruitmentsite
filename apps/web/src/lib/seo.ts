import type { Metadata } from "next";
import {
  SITE_NAME,
  SITE_TAGLINE,
  COMPANY_LEGAL_NAME,
  COMPANY_NUMBER,
  COMPANY_VAT_NUMBER,
} from "@placeuk/shared";
import { getSiteUrl } from "./site";

const DEFAULT_OG_IMAGE = "/opengraph-image";

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const url = opts.path ? `${getSiteUrl()}${opts.path}` : getSiteUrl();
  const image = opts.ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

/** Shared noindex metadata for auth, admin, and employer app surfaces. */
export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: COMPANY_LEGAL_NAME,
    url,
    logo: `${url}/icon`,
    description: SITE_TAGLINE,
    identifier: [
      {
        "@type": "PropertyValue",
        name: "Companies House",
        value: COMPANY_NUMBER,
      },
      {
        "@type": "PropertyValue",
        name: "VAT",
        value: COMPANY_VAT_NUMBER,
      },
    ],
    vatID: COMPANY_VAT_NUMBER,
    address: {
      "@type": "PostalAddress",
      streetAddress: "21-25 Burnley Road, Dollis Hill",
      addressLocality: "London",
      postalCode: "NW10 1ED",
      addressCountry: "GB",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@recruitmentsite.co.uk",
      areaServed: "GB",
      availableLanguage: "English",
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    inLanguage: "en-GB",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/jobs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  author: string;
  coverImage?: string;
}) {
  const url = `${getSiteUrl()}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: url,
    ...(post.coverImage ? { image: [post.coverImage] } : {}),
  };
}

export function faqJsonLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; url?: string }[]) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url.startsWith("http") ? item.url : `${base}${item.url}` } : {}),
    })),
  };
}
