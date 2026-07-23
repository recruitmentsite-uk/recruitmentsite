import Link from "next/link";
import Image from "next/image";
import { UNSPLASH, COMPETITORS, formatGbp, PRICING_PLANS } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { CompetitorComparison } from "@/components/CompetitorComparison";
import { CheckoutButton } from "@/components/CheckoutButton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Compare Recruitment Site vs Reed, Indeed, Hays",
  description: "See how Recruitment Site compares to Reed, Indeed, Hays and Totaljobs on pricing, AI matching, and features.",
  path: "/compare",
});

export default function ComparePage() {
  return (
    <>
      <Hero
        image={UNSPLASH.hero.team}
        badge="Competitor comparison"
        title="Same reach. Better economics."
        subtitle="See exactly how Recruitment Site stacks up against Reed, Indeed, Hays and Totaljobs — and where we win."
        primaryCta={{ label: "Start free trial", href: "/pricing" }}
        secondaryCta={{ label: "View dashboard demo", href: "/dashboard" }}
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
            Recruitment Site includes on Growth ({formatGbp(PRICING_PLANS[1].priceMonthly)}/mo) what others charge extra for
          </p>
          <CompetitorComparison />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">The maths on a £35k hire</h2>
            <div className="mt-6 space-y-4">
              {[
                { provider: "Hays (18% fee)", cost: "£6,300", bad: true },
                { provider: "Reed (agency tier)", cost: "£4,000+", bad: true },
                { provider: "Indeed PPC (3 months)", cost: "£1,200+", bad: true },
                { provider: "Recruitment Site Growth (3 months)", cost: "£747", bad: false },
              ].map((row) => (
                <div key={row.provider} className={`flex justify-between rounded-xl p-4 ${
                  row.bad ? "bg-red-50" : "bg-teal-50 border-2 border-brand"
                }`}>
                  <span className={row.bad ? "text-slate-600" : "font-semibold text-brand"}>{row.provider}</span>
                  <span className={`font-bold ${row.bad ? "text-red-500 line-through" : "text-brand"}`}>{row.cost}</span>
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
        <h2 className="text-2xl font-bold">Ready to switch from Reed?</h2>
        <p className="mt-3 text-teal-100">30-day free trial on Growth. No placement fees. Cancel anytime.</p>
        <Link href="/pricing" className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-brand hover:bg-teal-50">
          View pricing
        </Link>
      </section>
    </>
  );
}
