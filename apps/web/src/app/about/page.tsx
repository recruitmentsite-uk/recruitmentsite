import Link from "next/link";
import {
  SITE_NAME,
  EMPLOYER_TAGLINE,
  UNSPLASH,
  COMPETITOR_FEATURES,
  COMPANY_LEGAL_NOTICE,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { UnsplashImage } from "@/components/UnsplashImage";
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
        secondaryCta={{ label: "See features", href: "/for-employers" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
              Why we built Recruitment Site
            </h2>
            <p className="mt-5 leading-relaxed text-ink/60">
              UK SMEs deserve predictable hiring costs and modern tools. We built Recruitment Site for
              flat monthly pricing, AI applicant scoring, and salary transparency on every role —
              so you spend less time screening and more time hiring.
            </p>
            <p className="mt-4 leading-relaxed text-ink/60">
              We launch deepest in healthcare — where staff shortages are acute and compliance matters —
              then expand across trades and tech with the same economics.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink">
            <UnsplashImage
              src={UNSPLASH.sections.interview}
              alt="Hiring conversation in a modern workplace"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="surface-mist border-y border-ink/8 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-2xl font-medium tracking-tight text-ink">
            What every employer gets
          </h2>
          <div className="mt-10 grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {COMPETITOR_FEATURES.slice(0, 9).map((feature) => (
              <div key={feature} className="border-t border-ink/10 px-1 py-5 text-sm text-ink/70">
                <span className="font-semibold text-brand">✓</span> {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
          Ready to hire smarter?
        </h2>
        <p className="mt-3 text-ink/55">
          Start with a dashboard demo or compare us to your current provider.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            View pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-ink/15 px-8 py-3 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
          >
            Dashboard demo
          </Link>
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-xs leading-relaxed text-ink/35">
          {COMPANY_LEGAL_NOTICE}
        </p>
      </section>
    </>
  );
}
