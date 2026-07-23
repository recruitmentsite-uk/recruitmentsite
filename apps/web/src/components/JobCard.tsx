import Link from "next/link";
import type { JobListing } from "@placeuk/shared";
import { getVerticalImage } from "@placeuk/shared";
import { formatSalary, formatRelativeDate } from "@/lib/format";
import { UnsplashImage } from "./UnsplashImage";

interface JobCardProps {
  job: JobListing;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-brand/30 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-36 overflow-hidden">
        <UnsplashImage
          src={getVerticalImage(job.vertical)}
          alt={job.title}
          fill
          className="group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {job.featured && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow">
            Featured
          </span>
        )}
        <p className="absolute bottom-3 left-3 text-sm font-medium text-white drop-shadow">
          {job.city} · {job.region}
        </p>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{job.employerName}</p>
          </div>
          <p className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1 text-sm font-semibold text-brand">
            {formatSalary(job)}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-brand font-medium">
            {formatRelativeDate(job.publishedAt)}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 capitalize">
            {job.jobType.replace("_", " ")}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 capitalize">
            {job.remote}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {job.applicationCount} applicants
          </span>
        </div>
      </div>
    </Link>
  );
}
