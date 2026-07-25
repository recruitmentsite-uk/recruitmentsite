import Link from "next/link";
import Image from "next/image";
import {
  SITE_TAGLINE,
  LAUNCH_VERTICAL,
  VERTICAL_LABELS,
  VERTICAL_META,
  BROWSE_VERTICALS,
  UNSPLASH,
  POPULAR_SEARCHES,
  POPULAR_CITIES,
  TRUST_SIGNALS,
  getVerticalImage,
  cityToSlug,
  SEO_ROLE_PAGES,
} from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { JobSearchForm } from "@/components/JobSearchForm";
import { UnsplashImage } from "@/components/UnsplashImage";
import { NhsBandLookup } from "@/components/NhsBandLookup";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Find UK Jobs with Salary Shown Upfront",
  description: SITE_TAGLINE,
  path: "/",
});

export default async function HomePage() {
  const allJobs = await getJobs();
  const featured = allJobs.filter((j) => j.featured || j.vertical === LAUNCH_VERTICAL).slice(0, 6);
  const healthcareCount = allJobs.filter((j) => j.vertical === "healthcare").length;
  const newest = [...allJobs]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <>
      <Hero
        image={UNSPLASH.hero.ukCity}
        title="UK roles with salary shown upfront"
        subtitle={SITE_TAGLINE}
      >
        <JobSearchForm jobCount={allJobs.length} />
      </Hero>

      <section className="surface-mist border-b border-ink/6 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl text-balance">
            Built for serious hiring — and serious job moves.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_SIGNALS.map((signal) => (
              <div key={signal.label} className="border-t border-ink/10 pt-5">
                <p className="font-display text-3xl font-medium text-brand">{signal.stat}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/50">{signal.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/6 bg-paper py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
                Latest roles
              </h2>
              <p className="mt-2 text-ink/50">
                {allJobs.length > 0
                  ? `${allJobs.length.toLocaleString()} open positions across the UK`
                  : "Salary shown on every listing · Apply free"}
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-sm font-semibold text-brand transition hover:text-brand-dark"
            >
              View all roles →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="mt-10 grid gap-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {featured.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-ink/8 bg-mist/40 px-6 py-12 text-center">
              <p className="font-display text-xl font-medium text-ink">New roles are being listed</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/50">
                Get daily alerts and we&apos;ll email you when matching jobs go live — salary shown on every listing.
              </p>
              <Link
                href="/#job-alerts"
                className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Set up job alerts
              </Link>
            </div>
          )}
          <div className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink/8 pt-8 text-sm text-ink/55">
            <span className="font-medium text-ink/35">Popular searches</span>
            {POPULAR_SEARCHES.map((search) => {
              const rolePage = SEO_ROLE_PAGES.find((r) => r.searchQuery === search.query);
              const href = rolePage
                ? `/${rolePage.vertical}/${rolePage.slug}`
                : `/jobs?q=${encodeURIComponent(search.query)}`;
              return (
                <Link key={search.query} href={href} className="transition hover:text-brand">
                  {search.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {newest.length > 0 && (
        <section className="border-b border-ink/6 bg-mist/60 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
              Just posted
            </h2>
            <p className="mt-2 text-sm text-ink/50">Fresh listings with salary shown</p>
            <div className="mt-8 grid gap-0 sm:grid-cols-3 sm:gap-4">
              {newest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-ink/6 bg-paper py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
            Browse by city
          </h2>
          <p className="mt-2 max-w-lg text-ink/50">
            Major UK markets — every role lists pay before you apply.
          </p>
          <ul className="mt-10 columns-2 gap-x-12 sm:columns-4">
            {POPULAR_CITIES.map((city) => {
              const count = allJobs.filter((j) => j.city.toLowerCase() === city.toLowerCase()).length;
              return (
                <li key={city} className="mb-3 break-inside-avoid">
                  <Link
                    href={`/jobs/${cityToSlug(city)}`}
                    className="group inline-flex items-baseline gap-2 text-ink transition hover:text-brand"
                  >
                    <span className="font-medium">{city}</span>
                    <span className="text-xs text-ink/35 group-hover:text-brand/60">
                      {count > 0 ? count : "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-ink/6">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[360px] lg:min-h-[480px]">
            <UnsplashImage src={UNSPLASH.sections.interview} alt="Professional interview" fill />
          </div>
          <div className="flex flex-col justify-center bg-ink px-8 py-16 text-white sm:px-14">
            <h2 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              Job hunting without the noise
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
              Browse without an account. Apply with your CV in minutes. Every listing shows the
              salary — no agency theatre, no surprise calls.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/70">
              <li>Verified UK employers</li>
              <li>NHS Band, hourly, and day rates shown clearly</li>
              <li>Free daily alerts when roles match you</li>
            </ul>
            <Link
              href="/jobs"
              className="mt-10 inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              Start browsing
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/6 bg-paper py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
                Sectors
              </h2>
              <p className="mt-2 text-ink/50">
                {BROWSE_VERTICALS.length} industries across the UK
              </p>
            </div>
            <Link href="/sectors" className="text-sm font-semibold text-brand hover:text-brand-dark">
              View all sectors →
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BROWSE_VERTICALS.map((vertical) => (
              <Link
                key={vertical}
                href={VERTICAL_META[vertical].path}
                className="group relative min-h-[200px] overflow-hidden"
              >
                <Image
                  src={getVerticalImage(vertical)}
                  alt={VERTICAL_LABELS[vertical]}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-xl font-medium text-white">
                    {VERTICAL_LABELS[vertical]}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {allJobs.filter((j) => j.vertical === vertical).length} open roles
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[380px] overflow-hidden">
        <UnsplashImage src={UNSPLASH.hero.healthcare} alt="Healthcare professionals" fill />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto flex min-h-[380px] max-w-6xl flex-col items-start justify-center px-4 py-20">
          <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
            {VERTICAL_LABELS[LAUNCH_VERTICAL]}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">
            {healthcareCount > 0
              ? `${healthcareCount} live roles for nurses, care assistants, HCAs and support workers — NHS Band salaries and compliance fields built in.`
              : "Nurses, care assistants, HCAs and support workers — NHS Band salaries and compliance fields built in."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/healthcare"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              Explore healthcare
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Hire healthcare staff
            </Link>
          </div>
        </div>
      </section>

      <section
        id="job-alerts"
        className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-start"
      >
        <div className="space-y-6">
          <div className="relative hidden h-72 overflow-hidden lg:block">
            <UnsplashImage src={UNSPLASH.sections.nurse} alt="Healthcare worker" fill />
          </div>
          <NhsBandLookup />
        </div>
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink">
            Never miss a role
          </h2>
          <p className="mt-3 text-ink/55">
            Free daily alerts by email — healthcare, trades, or tech in your city.
          </p>
          <div className="mt-8">
            <JobAlertSignup />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand-light), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-light">
            For employers
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Hire with clear salaries and faster shortlists
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55">
            Post to verified UK candidates, score applicants with AI matching, and reach Google
            Jobs from one dashboard.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-light"
            >
              Start hiring
            </Link>
            <Link
              href="/for-employers"
              className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white/40"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
