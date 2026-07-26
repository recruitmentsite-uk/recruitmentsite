import Link from "next/link";
import { VERTICAL_LABELS, UNSPLASH } from "@placeuk/shared";
import { getJobs } from "@/lib/jobs";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { JobSearchForm } from "@/components/JobSearchForm";
import { buildPageMetadata } from "@/lib/seo";

/** Runtime fetch — build-time Vercel pull masks service-role secrets as [Encrypted]. */
export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

interface JobsPageProps {
  searchParams: Promise<{
    vertical?: string;
    city?: string;
    q?: string;
    remote?: string;
    jobType?: string;
    page?: string;
  }>;
}

function jobsHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
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
    path: jobsHref({
      vertical: params.vertical,
      city: params.city,
      q: params.q,
      remote: params.remote,
      jobType: params.jobType,
    }),
  });
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const allJobs = await getJobs({
    vertical: params.vertical,
    city: params.city,
    q: params.q,
    remote: params.remote,
    jobType: params.jobType,
  });

  const total = allJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const jobs = allJobs.slice(start, start + PAGE_SIZE);

  const verticalLabel = params.vertical
    ? VERTICAL_LABELS[params.vertical as keyof typeof VERTICAL_LABELS]
    : params.q
      ? `"${params.q}"`
      : "All sectors";

  const titleSuffix = params.city ? ` in ${params.city}` : "";
  const hasFilters = Boolean(params.q || params.city || params.vertical || params.remote || params.jobType);

  const baseParams = {
    q: params.q,
    city: params.city,
    vertical: params.vertical,
    remote: params.remote,
    jobType: params.jobType,
  };

  const pill = (active: boolean) =>
    active
      ? "rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white shadow-md"
      : "rounded-full border border-ink/12 bg-white px-4 py-1.5 text-sm font-medium text-ink/60 transition-colors hover:border-brand hover:text-ink";

  const chips: { label: string; clearHref: string }[] = [];
  if (params.q) {
    chips.push({ label: `“${params.q}”`, clearHref: jobsHref({ ...baseParams, q: undefined, page: undefined }) });
  }
  if (params.city) {
    chips.push({
      label: params.city,
      clearHref: jobsHref({ ...baseParams, city: undefined, page: undefined }),
    });
  }
  if (params.vertical) {
    chips.push({
      label: verticalLabel,
      clearHref: jobsHref({ ...baseParams, vertical: undefined, page: undefined }),
    });
  }
  if (params.remote) {
    chips.push({
      label: params.remote,
      clearHref: jobsHref({ ...baseParams, remote: undefined, page: undefined }),
    });
  }
  if (params.jobType) {
    chips.push({
      label: params.jobType.replace("_", " "),
      clearHref: jobsHref({ ...baseParams, jobType: undefined, page: undefined }),
    });
  }

  return (
    <>
      <Hero
        image={UNSPLASH.hero.ukCity}
        badge={`${total.toLocaleString()} open roles`}
        title={`${verticalLabel} jobs${titleSuffix}`}
        subtitle="Verified employers · Salary shown on every listing · Apply free in under 5 minutes"
        secondaryCta={{ label: "For employers", href: "/pricing" }}
        align="left"
        size={hasFilters ? "compact" : "full"}
      >
        <JobSearchForm
          key={`${params.q ?? ""}|${params.city ?? ""}|${params.vertical ?? ""}`}
          jobCount={total}
          defaultQuery={params.q ?? ""}
          defaultCity={params.city ?? ""}
          preserveVertical={params.vertical}
        />
      </Hero>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          <Link href={jobsHref({ q: params.q, city: params.city, remote: params.remote, jobType: params.jobType })} className={pill(!params.vertical)}>
            All
          </Link>
          {Object.entries(VERTICAL_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={jobsHref({
                q: params.q,
                city: params.city,
                remote: params.remote,
                jobType: params.jobType,
                vertical: key,
              })}
              className={pill(params.vertical === key)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { key: "remote", value: "remote", label: "Remote" },
              { key: "remote", value: "hybrid", label: "Hybrid" },
              { key: "remote", value: "onsite", label: "On-site" },
              { key: "jobType", value: "permanent", label: "Permanent" },
              { key: "jobType", value: "contract", label: "Contract" },
            ] as const
          ).map((f) => {
            const active =
              f.key === "remote" ? params.remote === f.value : params.jobType === f.value;
            const next = {
              ...baseParams,
              [f.key]: active ? undefined : f.value,
              page: undefined,
            };
            return (
              <Link key={`${f.key}-${f.value}`} href={jobsHref(next)} className={pill(active)}>
                {f.label}
              </Link>
            );
          })}
        </div>

        {chips.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink/40">Active</span>
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.clearHref}
                className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-sm text-ink/70 transition hover:bg-brand/10 hover:text-brand"
              >
                {chip.label}
                <span aria-hidden className="text-ink/35">
                  ×
                </span>
              </Link>
            ))}
            <Link href="/jobs" className="text-sm font-medium text-brand hover:underline">
              Clear all
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <p className="text-sm text-ink/50">
                {total === 0
                  ? "No matching roles"
                  : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, total)} of ${total.toLocaleString()}`}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="mt-6 rounded-2xl border border-ink/10 bg-mist/60 px-6 py-12 text-center">
                <p className="font-display text-xl font-medium text-ink">No matching roles right now</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink/50">
                  Try another sector or city, or set up an alert and we&apos;ll notify you when new jobs are
                  posted.
                </p>
                <div className="mx-auto mt-6 max-w-xl">
                  <JobSearchForm variant="compact" defaultQuery={params.q ?? ""} defaultCity={params.city ?? ""} />
                </div>
                <a
                  href="#alerts"
                  className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Get job alerts
                </a>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-between gap-4" aria-label="Pagination">
                {safePage > 1 ? (
                  <Link
                    href={jobsHref({ ...baseParams, page: String(safePage - 1) })}
                    className="rounded-full border border-ink/12 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand"
                  >
                    Previous
                  </Link>
                ) : (
                  <span />
                )}
                <p className="text-sm text-ink/45">
                  Page {safePage} of {totalPages}
                </p>
                {safePage < totalPages ? (
                  <Link
                    href={jobsHref({ ...baseParams, page: String(safePage + 1) })}
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Next
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
          <aside id="alerts" className="shrink-0 lg:sticky lg:top-24 lg:w-80 lg:self-start">
            <JobAlertSignup />
          </aside>
        </div>
      </div>
    </>
  );
}
