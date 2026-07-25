import Link from "next/link";
import {
  POPULAR_CITIES,
  VERTICAL_LABELS,
  formatGbp,
  getVerticalImage,
  cityToSlug,
  type Vertical,
} from "@placeuk/shared";
import type { JobListing } from "@placeuk/shared";
import { Hero } from "./Hero";
import { JobCard } from "./JobCard";
import { JobAlertSignup } from "./JobAlertSignup";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

interface CityJobLandingProps {
  city: string;
  jobs: JobListing[];
  vertical?: Vertical;
  breadcrumbs: BreadcrumbItem[];
  heroImage: string;
}

export function CityJobLanding({ city, jobs, vertical, breadcrumbs, heroImage }: CityJobLandingProps) {
  const verticalLabel = vertical ? VERTICAL_LABELS[vertical] : "All sectors";
  const title = vertical ? `${verticalLabel} jobs in ${city}` : `Jobs in ${city}`;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <Hero
        image={heroImage}
        badge={`${jobs.length} open roles`}
        title={title}
        subtitle="Verified UK employers · Salary shown on every listing · Apply free in under 5 minutes"
        primaryCta={{
          label: "Browse all jobs",
          href: vertical
            ? `/jobs?vertical=${vertical}&city=${encodeURIComponent(city)}`
            : `/jobs?city=${encodeURIComponent(city)}`,
        }}
        secondaryCta={{ label: "Set up job alert", href: "/job-alerts" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">Open roles in {city}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {jobs.length === 0 && (
              <p className="mt-8 text-center text-slate-500">
                No roles in {city} yet —{" "}
                <Link href="/job-alerts" className="text-brand font-semibold hover:underline">
                  set up an alert
                </Link>{" "}
                to be notified when new jobs are posted.
              </p>
            )}
          </div>
          <aside className="space-y-6">
            <JobAlertSignup />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Other cities</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {POPULAR_CITIES.filter((c) => c !== city)
                  .slice(0, 6)
                  .map((c) => (
                    <li key={c}>
                      <Link
                        href={vertical ? `/${vertical}/jobs/${cityToSlug(c)}` : `/jobs/${cityToSlug(c)}`}
                        className="text-brand hover:underline"
                      >
                        Jobs in {c}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

const ROLE_HIRE_SLUG: Record<string, string> = {
  "nurse-jobs": "nurses",
  "care-assistant-jobs": "care-assistants",
  "hca-jobs": "care-assistants",
  "support-worker-jobs": "care-assistants",
  "rmn-jobs": "nurses",
  "physiotherapist-jobs": "nurses",
  "occupational-therapist-jobs": "nurses",
  "practice-nurse-jobs": "practice-nurses",
  "electrician-jobs": "electricians",
  "plumber-jobs": "electricians",
  "site-manager-jobs": "electricians",
  "software-developer-jobs": "software-developers",
  "devops-jobs": "software-developers",
};

interface RoleJobLandingProps {
  role: {
    slug: string;
    title: string;
    headline: string;
    description: string;
    vertical: Vertical;
    searchQuery: string;
    salaryMin?: number;
    salaryMax?: number;
    tags: readonly string[];
    employerGuide?: string;
  };
  jobs: JobListing[];
  breadcrumbs: BreadcrumbItem[];
  heroImage: string;
  verticalPath: string;
}

export function RoleJobLanding({ role, jobs, breadcrumbs, heroImage, verticalPath }: RoleJobLandingProps) {
  const hireSlug = ROLE_HIRE_SLUG[role.slug];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <Hero
        image={heroImage}
        badge={`${jobs.length} open roles`}
        title={role.headline}
        subtitle={role.description}
        primaryCta={{
          label: `Browse ${role.title.toLowerCase()}`,
          href: `/jobs?q=${encodeURIComponent(role.searchQuery)}&vertical=${role.vertical}`,
        }}
        secondaryCta={
          hireSlug
            ? { label: "Hire for this role", href: `/hire/${hireSlug}` }
            : { label: "Employer pricing", href: "/pricing" }
        }
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {role.salaryMin && role.salaryMax && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
                <p className="text-sm font-medium text-brand">Typical salary range</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {formatGbp(role.salaryMin)} – {formatGbp(role.salaryMax)}
                  <span className="text-base font-normal text-slate-500">/year</span>
                </p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-slate-900">Latest {role.title.toLowerCase()}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {jobs.length === 0 && (
                <p className="mt-6 text-slate-500">
                  New roles added daily.{" "}
                  <Link href="/job-alerts" className="text-brand font-semibold hover:underline">
                    Create a free alert
                  </Link>
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Key requirements</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {role.employerGuide && (
              <div className="rounded-2xl border border-brand/20 bg-teal-50 p-5">
                <h3 className="font-semibold text-brand">For employers</h3>
                <p className="mt-2 text-sm text-slate-600">{role.employerGuide}</p>
                <Link href="/for-employers" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
                  Learn more →
                </Link>
              </div>
            )}
            <JobAlertSignup />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Browse by city</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {POPULAR_CITIES.slice(0, 5).map((city) => (
                  <li key={city}>
                    <Link href={`${verticalPath}/jobs/${cityToSlug(city)}`} className="text-brand hover:underline">
                      {role.title} in {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export function getVerticalHeroImage(vertical: Vertical): string {
  return getVerticalImage(vertical);
}
