/**
 * Reed.co.uk job search API client.
 * Docs: https://www.reed.co.uk/developers/jobseeker
 * Auth: HTTP Basic with REED_API_KEY as username and empty password.
 */

const REED_API_KEY = process.env.REED_API_KEY;
const BASE = "https://www.reed.co.uk/api/1.0";

export function isReedConfigured() {
  return Boolean(REED_API_KEY);
}

export async function searchReedJobs({ keywords, locationName = "UK", resultsToTake = 20, resultsToSkip = 0 } = {}) {
  if (!REED_API_KEY) return null;

  const url = new URL(`${BASE}/search`);
  if (keywords) url.searchParams.set("keywords", keywords);
  if (locationName) url.searchParams.set("locationName", locationName);
  url.searchParams.set("resultsToTake", String(resultsToTake));
  url.searchParams.set("resultsToSkip", String(resultsToSkip));

  const auth = Buffer.from(`${REED_API_KEY}:`).toString("base64");
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Reed API ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

/** Reed returns UK dates as DD/MM/YYYY — Postgres needs ISO. */
export function parseReedDate(raw) {
  if (!raw) return new Date().toISOString();
  const uk = String(raw).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (uk) {
    const [, dd, mm, yyyy] = uk;
    return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T12:00:00.000Z`).toISOString();
  }
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

export function normalizeReedJob(job, vertical = "general") {
  const id = String(job.jobId);
  const title = job.jobTitle || "Untitled role";
  const slug = `reed-${id}`;
  const description = (job.jobDescription || title).replace(/<[^>]+>/g, " ").slice(0, 4000);
  const city = job.locationName || "UK";

  return {
    slug,
    title,
    description,
    location: city,
    city,
    region: "UK",
    vertical,
    job_type: /contract|temporary/i.test(job.contractType || "") ? "contract" : "permanent",
    salary_min: job.minimumSalary ?? null,
    salary_max: job.maximumSalary ?? null,
    salary_disclosed: !!(job.minimumSalary || job.maximumSalary),
    status: "active",
    published_at: parseReedDate(job.date),
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    external_source: "reed",
    external_id: id,
    compliance: {
      source: "reed",
      redirect_url: job.jobUrl || null,
      employer_name: job.employerName || null,
    },
  };
}
