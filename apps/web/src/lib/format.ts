import type { JobListing } from "@placeuk/shared";
import { formatGbp } from "@placeuk/shared";

export function formatSalary(job: JobListing): string {
  const { salary } = job;
  if (!salary.disclosed) return "Salary disclosed on apply";

  const suffix =
    salary.period === "year" ? "/yr" : salary.period === "hour" ? "/hr" : "/day";

  if (salary.min === salary.max) {
    return `${formatGbp(salary.min)}${suffix}`;
  }
  return `${formatGbp(salary.min)} – ${formatGbp(salary.max)}${suffix}`;
}

export function formatRelativeDate(isoDate: string): string {
  const published = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;
  if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  return `Posted ${published.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}
