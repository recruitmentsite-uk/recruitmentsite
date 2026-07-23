import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  COMPETITOR_SEO_PAGES,
  getCompetitorSeoPage,
  COMPETITORS,
  UNSPLASH,
  PRICING_PLANS,
  formatGbp,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompetitorComparison } from "@/components/CompetitorComparison";
import { CheckoutButton } from "@/components/CheckoutButton";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ competitor: string }>;
}

export function generateStaticParams() {
  return COMPETITOR_SEO_PAGES.map((p) => ({ competitor: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor: slug } = await params;
  const page = getCompetitorSeoPage(slug);
  if (!page) {
    return buildPageMetadata({ title: "Compare", description: "Compare job boards", path: "/compare" });
  }
  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: `/compare/${slug}`,
  });
}

export default async function CompareCompetitorPage({ params }: PageProps) {
  const { competitor: slug } = await params;
  const page = getCompetitorSeoPage(slug);
  if (!page) notFound();

  const competitor = COMPETITORS.find((c) => c.name.toLowerCase().includes(slug));
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: page.name },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Compare", href: "/compare" },
            { label: page.name },
          ]}
        />
      </div>

      <Hero
        image={UNSPLASH.hero.team}
        badge={`vs ${page.name}`}
        title={page.headline}
        subtitle={page.description}
        primaryCta={{ label: "Start free trial", href: "/onboarding" }}
        secondaryCta={{ label: "Full comparison", href: "/compare" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{page.name}</h2>
            <p className="mt-2 text-2xl font-bold text-red-500">{page.theirPrice}</p>
            <ul className="mt-4 space-y-2">
              {page.painPoints.map((point) => (
                <li key={point} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-red-400">✗</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-brand bg-teal-50 p-6 shadow-lg">
            <h2 className="text-lg font-bold text-brand">Recruitment Site</h2>
            <p className="mt-2 text-2xl font-bold text-brand">{page.ourAdvantage}</p>
            <ul className="mt-4 space-y-2">
              {[
                "Unlimited job posts on Growth",
                "AI applicant scoring included",
                "Salary required on every listing",
                "Healthcare compliance fields built in",
              ].map((point) => (
                <li key={point} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-brand font-bold">✓</span>
                  {point}
                </li>
              ))}
            </ul>
            <CheckoutButton tier="growth" className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark">
              Switch from {competitor?.logo ?? page.slug}
            </CheckoutButton>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Full feature comparison</h2>
          <p className="mt-2 text-center text-slate-500 mb-10">
            Recruitment Site Growth ({formatGbp(PRICING_PLANS[1].priceMonthly)}/mo) vs {page.name}
          </p>
          <CompetitorComparison />
        </div>
      </section>

      <section className="bg-brand py-16 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to leave {page.name}?</h2>
        <p className="mt-3 text-teal-100">30-day free trial. No placement fees. Cancel anytime.</p>
        <Link href="/pricing" className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-brand hover:bg-teal-50">
          View pricing
        </Link>
      </section>
    </>
  );
}
