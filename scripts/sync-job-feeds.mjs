#!/usr/bin/env node
/**
 * Sync jobs from Adzuna + Reed APIs into Supabase for SEO backfill + affiliate revenue.
 * Adzuna: developer.adzuna.com — REED: reed.co.uk/developers (REED_API_KEY).
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { isReedConfigured, normalizeReedJob, searchReedJobs } from "./lib/reed-client.mjs";

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const FEED_EMPLOYER_ID = "00000000-0000-0000-0000-000000000001";

const VERTICAL_KEYWORDS = {
  healthcare: "nurse",
  trades: "electrician",
  tech: "software developer",
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
  console.log("Recruitment Site job sync — Adzuna + Reed + internal feeds\n");

  if (!APP_ID || !APP_KEY) {
    console.log("⚠  Set ADZUNA_APP_ID and ADZUNA_APP_KEY to sync from Adzuna");
    console.log("   Register free at https://developer.adzuna.com/");
  }
  if (!isReedConfigured()) {
    console.log("⚠  Set REED_API_KEY to sync from Reed (https://www.reed.co.uk/developers)");
  }
  console.log("");

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
            employer_id: FEED_EMPLOYER_ID,
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
            external_source: "adzuna",
            external_id: ad.id ? String(ad.id) : null,
            compliance: { source: "adzuna", redirect_url: ad.redirect_url },
          },
          { onConflict: "slug", ignoreDuplicates: true },
        );
        if (!error) synced++;
      } else {
        console.log(`  [dry-run] adzuna: ${ad.title} — ${ad.location?.display_name} (${vertical})`);
        synced++;
      }
    }
  }

  let reedSynced = 0;
  if (isReedConfigured()) {
    console.log("Reed: pulling healthcare / trades / tech…");
    for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
      try {
        const data = await searchReedJobs({
          keywords,
          locationName: "UK",
          resultsToTake: 25,
          resultsToSkip: 0,
        });
        const results = data?.results ?? [];
        console.log(`  Reed ${vertical}: ${results.length} results (total=${data?.totalResults ?? "?"})`);
        for (const job of results) {
          const row = normalizeReedJob(job, vertical);
          if (supabase) {
            const { error } = await supabase.from("jobs").upsert(
              { employer_id: FEED_EMPLOYER_ID, ...row },
              { onConflict: "slug", ignoreDuplicates: true },
            );
            if (error) {
              console.error(`  Reed upsert failed (${row.slug}):`, error.message);
            } else {
              synced++;
              reedSynced++;
            }
          } else {
            console.log(`  [dry-run] reed: ${row.title} — ${row.city} (${vertical})`);
            synced++;
            reedSynced++;
          }
        }
      } catch (err) {
        console.error(`  Reed sync failed (${vertical}):`, err.message);
      }
    }
  }

  console.log(`\n✓ Synced ${synced} jobs (${reedSynced} from Reed)`);
  console.log("Schedule: daily 06:00 UTC via .github/workflows/automation.yml");
}

main().catch(console.error);
