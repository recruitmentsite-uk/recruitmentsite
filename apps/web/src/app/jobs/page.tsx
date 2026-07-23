import { VERTICAL_LABELS, UNSPLASH } from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { JobSearchForm } from "@/components/JobSearchForm";
import { buildPageMetadata } from "@/lib/seo";

interface JobsPageProps {
  searchParams: Promise<{ vertical?: string; city?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const verticalLabel = params.vertical
    ? VERTICAL_LABELS[params.vertical as keyof typeof VERTICAL_LABELS]
    : "All sectors";
  const cityPart = params.city ? ` in ${params.city}` : "";
  const queryPart = params.q ? ` — ${params.q}` : "";
  return buildPageMetadata({
    title: `${verticalLabel} Jobs UK${cityPart}${queryPart}`,
    description: `Browse ${verticalLabel.toLowerCase()} jobs${cityPart} with salary shown upfront. Apply free in under 5 minutes.`,
    path: params.vertical || params.city || params.q
      ? `/jobs?${new URLSearchParams({ ...(params.vertical && { vertical: params.vertical }), ...(params.city && { city: params.city }), ...(params.q && { q: params.q }) }).toString()}`
      : "/jobs",
  });
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const jobs = await getJobs({
    vertical: params.vertical,
    city: params.city,
    q: params.q,
  });

  const verticalLabel = params.vertical
    ? VERTICAL_LABELS[params.vertical as keyof typeof VERTICAL_LABELS]
    : params.q
      ? `"${params.q}"`
      : "All sectors";

  const titleSuffix = params.city ? ` in ${params.city}` : "";

  return (
    <>
      <Hero
        image={UNSPLASH.hero.ukCity}
        badge={`${jobs.length} open roles`}
        title={`${verticalLabel} jobs${titleSuffix}`}
        subtitle="Verified employers · Salary shown on every listing · Apply free in under 5 minutes"
        secondaryCta={{ label: "For employers", href: "/pricing" }}
        align="left"
      >
        <JobSearchForm jobCount={jobs.length} />
      </Hero>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap gap-2">
          <a
            href="/jobs"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!params.vertical ? "bg-brand text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-brand"}`}
          >
            All
          </a>
          {Object.entries(VERTICAL_LABELS).map(([key, label]) => (
            <a
              key={key}
              href={`/jobs?vertical=${key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${params.vertical === key ? "bg-brand text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-brand"}`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {jobs.length === 0 && (
              <p className="mt-10 text-center text-slate-500">No jobs in this category yet.</p>
            )}
          </div>
          <aside id="alerts" className="lg:w-80 shrink-0">
            <JobAlertSignup />
          </aside>
        </div>
      </div>
    </>
  );
}
