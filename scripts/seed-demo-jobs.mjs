#!/usr/bin/env node
/** Seed active demo jobs for launch (no Adzuna required). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => process.env[k] ?? creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const url = pick("NEXT_PUBLIC_SUPABASE_URL");
const key = pick("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

const SYSTEM_EMPLOYER = "00000000-0000-0000-0000-000000000001";
const expires = new Date(Date.now() + 30 * 86400000).toISOString();
const published = new Date().toISOString();

const demos = [
  {
    slug: "demo-registered-nurse-london",
    title: "Registered Nurse — NHS Trust",
    description:
      "Band 5 Registered Nurse for a busy London NHS trust. Ward-based role with training provided. NMC registration required.",
    location: "London, UK",
    city: "London",
    region: "Greater London",
    vertical: "healthcare",
    job_type: "permanent",
    salary_min: 28000,
    salary_max: 35000,
    remote: "onsite",
  },
  {
    slug: "demo-electrician-manchester",
    title: "Electrician — Commercial Projects",
    description: "JIB-registered electrician for commercial fit-outs across Greater Manchester.",
    location: "Manchester, UK",
    city: "Manchester",
    region: "Greater Manchester",
    vertical: "trades",
    job_type: "permanent",
    salary_min: 32000,
    salary_max: 42000,
    remote: "onsite",
  },
  {
    slug: "demo-fullstack-developer-remote",
    title: "Full Stack Developer — Remote (UK)",
    description: "TypeScript/React and Node.js product team. Remote-first within UK time zones.",
    location: "Remote, UK",
    city: "Remote",
    region: "UK",
    vertical: "tech",
    job_type: "permanent",
    salary_min: 55000,
    salary_max: 75000,
    remote: "remote",
  },
  {
    slug: "demo-hca-birmingham",
    title: "Healthcare Assistant — Care Home",
    description: "HCA for a CQC-rated good care home in Birmingham. NVQ Level 2 or willingness to train.",
    location: "Birmingham, UK",
    city: "Birmingham",
    region: "West Midlands",
    vertical: "healthcare",
    job_type: "permanent",
    salary_min: 22000,
    salary_max: 26000,
    remote: "onsite",
  },
  {
    slug: "demo-plumber-bristol",
    title: "Plumber — Domestic & Commercial",
    description: "Experienced plumber for reactive maintenance and new installs across Bristol and Bath.",
    location: "Bristol, UK",
    city: "Bristol",
    region: "South West",
    vertical: "trades",
    job_type: "permanent",
    salary_min: 30000,
    salary_max: 38000,
    remote: "onsite",
  },
  {
    slug: "demo-devops-engineer-leeds",
    title: "DevOps Engineer — SaaS Platform",
    description: "AWS/Kubernetes platform engineer. Hybrid 2 days/week in Leeds.",
    location: "Leeds, UK",
    city: "Leeds",
    region: "West Yorkshire",
    vertical: "tech",
    job_type: "permanent",
    salary_min: 60000,
    salary_max: 80000,
    remote: "hybrid",
  },
];

const rows = demos.map((job) => ({
  employer_id: SYSTEM_EMPLOYER,
  ...job,
  status: "active",
  featured: false,
  salary_disclosed: true,
  salary_period: "year",
  published_at: published,
  expires_at: expires,
  compliance: { source: "demo-seed" },
}));

const res = await fetch(`${url}/rest/v1/jobs?on_conflict=slug`, {
  method: "POST",
  headers,
  body: JSON.stringify(rows),
});

if (!res.ok) {
  console.error("Seed failed:", res.status, await res.text());
  process.exit(1);
}

for (const job of demos) console.log("✓", job.title);
console.log(`\n${demos.length} demo jobs upserted`);
