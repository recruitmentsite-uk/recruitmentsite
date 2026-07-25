import type { JobListing, Vertical } from "@placeuk/shared";
import { fetchJobBySlug, fetchJobsFromDb } from "./supabase";

/**
 * Public job inventory comes from Supabase only.
 * Hardcoded SAMPLE_JOBS are never shown on the live site.
 */
export async function getJobs(filters?: {
  vertical?: string;
  city?: string;
  q?: string;
}): Promise<JobListing[]> {
  const dbJobs = await fetchJobsFromDb(filters);
  if (!dbJobs) return [];
  return filterByQuery(dbJobs, filters?.q);
}

function filterByQuery(jobs: JobListing[], q?: string): JobListing[] {
  if (!q?.trim()) return jobs;
  const needle = q.trim().toLowerCase();
  return jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(needle) ||
      j.description.toLowerCase().includes(needle) ||
      j.employerName.toLowerCase().includes(needle) ||
      j.skills.some((s) => s.toLowerCase().includes(needle))
  );
}

export async function getJobBySlug(slug: string): Promise<JobListing | undefined> {
  const dbJob = await fetchJobBySlug(slug);
  return dbJob ?? undefined;
}

export async function getJobsByVertical(vertical: Vertical): Promise<JobListing[]> {
  return getJobs({ vertical });
}

export async function getAllJobSlugs(): Promise<string[]> {
  const jobs = await getJobs();
  return jobs.map((j) => j.slug);
}

export { getSiteUrl } from "./site";
