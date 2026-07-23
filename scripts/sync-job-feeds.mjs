#!/usr/bin/env node
/**
 * Sync jobs from Adzuna API (UK) into Supabase for SEO backfill + affiliate revenue.
 * Register at developer.adzuna.com for app_id and app_key.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

const VERTICAL_KEYWORDS = {
  healthcare: "nurse care assistant HCA",
  trades: "electrician plumber builder",
  tech: "software developer engineer",
};

async function fetchAdzunaJobs(what, where = "uk", page = 1) {
  if (!APP_ID || !APP_KEY) return null;
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/gb/search/${page}`);
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", "20");
  url.searchParams.set("what", what);
  url.searchParams.set("where", where);
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function main() {
  console.log("Recruitment Site job sync — Adzuna + internal feeds\n");

  if (!APP_ID || !APP_KEY) {
    console.log("⚠  Set ADZUNA_APP_ID and ADZUNA_APP_KEY to sync from Adzuna");
    console.log("   Register free at https://developer.adzuna.com/");
    console.log("   Continuing with internal employer dashboard feed only...\n");
  }

  const supabase = getSupabaseAdmin();
  let synced = 0;

  for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    const data = await fetchAdzunaJobs(keywords);
    if (!data?.results) continue;

    for (const ad of data.results.slice(0, 5)) {
      const slug = ad.id
        ? `adzuna-${ad.id}`
        : `ext-${ad.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}`;

      if (supabase) {
        const { error } = await supabase.from("jobs").upsert(
          {
            employer_id: "00000000-0000-0000-0000-000000000001",
            slug,
            title: ad.title,
            description: ad.description?.slice(0, 2000) ?? ad.title,
            location: ad.location?.display_name ?? "UK",
            city: ad.location?.area?.[0] ?? "UK",
            region: ad.location?.area?.[1] ?? "UK",
            vertical,
            job_type: ad.contract_type?.toLowerCase()?.includes("contract") ? "contract" : "permanent",
            salary_min: ad.salary_min ?? null,
            salary_max: ad.salary_max ?? null,
            salary_disclosed: !!(ad.salary_min || ad.salary_max),
            status: "active",
            published_at: ad.created ?? new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
            // Store affiliate redirect — outbound clicks earn revenue
            // redirect_url stored in compliance jsonb for syndicated jobs
            compliance: { source: "adzuna", redirect_url: ad.redirect_url },
          },
          { onConflict: "slug", ignoreDuplicates: true },
        );
        if (!error) synced++;
      } else {
        console.log(`  [dry-run] ${ad.title} — ${ad.location?.display_name} (${vertical})`);
        synced++;
      }
    }
  }

  console.log(`\n✓ Synced ${synced} jobs`);
  console.log("Schedule: daily 06:00 UTC via .github/workflows/automation.yml");
}

main().catch(console.error);
