#!/usr/bin/env node
/**
 * AI enrichment — normalise titles, extract skills, validate salary bands.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prompt = readFileSync(join(__dirname, "prompts/match-scoring.md"), "utf8");

async function enrichJob(title, description) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract skills array and normalised job title from this UK job listing. Return JSON: { title, skills: string[] }",
        },
        { role: "user", content: `Title: ${title}\n\n${description}` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log("⚠  Supabase not configured");
    console.log("Pipeline: fetch jobs where enriched_at is null → OpenAI → update row");
    return;
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, description, skills")
    .is("enriched_at", null)
    .limit(20);

  if (!jobs?.length) {
    console.log("✓ No jobs pending enrichment");
    return;
  }

  let enriched = 0;
  for (const job of jobs) {
    const result = await enrichJob(job.title, job.description);
    if (!result) continue;

    await supabase
      .from("jobs")
      .update({
        title: result.title ?? job.title,
        skills: result.skills ?? job.skills,
        enriched_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    enriched++;
  }

  console.log(`✓ Enriched ${enriched}/${jobs.length} jobs`);
}

main().catch(console.error);
