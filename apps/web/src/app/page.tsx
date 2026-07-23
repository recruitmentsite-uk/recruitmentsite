import Link from "next/link";
import Image from "next/image";
import {
  SITE_NAME,
  SITE_TAGLINE,
  LAUNCH_VERTICAL,
  VERTICAL_LABELS,
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
import { CompetitorCards } from "@/components/CompetitorComparison";
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
        badge={`${allJobs.length.toLocaleString()} open roles · Salary on every listing`}
        title="Find your next role in the UK"
        subtitle={SITE_TAGLINE}
        secondaryCta={{ label: "Create job alert", href: "/job-alerts" }}
        align="center"
      >
        <JobSearchForm jobCount={allJobs.length} />
      </Hero>

      {/* Trending searches — Reed/Indeed pattern */}
      <section className="border-b border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500 shrink-0">Trending:</span>
            {POPULAR_SEARCHES.map((search) => {
              const rolePage = SEO_ROLE_PAGES.find((r) => r.searchQuery === search.query);
              const href = rolePage
                ? `/${rolePage.vertical}/${rolePage.slug}`
                : `/jobs?q=${encodeURIComponent(search.query)}`;
              return (
              <Link
                key={search.query}
                href={href}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 hover:border-brand hover:bg-teal-50 hover:text-brand transition-colors"
              >
                {search.label}
              </Link>
            );
            })}
          </div>
        </div>
      </section>

      {/* Trust stats — factual differentiators vs Reed/Indeed */}
      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-2 gap-6 md:grid-cols-4">
          {TRUST_SIGNALS.map((signal) => (
            <div key={signal.label} className="text-center">
              <p className="text-2xl font-extrabold text-brand">{signal.stat}</p>
              <p className="mt-1 text-sm text-slate-500">{signal.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Employer sectors — social proof without fake logos */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Hiring on Recruitment Site</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-slate-700">
            <span>NHS Trusts</span>
            <span>Care Homes</span>
            <span>CQC Providers</span>
            <span>Construction Firms</span>
            <span>Tech Scale-ups</span>
            <span>UK SMEs</span>
          </div>
        </div>
      </section>

      {/* Jobs first — main content for candidates */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Latest jobs</h2>
              <p className="mt-1 text-slate-500">{allJobs.length} open roles across the UK</p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently posted */}
      {newest.length > 0 && (
        <section className="border-b border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-xl font-bold text-slate-900">Added recently</h2>
            <p className="mt-1 text-sm text-slate-500">Fresh roles with salary shown upfront</p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {newest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular cities — long-tail SEO + quick navigation */}
      <section className="bg-slate-50 border-b border-slate-200 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-slate-900">Jobs by city</h2>
          <p className="mt-1 text-sm text-slate-500">Browse roles in major UK cities — salary shown upfront</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {POPULAR_CITIES.map((city) => {
              const count = allJobs.filter((j) => j.city.toLowerCase() === city.toLowerCase()).length;
              return (
                <Link
                  key={city}
                  href={`/jobs/${cityToSlug(city)}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center hover:border-brand hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-slate-900">{city}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {count > 0 ? `${count} open roles` : "View roles"}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why job seekers use Recruitment Site */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative rounded-2xl overflow-hidden h-80 shadow-xl">
            <UnsplashImage src={UNSPLASH.sections.interview} alt="Job interview" fill />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 text-balance">
              Job hunting without the hassle
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              No account required to browse. Every listing shows the salary. Apply with your CV in minutes —
              no endless forms, no surprise agency calls.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> Real jobs from verified UK employers</li>
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> NHS Band pay, hourly rates, and day rates shown clearly</li>
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> Free daily email alerts when new roles match you</li>
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> Unlike Indeed — no ghost jobs or missing salaries</li>
            </ul>
            <Link href="/jobs" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">
              Start browsing
            </Link>
          </div>
        </div>
      </section>

      {/* Competitor comparison — our key differentiator */}
      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Why {SITE_NAME} beats Reed & Indeed</h2>
            <p className="mt-3 text-slate-600">
              Flat monthly fee for employers. Salary required on every job. AI match scores included.
              No per-click costs, no agency commission.
            </p>
          </div>
          <div className="mt-10">
            <CompetitorCards />
          </div>
          <p className="mt-8 text-center">
            <Link href="/compare" className="text-sm font-semibold text-brand hover:underline">
              See full feature comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* Browse by sector */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Browse by sector</h2>
          <p className="mt-2 text-center text-slate-500">Roles across healthcare, trades, and tech</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(["healthcare", "trades", "tech"] as const).map((vertical) => (
              <Link
                key={vertical}
                href={vertical === "healthcare" ? "/healthcare" : vertical === "trades" ? "/trades" : "/tech"}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative h-44">
                  <Image
                    src={getVerticalImage(vertical)}
                    alt={VERTICAL_LABELS[vertical]}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-semibold text-white text-lg">
                    {VERTICAL_LABELS[vertical]}
                  </p>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    {allJobs.filter((j) => j.vertical === vertical).length} open roles
                  </span>
                  <span className="text-sm font-semibold text-brand group-hover:underline">Browse →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare highlight */}
      <section className="relative overflow-hidden min-h-[320px] flex items-center">
        <UnsplashImage src={UNSPLASH.hero.healthcare} alt="Healthcare professionals" fill />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center w-full">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-semibold text-white backdrop-blur-sm">
            Launch vertical · {healthcareCount} roles live
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white">{VERTICAL_LABELS[LAUNCH_VERTICAL]} jobs</h2>
          <p className="mx-auto mt-4 max-w-xl text-teal-100">
            Nurses, care assistants, HCAs and support workers — NHS Band salaries shown on every listing.
            NMC, DBS and CQC fields built in. Reed and Indeed don&apos;t offer this depth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/healthcare"
              className="inline-block rounded-xl bg-white px-8 py-3 font-semibold text-brand hover:bg-teal-50"
            >
              Explore healthcare jobs
            </Link>
            <Link
              href="/pricing"
              className="inline-block rounded-xl border-2 border-white/40 px-8 py-3 font-semibold text-white hover:bg-white/10"
            >
              Hire healthcare staff
            </Link>
          </div>
        </div>
      </section>

      {/* Job alerts */}
      <section id="job-alerts" className="mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-2 items-start">
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden h-72 shadow-lg hidden lg:block">
            <UnsplashImage src={UNSPLASH.sections.nurse} alt="Healthcare worker" fill />
          </div>
          <NhsBandLookup />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Never miss a role</h2>
          <p className="mt-2 text-slate-600">
            Set up a free alert by email. We&apos;ll send matching jobs daily — healthcare, trades, or tech in your city.
          </p>
          <div className="mt-6">
            <JobAlertSignup />
          </div>
        </div>
      </section>

      {/* Employers — stronger CTA with value prop */}
      <section className="border-t border-slate-200 bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-medium text-teal-400 uppercase tracking-wide">For employers</p>
              <h2 className="mt-2 text-3xl font-bold text-white text-balance">
                Hire without agency fees or per-click costs
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Post unlimited jobs from £249/mo. AI scores every applicant. Branded careers page included.
                30-day free trial — cancel anytime.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><span className="text-teal-400">✓</span> Save vs Reed (£100+ per listing) and Hays (15–25% commission)</li>
                <li className="flex gap-2"><span className="text-teal-400">✓</span> Google Jobs syndication on every post</li>
                <li className="flex gap-2"><span className="text-teal-400">✓</span> Healthcare compliance fields (NMC, DBS, NHS Band)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8">
              <p className="text-sm text-slate-400">Growth plan</p>
              <p className="mt-1 text-4xl font-extrabold text-white">£249<span className="text-lg font-normal text-slate-400">/mo</span></p>
              <p className="mt-2 text-sm text-slate-400">Unlimited job posts · AI matching · CV database</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="flex-1 rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Start free trial
                </Link>
                <Link
                  href="/pricing"
                  className="flex-1 rounded-xl border border-slate-600 py-3 text-center text-sm font-semibold text-white hover:border-teal-400"
                >
                  View all plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
