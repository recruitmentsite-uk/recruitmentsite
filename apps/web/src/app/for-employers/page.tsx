import Link from "next/link";
import Image from "next/image";
import {
  UNSPLASH,
  EMPLOYER_TAGLINE,
  PRICING_PLANS,
  formatGbp,
  HIRE_GUIDE_PAGES,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { UnsplashImage } from "@/components/UnsplashImage";
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
        image={UNSPLASH.hero.workshop}
        badge="For UK employers"
        title="Hire without agency fees or per-click costs"
        subtitle={EMPLOYER_TAGLINE}
        primaryCta={{ label: "Start free trial", href: "/onboarding" }}
        secondaryCta={{ label: "View pricing", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { stat: "£249/mo", label: "Unlimited job posts on Growth" },
            { stat: "0%", label: "Placement commission — ever" },
            { stat: "AI 0–100", label: "Applicant match scores included" },
          ].map((item) => (
            <div key={item.label} className="border-t border-ink/10 pt-5 text-center sm:text-left">
              <p className="font-display text-3xl font-medium text-brand">{item.stat}</p>
              <p className="mt-2 text-sm text-ink/55">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-mist border-y border-ink/8 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            <UnsplashImage
              src={UNSPLASH.hero.kitchen}
              alt="UK hospitality and ops team in a commercial kitchen"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
              What you get with Recruitment Site
            </h2>
            <ul className="mt-8 space-y-6">
              {[
                {
                  title: "Predictable pricing",
                  body: "Flat monthly fee on Growth with unlimited posts. No placement commission — ever.",
                },
                {
                  title: "AI-ranked applicants",
                  body: "Every CV is scored 0–100 against your job description so you review the best first.",
                },
                {
                  title: "Healthcare compliance built in",
                  body: "NMC, HCPC, DBS and NHS Band fields ready when you post regulated roles.",
                },
                {
                  title: "Google Jobs included",
                  body: "Every job syndicates to Google Jobs automatically on Growth.",
                },
              ].map((item) => (
                <li key={item.title} className="border-t border-ink/10 pt-5">
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
              How hiring works
            </h2>
            <p className="mt-3 text-ink/55">
              Post once. We syndicate. AI ranks applicants. You hire — no commission.
            </p>
            <Link
              href="/pricing#how-it-works"
              className="mt-6 inline-flex text-sm font-semibold text-brand hover:text-brand-dark"
            >
              See the full flow →
            </Link>
          </div>
          <div className="relative aspect-[1200/630] overflow-hidden bg-ink">
            <Image
              src="/brand/how-it-works.png"
              alt="How Recruitment Site hiring works"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
          Hiring guides by role
        </h2>
        <p className="mt-2 text-ink/55">
          Step-by-step guides for hiring nurses, care assistants, electricians and developers.
        </p>
        <div className="mt-8 grid gap-0 sm:grid-cols-2">
          {HIRE_GUIDE_PAGES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/hire/${guide.slug}`}
              className="border-t border-ink/10 px-1 py-5 transition hover:border-brand"
            >
              <h3 className="font-semibold text-ink">{guide.title}</h3>
              <p className="mt-1 text-sm text-ink/50">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto max-w-6xl px-4">
          <CompetitorCards />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
          Start hiring today
        </h2>
        <p className="mt-3 text-ink/55">
          Growth plan from {formatGbp(growth.priceMonthly)}/mo — 30-day free trial, cancel anytime.
        </p>
        <CheckoutButton
          tier="growth"
          className="mt-8 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Start free trial
        </CheckoutButton>
      </section>
    </>
  );
}
