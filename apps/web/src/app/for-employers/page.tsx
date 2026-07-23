import Link from "next/link";
import {
  UNSPLASH,
  EMPLOYER_TAGLINE,
  PRICING_PLANS,
  formatGbp,
  HIRE_GUIDE_PAGES,
  COMPETITOR_SEO_PAGES,
  SEO_ROLE_PAGES,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { CompetitorCards } from "@/components/CompetitorComparison";
import { CheckoutButton } from "@/components/CheckoutButton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "For Employers — Flat-Fee UK Hiring",
  description: EMPLOYER_TAGLINE,
  path: "/for-employers",
});

export default function ForEmployersPage() {
  const growth = PRICING_PLANS[1];

  return (
    <>
      <Hero
        image={UNSPLASH.hero.hiring}
        badge="For UK employers"
        title="Hire without agency fees or per-click costs"
        subtitle={EMPLOYER_TAGLINE}
        primaryCta={{ label: "Start free trial", href: "/onboarding" }}
        secondaryCta={{ label: "View pricing", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { stat: "£249/mo", label: "Unlimited job posts on Growth" },
            { stat: "0%", label: "Placement commission — ever" },
            { stat: "AI 0–100", label: "Applicant match scores included" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-brand">{item.stat}</p>
              <p className="mt-2 text-sm text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">Why employers switch to Recruitment Site</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Predictable pricing",
                body: "Reed charges £100+ per listing. Indeed PPC spirals at £1.50–£3 per click. Hays takes 15–25% commission. We charge a flat monthly fee.",
              },
              {
                title: "AI-ranked applicants",
                body: "Every CV is scored 0–100 against your job description. Review the best candidates first instead of reading every application manually.",
              },
              {
                title: "Healthcare compliance built in",
                body: "NMC, HCPC, DBS and NHS Band fields out of the box — something Reed and Indeed don't offer for care home and NHS hiring.",
              },
              {
                title: "Google Jobs included",
                body: "Every job syndicates to Google Jobs automatically on Growth. Branded careers page and CV database access included.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Hiring guides by role</h2>
        <p className="mt-2 text-slate-600">Step-by-step guides for hiring nurses, care assistants, electricians and developers.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {HIRE_GUIDE_PAGES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/hire/${guide.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-brand hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-slate-900">{guide.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Compare vs competitors</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPETITOR_SEO_PAGES.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-4 text-center hover:border-brand transition-colors"
            >
              <p className="font-semibold text-brand">vs {c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <CompetitorCards />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Start hiring today</h2>
        <p className="mt-3 text-slate-600">
          Growth plan from {formatGbp(growth.priceMonthly)}/mo — 30-day free trial, cancel anytime.
        </p>
        <CheckoutButton tier="growth" className="mt-8 rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
          Start free trial
        </CheckoutButton>
      </section>
    </>
  );
}
