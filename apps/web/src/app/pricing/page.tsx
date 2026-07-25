import Link from "next/link";
import { PRICING_PLANS, formatGbp, PAYG_JOB_POST_PRICE, UNSPLASH, EMPLOYER_TAGLINE, COMPANY_LEGAL_NOTICE } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { PaygCheckoutButton, PricingCards } from "@/components/CheckoutButton";
import { EmployerFeatureGrid } from "@/components/CompetitorComparison";
import { UnsplashImage } from "@/components/UnsplashImage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Employer Pricing — Flat Fee, No Commission",
  description: EMPLOYER_TAGLINE,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <Hero
        image={UNSPLASH.hero.office}
        badge="No placement commission · ever"
        title="Simple, flat-fee pricing"
        subtitle={EMPLOYER_TAGLINE}
        primaryCta={{ label: "Start free trial", href: "#plans" }}
        secondaryCta={{ label: "For employers", href: "/for-employers" }}
      />

      <div id="plans" className="mx-auto max-w-6xl px-4 py-16">
        <PricingCards />
        <p className="mt-8 text-center text-sm text-slate-500">
          Just one role?{" "}
          <PaygCheckoutButton className="font-semibold text-brand underline-offset-2 hover:underline">
            {formatGbp(PAYG_JOB_POST_PRICE)} for a 30-day single post
          </PaygCheckoutButton>
        </p>
        <p className="mt-4 text-center text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {COMPANY_LEGAL_NOTICE}
        </p>
      </div>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <EmployerFeatureGrid />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative rounded-2xl overflow-hidden h-80 shadow-xl">
            <UnsplashImage src={UNSPLASH.sections.dashboard} alt="Dashboard" fill />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
            <div className="mt-6 space-y-5">
              {[
                { step: "1", title: "Post your role", body: "Self-serve dashboard. Salary required — boosts applies 25–30%." },
                { step: "2", title: "We syndicate", body: "Google Jobs, SEO pages, job alerts — automatically." },
                { step: "3", title: "AI screens", body: "Applicants scored 0–100. Strong matches emailed instantly." },
                { step: "4", title: "You hire", body: "No commission. Unlimited hires on Growth." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white text-sm font-bold">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-center text-white">
        <h2 className="text-2xl font-bold">Predictable hiring cost</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          Growth is {formatGbp(PRICING_PLANS[1].priceMonthly)}/month with unlimited posts, AI scoring and zero placement commission — hire as often as you need.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-brand hover:bg-teal-50"
        >
          Try the dashboard demo
        </Link>
      </section>
    </>
  );
}
