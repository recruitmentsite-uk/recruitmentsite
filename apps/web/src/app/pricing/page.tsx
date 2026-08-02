import Link from "next/link";
import Image from "next/image";
import {
  PRICING_PLANS,
  formatGbp,
  PAYG_JOB_POST_PRICE,
  UNSPLASH,
  EMPLOYER_TAGLINE,
  COMPANY_LEGAL_NOTICE,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { PaygCheckoutButton, PricingCards } from "@/components/CheckoutButton";
import { EmployerFeatureGrid } from "@/components/CompetitorComparison";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Employer Pricing — Flat Fee, No Commission",
  description: EMPLOYER_TAGLINE,
  path: "/pricing",
});

const STEPS = [
  { step: "01", title: "Post your role", body: "Self-serve dashboard. Salary required — boosts applies 25–30%." },
  { step: "02", title: "We syndicate", body: "Google Jobs, SEO pages, job alerts — automatically." },
  { step: "03", title: "AI screens", body: "Applicants scored 0–100. Strong matches emailed instantly." },
  { step: "04", title: "You hire", body: "No commission. Unlimited hires on Growth." },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const params = await searchParams;
  const warm99 = params.offer === "warm99";

  return (
    <>
      <Hero
        image={UNSPLASH.sections.meeting}
        badge={warm99 ? "Warm lead offer · first 20 this month" : "No placement commission · ever"}
        title={warm99 ? "£99 month 1 — list a role today" : "Simple, flat-fee pricing"}
        subtitle={
          warm99
            ? "Skip the trial. Growth plan billed at £99 for month one, then £249/mo. Unlimited posts, AI match, Google Jobs."
            : EMPLOYER_TAGLINE
        }
        primaryCta={{
          label: warm99 ? "Claim £99 month 1" : "Start free trial",
          href: "#plans",
        }}
        secondaryCta={{ label: "For employers", href: "/for-employers" }}
      />

      <div id="plans" className="mx-auto max-w-6xl px-4 py-16">
        <PricingCards offer={warm99 ? "warm99" : undefined} />
        <p className="mt-8 text-center text-sm text-ink/50">
          Just one role?{" "}
          <PaygCheckoutButton className="font-semibold text-brand underline-offset-2 hover:underline">
            {formatGbp(PAYG_JOB_POST_PRICE)} for a 30-day single post
          </PaygCheckoutButton>
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-ink/35">
          {COMPANY_LEGAL_NOTICE}
        </p>
      </div>

      <section className="surface-mist border-y border-ink/8 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <EmployerFeatureGrid />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            From post to hire — without agency fees
          </h2>
          <p className="mt-3 text-ink/55">
            Four steps. Flat fee. Salary shown on every role.
          </p>
        </div>

        <div className="relative mt-10 aspect-[1200/630] w-full overflow-hidden bg-ink">
          <Image
            src="/brand/how-it-works.png"
            alt="How Recruitment Site hiring works: post, syndicate, AI screen, hire"
            fill
            className="object-cover"
            sizes="(max-width: 1152px) 100vw, 1152px"
            priority={false}
          />
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li key={item.step} className="border-t border-ink/10 pt-5">
              <span className="font-display text-2xl font-medium text-accent">{item.step}</span>
              <p className="mt-3 font-semibold text-ink">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/55">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden bg-ink py-20 text-center text-white">
        <div
          className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand-light), transparent 70%)" }}
          aria-hidden
        />
        <h2 className="relative font-display text-3xl font-medium tracking-tight">
          Predictable hiring cost
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/55">
          Growth is {formatGbp(PRICING_PLANS[1].priceMonthly)}/month with unlimited posts, AI scoring
          and zero placement commission — hire as often as you need.
        </p>
        <Link
          href="/dashboard"
          className="relative mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
        >
          Try the dashboard demo
        </Link>
      </section>
    </>
  );
}
