import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { JobListing, Vertical } from "@placeuk/shared";
import { isUsableEnvValue, isValidHttpUrl } from "@/lib/env";

let client: SupabaseClient | null = null;

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isUsableEnvValue(url) || !isValidHttpUrl(url)) {
    return null;
  }

  return {
    url,
    anonKey: isUsableEnvValue(anonKey) ? anonKey : null,
    serviceKey: isUsableEnvValue(serviceKey) ? serviceKey : null,
  };
}

export function getSupabase(): SupabaseClient | null {
  const config = supabaseConfig();
  if (!config?.anonKey) return null;
  if (!client) client = createClient(config.url, config.anonKey);
  return client;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const config = supabaseConfig();
  if (!config?.serviceKey) return null;
  return createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface DbJobRow {
  id: string;
  slug: string;
  title: string;
  employer_id: string;
  description: string;
  location: string;
  city: string;
  region: string;
  postcode: string | null;
  remote: string;
  job_type: string;
  vertical: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  salary_disclosed: boolean;
  skills: string[];
  status: string;
  featured: boolean;
  application_count: number;
  view_count?: number;
  published_at: string | null;
  expires_at: string | null;
  compliance?: { employer_display?: string; source?: string } | null;
  employers?: { company_name: string } | { company_name: string }[];
}

export function mapDbJob(row: DbJobRow, employerName?: string): JobListing {
  const emp = row.employers;
  const name =
    employerName ??
    row.compliance?.employer_display ??
    (Array.isArray(emp) ? emp[0]?.company_name : emp?.company_name) ??
    "Employer";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    employerId: row.employer_id,
    employerName: name,
    description: row.description,
    location: row.location,
    city: row.city,
    region: row.region,
    postcode: row.postcode ?? undefined,
    remote: row.remote as JobListing["remote"],
    jobType: row.job_type as JobListing["jobType"],
    vertical: row.vertical as Vertical,
    salary: {
      min: Number(row.salary_min ?? 0),
      max: Number(row.salary_max ?? 0),
      currency: "GBP",
      period: (row.salary_period as JobListing["salary"]["period"]) ?? "year",
      disclosed: row.salary_disclosed,
    },
    skills: row.skills ?? [],
    status: row.status as JobListing["status"],
    featured: row.featured,
    applicationCount: row.application_count ?? 0,
    publishedAt: row.published_at ?? new Date().toISOString(),
    expiresAt: row.expires_at ?? new Date(Date.now() + 30 * 86400000).toISOString(),
  };
}

/** Synthetic inventory from seed scripts — never show on the public site. */
const HIDDEN_JOB_SOURCES = new Set(["demo-seed", "bulk-seed"]);

function isPublicJob(row: DbJobRow): boolean {
  return !HIDDEN_JOB_SOURCES.has(row.compliance?.source ?? "");
}

const PAGE_SIZE = 1000;
/** Cap for public listings / sitemap — enough for SEO without blowing response size. */
const MAX_PUBLIC_JOBS = 5000;

export async function fetchJobsFromDb(filters?: {
  vertical?: string;
  city?: string;
  q?: string;
}): Promise<JobListing[] | null> {
  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return null;

  const jobs: JobListing[] = [];
  let from = 0;

  while (jobs.length < MAX_PUBLIC_JOBS) {
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("jobs")
      .select("*, employers(company_name)")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .range(from, to);

    if (filters?.vertical) query = query.eq("vertical", filters.vertical);
    if (filters?.city) query = query.ilike("city", `%${filters.city}%`);

    const { data, error } = await query;
    if (error) {
      return from === 0 ? null : jobs;
    }
    if (!data?.length) break;

    for (const row of data) {
      const mapped = row as DbJobRow;
      if (!isPublicJob(mapped)) continue;
      jobs.push(mapDbJob(mapped));
      if (jobs.length >= MAX_PUBLIC_JOBS) break;
    }

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return jobs;
}

export async function fetchJobBySlug(slug: string): Promise<JobListing | null> {
  const supabase = getSupabaseAdmin() ?? getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("jobs")
    .select("*, employers(company_name)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  const row = data as DbJobRow;
  if (!isPublicJob(row)) return null;
  return mapDbJob(row);
}
