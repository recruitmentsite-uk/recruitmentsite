#!/usr/bin/env node
/**
 * AI-polish existing bulk-seed job descriptions in Supabase.
 * Run: OPENAI_API_KEY=sk-... pnpm jobs:polish
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credsPath = join(__dirname, "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => process.env[k] ?? creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const url = pick("NEXT_PUBLIC_SUPABASE_URL") ?? pick("SUPABASE_URL");
const key = pick("SUPABASE_SERVICE_ROLE_KEY");
const openaiKey = pick("OPENAI_API_KEY");
const batchSize = Number(process.env.JOBS_POLISH_BATCH ?? 12);
const limit = Number(process.env.JOBS_POLISH_LIMIT ?? 500);

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}
if (!openaiKey) {
  console.error("Missing OPENAI_API_KEY — add to go-live-credentials.local.txt or env");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function fetchJobsNeedingPolish() {
  const res = await fetch(
    `${url}/rest/v1/jobs?status=eq.active&compliance->>source=eq.bulk-seed&enriched_at=is.null&select=id,slug,title,description,skills,city,vertical,compliance&order=published_at.desc&limit=${limit}`,
    { headers },
  );
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function polishBatch(batch) {
  const payload = batch.map((j, idx) => ({
    id: idx,
    title: j.title,
    company: j.compliance?.employer_display ?? "Employer",
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
            "Rewrite UK job listing descriptions to sound natural, specific, and credible. Keep salary and location facts unchanged. Avoid generic filler and clichés. Each listing must feel distinct. Return JSON: { descriptions: [{ id, description, skills: string[] }] }",
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content).descriptions ?? [];
}

async function updateJob(id, description, skills) {
  const res = await fetch(`${url}/rest/v1/jobs?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      description: description.slice(0, 4000),
      skills: skills?.slice(0, 8),
      enriched_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`Update ${id} failed: ${res.status}`);
}

async function main() {
  const jobs = await fetchJobsNeedingPolish();
  if (!jobs.length) {
    console.log("✓ No bulk-seed jobs need polishing");
    return;
  }

  console.log(`Polishing ${jobs.length} job descriptions (batch size ${batchSize})...`);
  let done = 0;

  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    try {
      const results = await polishBatch(batch);
      for (const item of results) {
        const job = batch[item.id];
        if (!job || !item.description) continue;
        await updateJob(job.id, item.description, item.skills ?? job.skills);
        done++;
      }
      process.stdout.write(".");
    } catch (err) {
      console.warn(`\n  Batch ${i / batchSize + 1} failed: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✓ Polished ${done}/${jobs.length} jobs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
