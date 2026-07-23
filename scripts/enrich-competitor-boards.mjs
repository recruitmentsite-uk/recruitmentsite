#!/usr/bin/env node
/**
 * Find employers actively hiring on Reed/Indeed/Hays and match to CQC prospects.
 *
 * Env:
 *   COMPETITOR_MAX_PAGES   Reed pages per search (default 8)
 *   COMPETITOR_DELAY_MS    Delay between Reed requests (default 1500)
 *   COMPETITOR_LIMIT       Max searches to run this session (0 = all)
 *   ADZUNA_APP_ID/KEY      Optional — also searches Adzuna (covers Indeed/Reed redirects)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import {
  CARE_SEARCHES,
  LOCATION_SLUGS,
  scrapeReedSearch,
  scrapeAdzunaSearch,
} from "./lib/job-board-scraper.mjs";
import { buildProspectIndex, matchProspect } from "./lib/prospect-match.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prospectsPath = join(__dirname, "../data/employer-prospects.json");
const progressPath = join(__dirname, "../data/competitor-search-progress.json");
const employersPath = join(__dirname, "../data/competitor-employers.json");

const maxPages = Number(process.env.COMPETITOR_MAX_PAGES ?? 8);
const delayMs = Number(process.env.COMPETITOR_DELAY_MS ?? 1500);
const searchLimit = Number(process.env.COMPETITOR_LIMIT ?? 0);

function loadProgress() {
  if (!existsSync(progressPath)) {
    return { completedSearches: [], employers: {}, updatedAt: null };
  }
  return JSON.parse(readFileSync(progressPath, "utf8"));
}

function saveProgress(progress) {
  progress.updatedAt = new Date().toISOString();
  writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

function searchKey(type, slug, location) {
  return `${type}:${slug}:${location ?? "uk"}`;
}

function addEmployer(store, listing) {
  const key = (listing.employer ?? "").toLowerCase();
  if (!key) return;

  if (!store[key]) {
    store[key] = {
      employer: listing.employer,
      boards: {},
      roles: [],
      locations: [],
      jobUrls: [],
    };
  }

  const entry = store[key];
  entry.boards[listing.board] = (entry.boards[listing.board] ?? 0) + 1;
  if (listing.role && !entry.roles.includes(listing.role)) entry.roles.push(listing.role);
  if (listing.location && !entry.locations.includes(listing.location)) {
    entry.locations.push(listing.location);
  }
  if (listing.jobUrl && entry.jobUrls.length < 5) entry.jobUrls.push(listing.jobUrl);
}

function primaryBoard(entry) {
  return Object.entries(entry.boards).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Reed";
}

async function main() {
  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  const progress = loadProgress();
  const completed = new Set(progress.completedSearches ?? []);
  const employers = progress.employers ?? {};
  const index = buildProspectIndex(prospects);

  const searches = [];
  for (const { slug, role } of CARE_SEARCHES) {
    for (const location of LOCATION_SLUGS) {
      searches.push({ type: "reed", slug, role, location, key: searchKey("reed", slug, location) });
    }
  }

  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) {
    for (const { role } of CARE_SEARCHES) {
      for (const location of ["uk", ...LOCATION_SLUGS.slice(0, 10)]) {
        searches.push({
          type: "adzuna",
          what: role,
          location,
          key: searchKey("adzuna", role, location),
        });
      }
    }
  }

  const pending = searches.filter((s) => !completed.has(s.key));
  const batch = searchLimit > 0 ? pending.slice(0, searchLimit) : pending;

  console.log(`Competitor employer search — ${prospects.length.toLocaleString()} prospects`);
  console.log(`  Searches: ${batch.length.toLocaleString()} pending this run (${pending.length.toLocaleString()} total remaining)`);
  console.log(`  Known employers on competitor boards: ${Object.keys(employers).length.toLocaleString()}\n`);

  let matched = 0;
  let listingsFound = 0;
  let errors = 0;

  for (let i = 0; i < batch.length; i++) {
    const search = batch[i];
    let listings = [];

    try {
      if (search.type === "reed") {
        const result = await scrapeReedSearch({
          slug: search.slug,
          locationSlug: search.location,
          maxPages,
          delayMs,
        });
        listings = result.listings;
        console.log(
          `  [${i + 1}/${batch.length}] Reed ${search.slug} / ${search.location} → ${listings.length} listings (${result.pagesFetched} pages)`,
        );
      } else {
        const result = await scrapeAdzunaSearch({
          what: search.what,
          where: search.location,
          maxPages: 3,
        });
        listings = result.listings;
        console.log(
          `  [${i + 1}/${batch.length}] Adzuna ${search.what} / ${search.location} → ${listings.length} listings`,
        );
      }
    } catch (err) {
      errors++;
      console.log(
        `  [${i + 1}/${batch.length}] ✗ ${search.type} ${search.slug ?? search.what} / ${search.location} — ${err.message ?? err}`,
      );
      await sleep(delayMs * 2);
      continue;
    }

    listingsFound += listings.length;

    for (const listing of listings) {
      addEmployer(employers, listing);
      const idx = matchProspect(listing.employer, index, listing.location);
      if (idx == null) continue;

      const p = prospects[idx];
      const board = listing.board;
      p.competitorBoard = board;
      p.hiringSignal = `${listing.role} on ${board}`;
      p.competitorVerified = true;
      p.competitorCheckedAt = new Date().toISOString();
      if (!p.outreachHook?.includes("verified")) {
        p.outreachHook = `Verified hiring on ${board} — ${p.outreachHook ?? "CQC-registered care employer"}`;
      }
      matched++;
    }

    completed.add(search.key);
    progress.completedSearches = [...completed];
    progress.employers = employers;

    if ((i + 1) % 10 === 0) {
      writeFileSync(prospectsPath, JSON.stringify(prospects, null, 2));
      saveProgress(progress);
      console.log(`  … checkpoint (${Object.keys(employers).length} employers, ${matched} matches, ${errors} errors)`);
    }

    await sleep(delayMs);
  }

  writeFileSync(prospectsPath, JSON.stringify(prospects, null, 2));
  saveProgress(progress);

  const employerList = Object.values(employers).sort(
    (a, b) =>
      Object.values(b.boards).reduce((s, n) => s + n, 0) -
      Object.values(a.boards).reduce((s, n) => s + n, 0),
  );
  writeFileSync(
    employersPath,
    JSON.stringify(
      employerList.map((e) => ({
        employer: e.employer,
        primaryBoard: primaryBoard(e),
        boards: e.boards,
        roles: e.roles.slice(0, 5),
        locations: e.locations.slice(0, 5),
      })),
      null,
      2,
    ),
  );

  const verified = prospects.filter((p) => p.competitorVerified);
  console.log("\n✓ Competitor search run complete");
  console.log(`  Listings collected: ${listingsFound.toLocaleString()}`);
  console.log(`  Unique employers: ${Object.keys(employers).length.toLocaleString()}`);
  console.log(`  Prospects matched: ${verified.length.toLocaleString()} (${matched} this run)`);
  console.log(`  Errors (skipped): ${errors.toLocaleString()}`);
  console.log(`  Export → data/competitor-employers.json`);

  const remaining = searches.filter((s) => !completed.has(s.key)).length;
  if (remaining > 0) {
    console.log(`\n  ${remaining.toLocaleString()} searches remaining — re-run to continue`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
