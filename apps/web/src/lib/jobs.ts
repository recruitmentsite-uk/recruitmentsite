import { SAMPLE_JOBS, type JobListing, type Vertical } from "@placeuk/shared";
import { fetchJobBySlug, fetchJobsFromDb } from "./supabase";

export async function getJobs(filters?: {
  vertical?: string;
  city?: string;
  q?: string;
}): Promise<JobListing[]> {
  const dbJobs = await fetchJobsFromDb(filters);
  if (dbJobs && dbJobs.length > 0) return filterByQuery(dbJobs, filters?.q);

  let jobs = SAMPLE_JOBS.filter((j) => j.status === "active");
  if (filters?.vertical) {
    jobs = jobs.filter((j) => j.vertical === filters.vertical);
  }
  if (filters?.city) {
    const city = filters.city.toLowerCase();
    jobs = jobs.filter((j) => j.city.toLowerCase().includes(city));
  }
  return filterByQuery(jobs, filters?.q);
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
  if (dbJob) return dbJob;
  return SAMPLE_JOBS.find((j) => j.slug === slug && j.status === "active");
}

export async function getJobsByVertical(vertical: Vertical): Promise<JobListing[]> {
  return getJobs({ vertical });
}

export async function getAllJobSlugs(): Promise<string[]> {
  const jobs = await getJobs();
  return jobs.map((j) => j.slug);
}

export { getSiteUrl } from "./site";
