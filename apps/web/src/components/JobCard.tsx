import Link from "next/link";
import type { JobListing } from "@placeuk/shared";
import { VERTICAL_LABELS } from "@placeuk/shared";
import { formatSalary, formatRelativeDate } from "@/lib/format";

interface JobCardProps {
  job: JobListing;
}

export function JobCard({ job }: JobCardProps) {
  const verticalLabel =
    VERTICAL_LABELS[job.vertical as keyof typeof VERTICAL_LABELS] ?? job.vertical;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block border-b border-ink/8 py-5 transition first:pt-0 last:border-0 hover:border-brand/30 sm:rounded-2xl sm:border sm:border-ink/8 sm:bg-white/70 sm:px-5 sm:py-5 sm:shadow-none sm:hover:border-brand/25 sm:hover:bg-white sm:hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {job.featured && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Featured
              </span>
            )}
            <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-ink/55">
              {verticalLabel}
            </span>
          </div>
          <h3 className="font-display text-xl font-medium tracking-tight text-ink transition-colors group-hover:text-brand">
            {job.title}
          </h3>
          <p className="mt-1.5 text-sm text-ink/50">
            {job.employerName}
            <span className="mx-1.5 text-ink/25">·</span>
            {job.city}
          </p>
        </div>
        <p className="shrink-0 text-right font-display text-lg font-medium text-brand">
          {formatSalary(job)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/45">
        <span>{formatRelativeDate(job.publishedAt)}</span>
        <span className="capitalize">{job.jobType.replace("_", " ")}</span>
        <span className="capitalize">{job.remote}</span>
      </div>
    </Link>
  );
}
