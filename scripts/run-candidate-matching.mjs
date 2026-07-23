#!/usr/bin/env node
/**
 * Score applications with OpenAI and notify employers of strong matches.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { appendEmailLegalFooter, EMAIL_FROM } from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function scoreMatch(jobDescription, cvText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { score: 50, summary: "AI scoring unavailable — manual review required" };

  const systemPrompt = readFileSync(join(__dirname, "prompts/match-scoring.md"), "utf8");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Job:\n${jobDescription}\n\nCandidate CV:\n${cvText.slice(0, 4000)}`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return { score: 50, summary: "Scoring failed" };
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function main() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log("⚠  Supabase not configured — matching worker stub");
    return;
  }

  const { data: pending } = await supabase
    .from("applications")
    .select("id, job_id, guest_cv_path, cover_note, jobs(title, description)")
    .is("match_score", null)
    .limit(10);

  if (!pending?.length) {
    console.log("✓ No applications pending scoring");
    return;
  }

  for (const app of pending) {
    let cvText = app.cover_note ?? "";
    if (app.guest_cv_path) {
      const { data: file } = await supabase.storage.from("cvs").download(app.guest_cv_path);
      if (file) cvText += "\n" + (await file.text()).slice(0, 3000);
    }

    const job = app.jobs;
    const result = await scoreMatch(job?.description ?? "", cvText);

    await supabase
      .from("applications")
      .update({ match_score: result.score, match_summary: result.summary })
      .eq("id", app.id);

    if (result.score >= 70 && process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: process.env.EMPLOYER_NOTIFY_EMAIL ?? "hello@recruitmentsite.co.uk",
          subject: `Strong match (${result.score}/100): ${job?.title}`,
          text: appendEmailLegalFooter(result.summary),
        }),
      }).catch(() => null);
    }

    console.log(`  Scored application ${app.id}: ${result.score}/100`);
  }

  console.log(`✓ Processed ${pending.length} applications`);
}

main().catch(console.error);
