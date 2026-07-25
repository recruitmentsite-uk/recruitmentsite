/**
 * Public ATS career-board pullers (no API key required).
 * Greenhouse Board API, Lever postings, Workable widget.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { expiresInDays, inferVertical, slugify, stripHtml } from "./job-normalize.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_BOARDS = join(__dirname, "../../data/ats-boards.json");

export function loadAtsBoards(path = process.env.ATS_BOARDS_PATH || DEFAULT_BOARDS) {
  if (!existsSync(path)) return { greenhouse: [], lever: [], workable: [] };
  return JSON.parse(readFileSync(path, "utf8"));
}

function ukOnly(locationText) {
  const t = String(locationText || "").toLowerCase();
  if (!t) return true;
  if (/united kingdom|\buk\b|england|scotland|wales|london|manchester|birmingham|leeds|bristol|glasgow|edinburgh|remote/i.test(t)) {
    return true;
  }
  // Drop obvious non-UK offices
  if (/\b(usa|united states|new york|san francisco|berlin|paris|amsterdam|singapore|sydney)\b/i.test(t)) {
    return false;
  }
  return true;
}

export async function fetchGreenhouseJobs(token) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=true`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Greenhouse ${token}: ${res.status}`);
  const data = await res.json();
  return data.jobs ?? [];
}

export function normalizeGreenhouseJob(job, board) {
  const loc = job.location?.name || "UK";
  if (!ukOnly(loc)) return null;
  const title = job.title || "Untitled role";
  const id = String(job.id);
  return {
    slug: `gh-${board.token}-${id}`,
    title,
    description: stripHtml(job.content || title).slice(0, 4000),
    location: loc,
    city: loc.split(",")[0].trim() || "UK",
    region: "UK",
    vertical: inferVertical(title, board.vertical || "general"),
    job_type: "permanent",
    remote: /remote/i.test(loc) ? "remote" : /hybrid/i.test(loc) ? "hybrid" : "onsite",
    salary_min: null,
    salary_max: null,
    salary_disclosed: false,
    status: "active",
    published_at: job.updated_at || job.created_at || new Date().toISOString(),
    expires_at: expiresInDays(45),
    external_source: "greenhouse",
    external_id: `${board.token}:${id}`,
    compliance: {
      source: "greenhouse",
      redirect_url: job.absolute_url || null,
      employer_name: board.name,
      board_token: board.token,
    },
  };
}

export async function fetchLeverJobs(token) {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(token)}?mode=json`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Lever ${token}: ${res.status}`);
  return res.json();
}

export function normalizeLeverJob(job, board) {
  const loc = Array.isArray(job.categories?.location)
    ? job.categories.location.join(", ")
    : job.categories?.location || job.workplaceType || "UK";
  if (!ukOnly(loc)) return null;
  const title = job.text || "Untitled role";
  const id = String(job.id || slugify(title));
  const description = stripHtml(
    [job.descriptionPlain, job.description, job.lists?.map((l) => l.text).join("\n")]
      .flat()
      .filter(Boolean)
      .join("\n\n") || title,
  ).slice(0, 4000);

  return {
    slug: `lever-${board.token}-${id}`,
    title,
    description,
    location: loc,
    city: String(loc).split(",")[0].trim() || "UK",
    region: "UK",
    vertical: inferVertical(title, board.vertical || "general"),
    job_type: /contract/i.test(job.categories?.commitment || "") ? "contract" : "permanent",
    remote: /remote/i.test(String(loc)) ? "remote" : "onsite",
    salary_min: null,
    salary_max: null,
    salary_disclosed: false,
    status: "active",
    published_at: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
    expires_at: expiresInDays(45),
    external_source: "lever",
    external_id: `${board.token}:${id}`,
    compliance: {
      source: "lever",
      redirect_url: job.hostedUrl || job.applyUrl || null,
      employer_name: board.name,
      board_token: board.token,
    },
  };
}

export async function fetchWorkableJobs(token) {
  const url = `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(token)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Workable ${token}: ${res.status}`);
  const data = await res.json();
  return data.jobs ?? data.results ?? [];
}

export function normalizeWorkableJob(job, board) {
  const loc = [job.city, job.state, job.country].filter(Boolean).join(", ") || job.location || "UK";
  if (!ukOnly(loc)) return null;
  const title = job.title || "Untitled role";
  const id = String(job.shortcode || job.id || slugify(title));

  return {
    slug: `workable-${board.token}-${id}`,
    title,
    description: stripHtml(job.description || job.snippet || title).slice(0, 4000),
    location: loc,
    city: job.city || String(loc).split(",")[0].trim() || "UK",
    region: job.state || "UK",
    vertical: inferVertical(title, board.vertical || "general"),
    job_type: /contract|temporary/i.test(job.employment_type || "") ? "contract" : "permanent",
    remote: /remote/i.test(String(loc)) ? "remote" : "onsite",
    salary_min: null,
    salary_max: null,
    salary_disclosed: false,
    status: "active",
    published_at: job.published_on || job.created_at || new Date().toISOString(),
    expires_at: expiresInDays(45),
    external_source: "workable",
    external_id: `${board.token}:${id}`,
    compliance: {
      source: "workable",
      redirect_url: job.url || job.application_url || null,
      employer_name: board.name,
      board_token: board.token,
    },
  };
}
