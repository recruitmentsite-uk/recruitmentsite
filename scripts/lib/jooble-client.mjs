/**
 * Jooble job search API — https://jooble.org/api/about
 * POST https://jooble.org/api/{JOOBLE_API_KEY}
 */

import { expiresInDays, inferVertical, parseSalarySnippet, slugify, stripHtml } from "./job-normalize.mjs";

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

export function isJoobleConfigured() {
  return Boolean(JOOBLE_API_KEY);
}

export async function searchJoobleJobs({ keywords, location = "United Kingdom", page = 1 } = {}) {
  if (!JOOBLE_API_KEY) return null;

  const res = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords,
      location,
      page: String(page),
      companysearch: "false",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jooble ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

export function normalizeJoobleJob(job, verticalHint = "general") {
  const id = job.id != null ? String(job.id) : slugify(`${job.title}-${job.company}-${job.location}`);
  const { min, max } = parseSalarySnippet(job.salary);
  const title = job.title || "Untitled role";

  return {
    slug: `jooble-${id}`,
    title,
    description: stripHtml(job.snippet || title).slice(0, 4000),
    location: job.location || "UK",
    city: (job.location || "UK").split(",")[0].trim() || "UK",
    region: "UK",
    vertical: inferVertical(title, verticalHint),
    job_type: /contract|temporary|part.?time/i.test(job.type || "") ? "contract" : "permanent",
    remote: /remote/i.test(`${title} ${job.location || ""}`) ? "remote" : "onsite",
    salary_min: min,
    salary_max: max,
    salary_disclosed: !!(min || max),
    status: "active",
    published_at: job.updated ? new Date(job.updated).toISOString() : new Date().toISOString(),
    expires_at: expiresInDays(30),
    external_source: "jooble",
    external_id: id,
    compliance: {
      source: "jooble",
      redirect_url: job.link || null,
      employer_name: job.company || null,
      jooble_source: job.source || null,
    },
  };
}
