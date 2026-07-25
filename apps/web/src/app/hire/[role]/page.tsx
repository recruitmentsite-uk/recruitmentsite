import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { HIRE_GUIDE_PAGES, getHireGuide, UNSPLASH, PRICING_PLANS, formatGbp } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CheckoutButton } from "@/components/CheckoutButton";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

interface PageProps {
  params: Promise<{ role: string }>;
}

export function generateStaticParams() {
  return HIRE_GUIDE_PAGES.map((p) => ({ role: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { role: slug } = await params;
  const guide = getHireGuide(slug);
  if (!guide) {
    return buildPageMetadata({ title: "Hiring Guides", description: "UK employer hiring guides", path: "/for-employers" });
  }
  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/hire/${slug}`,
  });
}

export default async function HireGuidePage({ params }: PageProps) {
  const { role: slug } = await params;
  const guide = getHireGuide(slug);
  if (!guide) notFound();

  const growth = PRICING_PLANS[1];
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "For employers", url: "/for-employers" },
    { name: guide.title },
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
            { label: "For employers", href: "/for-employers" },
            { label: guide.title },
          ]}
        />
      </div>

      <Hero
        image={UNSPLASH.hero.team}
        badge="Employer guide"
        title={guide.headline}
        subtitle={guide.description}
        primaryCta={{ label: "Start free trial", href: "/onboarding" }}
        secondaryCta={{ label: "View pricing", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">How to hire {guide.role.toLowerCase()}</h2>
              <ol className="mt-6 space-y-4">
                {guide.steps.map((step, i) => (
                  <li key={step} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-slate-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Tips for better results</h2>
              <ul className="mt-4 space-y-3">
                {guide.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-slate-600">
                    <span className="text-brand font-bold">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-brand bg-teal-50 p-6">
              <h2 className="text-xl font-bold text-brand">Cost comparison</h2>
              <p className="mt-3 text-slate-700 leading-relaxed">{guide.costComparison}</p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md sticky top-24">
              <p className="text-sm text-slate-500">Growth plan</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {formatGbp(growth.priceMonthly)}
                <span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <p className="mt-2 text-sm text-slate-500">Unlimited posts · AI matching · 30-day free trial</p>
              <CheckoutButton tier="growth" className="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Start free trial
              </CheckoutButton>
              <Link href="/for-employers" className="mt-3 block text-center text-sm font-semibold text-brand hover:underline">
                See all features →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
