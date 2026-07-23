import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, EMPLOYER_TAGLINE, UNSPLASH, COMPETITOR_FEATURES, COMPANY_LEGAL_NOTICE } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Recruitment Site",
  description:
    "Recruitment Site is the flat-fee hiring platform for UK SMEs — unlimited jobs, AI-matched candidates, no agency commission.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Hero
        image={UNSPLASH.hero.team}
        badge="About us"
        title={`${SITE_NAME} — UK hiring, automated`}
        subtitle={EMPLOYER_TAGLINE}
        primaryCta={{ label: "View pricing", href: "/pricing" }}
        secondaryCta={{ label: "Compare vs Reed", href: "/compare" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Why we built Recruitment Site</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              UK SMEs shouldn&apos;t pay 15–25% agency fees or £100+ per job listing. Reed, Indeed, and Hays
              built models for a different era — we built automation-first hiring with flat monthly pricing,
              AI applicant scoring, and salary transparency on every role.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We launch deepest in healthcare — where staff shortages are acute and compliance matters —
              then expand across trades and tech with the same economics.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-72 shadow-xl">
            <Image src={UNSPLASH.hero.office} alt="Recruitment Site team" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-slate-900 text-center">What every employer gets</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMPETITOR_FEATURES.slice(0, 9).map((feature) => (
              <div key={feature} className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <span className="text-brand font-bold">✓</span> {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Ready to hire smarter?</h2>
        <p className="mt-3 text-slate-600">Start with a dashboard demo or compare us to your current provider.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/pricing" className="rounded-xl bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-dark">
            View pricing
          </Link>
          <Link href="/dashboard" className="rounded-xl border border-slate-200 px-8 py-3 font-semibold text-slate-700 hover:border-brand">
            Dashboard demo
          </Link>
        </div>
        <p className="mt-12 text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">{COMPANY_LEGAL_NOTICE}</p>
      </section>
    </>
  );
}
