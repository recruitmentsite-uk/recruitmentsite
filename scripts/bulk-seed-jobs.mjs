#!/usr/bin/env node
/**
 * Seed 200+ realistic UK job listings across cities and verticals.
 * Uses combinatorial templates; optionally rewrites descriptions via OpenAI.
 *
 * Run: pnpm jobs:seed
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: OPENAI_API_KEY for AI-polished descriptions
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateJobListings } from "./lib/uk-job-generator.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credsPath = join(__dirname, "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => process.env[k] ?? creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const url = pick("NEXT_PUBLIC_SUPABASE_URL") ?? pick("SUPABASE_URL");
const key = pick("SUPABASE_SERVICE_ROLE_KEY");
const openaiKey = pick("OPENAI_API_KEY");

const TARGET = Number(process.env.JOBS_SEED_COUNT ?? 220);
const JOBS_PER_CITY = Number(process.env.JOBS_PER_CITY ?? 5);
const USE_AI = process.env.JOBS_SEED_AI !== "0" && !!openaiKey;

if (!url || !key) {
  console.error("Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=minimal",
};

async function aiPolishDescriptions(jobs) {
  if (!USE_AI) return jobs;

  console.log(`Polishing descriptions with OpenAI (${jobs.length} jobs in batches of 12)...`);
  const polished = [...jobs];
  const batchSize = 12;

  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    const payload = batch.map((j, idx) => ({
      id: idx,
      title: j.title,
      company: j.company_name,
      city: j.city,
      vertical: j.vertical,
      draft: j.description,
    }));

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.85,
        messages: [
          {
            role: "system",
            content:
              "Rewrite UK job listing descriptions to sound natural, specific, and credible. Keep salary and location facts unchanged. Avoid generic filler. Each listing must feel distinct. Return JSON: { descriptions: [{ id, description, skills: string[] }] }",
          },
          { role: "user", content: JSON.stringify(payload) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn(`  OpenAI batch ${i / batchSize + 1} failed (${res.status}) — using templates`);
      continue;
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    for (const item of parsed.descriptions ?? []) {
      const target = polished[i + item.id];
      if (!target) continue;
      if (item.description) target.description = item.description.slice(0, 4000);
      if (item.skills?.length) target.skills = item.skills.slice(0, 8);
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("\n✓ AI polish complete");
  return polished;
}

async function upsertEmployers(jobs) {
  const bySlug = new Map();
  for (const job of jobs) {
    if (!bySlug.has(job.employer_slug)) {
      bySlug.set(job.employer_slug, {
        slug: job.employer_slug,
        company_name: job.company_name,
        vertical: job.vertical,
        plan: "starter",
        active_job_limit: 50,
      });
    }
  }

  const employers = [...bySlug.values()];
  const idBySlug = new Map();

  for (let i = 0; i < employers.length; i += 50) {
    const chunk = employers.slice(i, i + 50);
    const res = await fetch(`${url}/rest/v1/employers?on_conflict=slug&select=id,slug`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) throw new Error(`Employer upsert failed: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    for (const row of rows) idBySlug.set(row.slug, row.id);
  }

  return idBySlug;
}

async function upsertJobs(jobs, idBySlug) {
  const published = new Date().toISOString();
  const expires = new Date(Date.now() + 30 * 86400000).toISOString();
  let inserted = 0;

  const rows = jobs.map((job) => ({
    employer_id: idBySlug.get(job.employer_slug),
    slug: job.slug,
    title: job.title,
    description: job.description,
    location: job.location,
    city: job.city,
    region: job.region,
    postcode: job.postcode,
    vertical: job.vertical,
    job_type: job.job_type,
    remote: job.remote,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_period: job.salary_period,
    salary_disclosed: job.salary_disclosed,
    skills: job.skills,
    status: "active",
    featured: job.featured,
    published_at: published,
    expires_at: expires,
    compliance: { ...job.compliance, employer_display: job.company_name },
    enriched_at: USE_AI ? published : null,
  }));

  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const res = await fetch(`${url}/rest/v1/jobs?on_conflict=slug`, {
      method: "POST",
      headers,
      body: JSON.stringify(chunk),
    });
    if (!res.ok) throw new Error(`Job upsert failed: ${res.status} ${await res.text()}`);
    inserted += chunk.length;
    process.stdout.write(".");
  }

  console.log(`\n✓ Upserted ${inserted} jobs`);
  return inserted;
}

async function countActiveJobs() {
  const res = await fetch(`${url}/rest/v1/jobs?status=eq.active&select=id`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
  });
  const range = res.headers.get("content-range");
  return range?.split("/")?.[1] ?? "?";
}

async function main() {
  console.log(`Recruitment Site — bulk job seed (target: ${TARGET})\n`);

  let jobs = generateJobListings(TARGET, JOBS_PER_CITY);
  console.log(`Generated ${jobs.length} unique listings across ${new Set(jobs.map((j) => j.city)).size} cities`);

  jobs = await aiPolishDescriptions(jobs);

  console.log("Upserting employers...");
  const idBySlug = await upsertEmployers(jobs);
  console.log(`✓ ${idBySlug.size} employers ready`);

  console.log("Upserting jobs...");
  await upsertJobs(jobs, idBySlug);

  const total = await countActiveJobs();
  console.log(`\nActive jobs in database: ${total}`);
  console.log("Done — listings use vertical Unsplash images on the job board UI.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
