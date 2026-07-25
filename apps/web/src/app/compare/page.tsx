import Link from "next/link";
import Image from "next/image";
import { UNSPLASH, COMPETITORS, formatGbp, PRICING_PLANS } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { CompetitorComparison } from "@/components/CompetitorComparison";
import { CheckoutButton } from "@/components/CheckoutButton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Recruitment Site Features & Pricing Comparison",
  description: "Flat monthly fee, AI match scores, salary on every job, and Google Jobs included — see Recruitment Site features and pricing side by side.",
  path: "/compare",
});

export default function ComparePage() {
  return (
    <>
      <Hero
        image={UNSPLASH.hero.team}
        badge="Features & pricing"
        title="What you get with Recruitment Site"
        subtitle="Flat monthly fee, AI match scores, salary on every job, and Google Jobs included — see how that compares on price and features."
        primaryCta={{ label: "Start free trial", href: "/pricing" }}
        secondaryCta={{ label: "For employers", href: "/for-employers" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-sm text-slate-500">
          New employer?{" "}
          <Link href="/onboarding" className="font-semibold text-brand hover:underline">
            Start setup →
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900">Pricing comparison</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COMPETITORS.map((c) => (
            <div
              key={c.name}
              className={`rounded-2xl border p-6 ${
                c.name === "Recruitment Site"
                  ? "border-brand border-2 bg-teal-50 shadow-lg"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                c.name === "Recruitment Site" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {c.logo}
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{c.name}</h3>
              <p className="text-sm text-slate-500">{c.tagline}</p>
              <p className="mt-4 text-2xl font-bold text-brand">{c.priceExample}</p>
              {c.name === "Recruitment Site" && (
                <CheckoutButton tier="growth" className="mt-4 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                  Get started
                </CheckoutButton>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Feature-by-feature</h2>
          <p className="mt-2 text-center text-slate-500 mb-10">
            Everything below is included on Growth ({formatGbp(PRICING_PLANS[1].priceMonthly)}/mo)
          </p>
          <CompetitorComparison />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">What Growth costs for a busy quarter</h2>
            <div className="mt-6 space-y-4">
              {[
                { label: "Unlimited job posts", included: true },
                { label: "AI match scores on every applicant", included: true },
                { label: "Salary transparency enforced", included: true },
                { label: "Google Jobs syndication", included: true },
                { label: "3 months of Growth", cost: "£747" },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex justify-between rounded-xl p-4 ${
                    "cost" in row ? "bg-teal-50 border-2 border-brand" : "bg-slate-50"
                  }`}
                >
                  <span className={"cost" in row ? "font-semibold text-brand" : "text-slate-600"}>
                    {row.label}
                  </span>
                  <span className={`font-bold ${"cost" in row ? "text-brand" : "text-brand"}`}>
                    {"cost" in row ? row.cost : "✓"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-80 shadow-xl">
            <Image src={UNSPLASH.sections.handshake} alt="Successful hire" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-brand py-16 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to hire on Recruitment Site?</h2>
        <p className="mt-3 text-teal-100">30-day free trial on Growth. No placement fees. Cancel anytime.</p>
        <Link href="/pricing" className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-brand hover:bg-teal-50">
          View pricing
        </Link>
      </section>
    </>
  );
}
