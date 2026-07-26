#!/usr/bin/env node
/**
 * Sync inbound jobs into Supabase:
 *  - Adzuna (expanded multi-query / multi-page)
 *  - Reed Jobseeker API
 *  - Jooble aggregator (optional JOOBLE_API_KEY)
 *  - Public ATS boards: Greenhouse, Lever, Workable (data/ats-boards.json)
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { isReedConfigured, normalizeReedJob, searchReedJobs } from "./lib/reed-client.mjs";
import {
  ADZUNA_QUERIES,
  isAdzunaConfigured,
  normalizeAdzunaJob,
  searchAdzunaJobs,
} from "./lib/adzuna-client.mjs";
import { isJoobleConfigured, normalizeJoobleJob, searchJoobleJobs } from "./lib/jooble-client.mjs";
import {
  fetchGreenhouseJobs,
  fetchLeverJobs,
  fetchWorkableJobs,
  loadAtsBoards,
  normalizeGreenhouseJob,
  normalizeLeverJob,
  normalizeWorkableJob,
} from "./lib/ats-boards.mjs";
import { upsertJob } from "./lib/job-normalize.mjs";

const ADZUNA_PAGES = Number(process.env.ADZUNA_SYNC_PAGES || 2);
const ADZUNA_PER_PAGE = Number(process.env.ADZUNA_SYNC_PER_PAGE || 50);
const ATS_MAX_PER_BOARD = Number(process.env.ATS_MAX_PER_BOARD || 40);

async function syncAdzuna(supabase, counts) {
  if (!isAdzunaConfigured()) {
    console.log("⚠  Set ADZUNA_APP_ID and ADZUNA_APP_KEY to sync from Adzuna");
    return;
  }
  console.log(`Adzuna: ${Object.keys(ADZUNA_QUERIES).length} verticals × up to ${ADZUNA_PAGES} pages…`);
  for (const [vertical, queries] of Object.entries(ADZUNA_QUERIES)) {
    for (const what of queries) {
      for (let page = 1; page <= ADZUNA_PAGES; page++) {
        try {
          const data = await searchAdzunaJobs({ what, page, resultsPerPage: ADZUNA_PER_PAGE });
          const results = data?.results ?? [];
          if (!results.length) break;
          for (const ad of results) {
            const row = normalizeAdzunaJob(ad, vertical);
            if (await upsertJob(supabase, row)) {
              counts.total++;
              counts.adzuna++;
            }
          }
        } catch (err) {
          console.error(`  Adzuna failed (${vertical}/${what} p${page}):`, err.message);
        }
      }
    }
  }
  console.log(`  Adzuna upserted: ${counts.adzuna}`);
}

const REED_PER_PAGE = Number(process.env.REED_SYNC_PER_PAGE || 100);
const REED_PAGES = Number(process.env.REED_SYNC_PAGES || 3);
const REED_DELAY_MS = Number(process.env.REED_SYNC_DELAY_MS || 200);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function syncReed(supabase, counts) {
  if (!isReedConfigured()) {
    console.log("⚠  Set REED_API_KEY to sync from Reed");
    return;
  }
  const seen = new Set();
  console.log(
    `Reed: ${Object.keys(ADZUNA_QUERIES).length} verticals × all keywords × up to ${REED_PAGES} pages (${REED_PER_PAGE}/page)…`,
  );
  for (const [vertical, queries] of Object.entries(ADZUNA_QUERIES)) {
    for (const keywords of queries) {
      for (let page = 0; page < REED_PAGES; page++) {
        try {
          const data = await searchReedJobs({
            keywords,
            locationName: "UK",
            resultsToTake: REED_PER_PAGE,
            resultsToSkip: page * REED_PER_PAGE,
          });
          const results = data?.results ?? [];
          if (page === 0) {
            console.log(
              `  Reed ${vertical}/${keywords}: page1=${results.length} (total=${data?.totalResults ?? "?"})`,
            );
          }
          if (!results.length) break;
          for (const job of results) {
            const id = String(job.jobId);
            if (seen.has(id)) continue;
            seen.add(id);
            const row = normalizeReedJob(job, vertical);
            if (await upsertJob(supabase, row)) {
              counts.total++;
              counts.reed++;
            }
          }
          if (results.length < REED_PER_PAGE) break;
          if (REED_DELAY_MS > 0) await sleep(REED_DELAY_MS);
        } catch (err) {
          console.error(`  Reed sync failed (${vertical}/${keywords} p${page}):`, err.message);
          break;
        }
      }
    }
  }
  console.log(`  Reed upserted: ${counts.reed} (unique ids seen=${seen.size})`);
}

async function syncJooble(supabase, counts) {
  if (!isJoobleConfigured()) {
    console.log("○ Jooble skipped (set JOOBLE_API_KEY — https://jooble.org/api/about)");
    return;
  }
  console.log("Jooble: pulling by vertical…");
  for (const [vertical, queries] of Object.entries(ADZUNA_QUERIES)) {
    const keywords = queries[0];
    try {
      const data = await searchJoobleJobs({ keywords, location: "United Kingdom", page: 1 });
      const jobs = data?.jobs ?? [];
      console.log(`  Jooble ${vertical}: ${jobs.length} (total=${data?.totalCount ?? "?"})`);
      for (const job of jobs.slice(0, 20)) {
        const row = normalizeJoobleJob(job, vertical);
        if (await upsertJob(supabase, row)) {
          counts.total++;
          counts.jooble++;
        }
      }
    } catch (err) {
      console.error(`  Jooble failed (${vertical}):`, err.message);
    }
  }
  console.log(`  Jooble upserted: ${counts.jooble}`);
}

async function syncAts(supabase, counts) {
  const boards = loadAtsBoards();
  const gh = boards.greenhouse ?? [];
  const lever = boards.lever ?? [];
  const workable = boards.workable ?? [];
  console.log(`ATS boards: ${gh.length} Greenhouse · ${lever.length} Lever · ${workable.length} Workable`);

  for (const board of gh) {
    try {
      const jobs = await fetchGreenhouseJobs(board.token);
      let n = 0;
      for (const job of jobs.slice(0, ATS_MAX_PER_BOARD)) {
        const row = normalizeGreenhouseJob(job, board);
        if (!row) continue;
        if (await upsertJob(supabase, row)) {
          counts.total++;
          counts.ats++;
          n++;
        }
      }
      console.log(`  Greenhouse ${board.token}: ${n}/${jobs.length}`);
    } catch (err) {
      console.error(`  Greenhouse ${board.token}:`, err.message);
    }
  }

  for (const board of lever) {
    try {
      const jobs = await fetchLeverJobs(board.token);
      let n = 0;
      for (const job of (Array.isArray(jobs) ? jobs : []).slice(0, ATS_MAX_PER_BOARD)) {
        const row = normalizeLeverJob(job, board);
        if (!row) continue;
        if (await upsertJob(supabase, row)) {
          counts.total++;
          counts.ats++;
          n++;
        }
      }
      console.log(`  Lever ${board.token}: ${n}`);
    } catch (err) {
      console.error(`  Lever ${board.token}:`, err.message);
    }
  }

  for (const board of workable) {
    try {
      const jobs = await fetchWorkableJobs(board.token);
      let n = 0;
      for (const job of jobs.slice(0, ATS_MAX_PER_BOARD)) {
        const row = normalizeWorkableJob(job, board);
        if (!row) continue;
        if (await upsertJob(supabase, row)) {
          counts.total++;
          counts.ats++;
          n++;
        }
      }
      console.log(`  Workable ${board.token}: ${n}`);
    } catch (err) {
      console.error(`  Workable ${board.token}:`, err.message);
    }
  }

  console.log(`  ATS upserted: ${counts.ats}`);
}

async function main() {
  const reedOnly = process.argv.includes("--reed-only");
  console.log(
    reedOnly
      ? "Recruitment Site job sync — Reed only\n"
      : "Recruitment Site job sync — Adzuna + Reed + Jooble + ATS boards\n",
  );

  const supabase = getSupabaseAdmin();
  if (!supabase) console.log("⚠  No Supabase admin client — dry-run mode\n");

  const counts = { total: 0, adzuna: 0, reed: 0, jooble: 0, ats: 0 };

  if (!reedOnly) await syncAdzuna(supabase, counts);
  await syncReed(supabase, counts);
  if (!reedOnly) {
    await syncJooble(supabase, counts);
    await syncAts(supabase, counts);
  }

  console.log(
    `\n✓ Synced ${counts.total} jobs (adzuna=${counts.adzuna}, reed=${counts.reed}, jooble=${counts.jooble}, ats=${counts.ats})`,
  );
  console.log("Schedule: daily 06:00 UTC via .github/workflows/automation.yml");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
