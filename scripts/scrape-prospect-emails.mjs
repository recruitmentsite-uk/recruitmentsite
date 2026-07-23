#!/usr/bin/env node
/**
 * Scrape real contact emails from employer websites.
 * Upgrades guessed emails when a public address is found on-site.
 *
 * Env:
 *   SCRAPE_LIMIT       Max prospects to process (0 = all pending)
 *   SCRAPE_CONCURRENCY Parallel fetches (default 8)
 *   SCRAPE_FORCE       Set to 1 to re-scrape verified/scraped records
 *   SCRAPE_SAVE_EVERY  Write JSON checkpoint interval (default 25)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  scrapeEmailsFromWebsite,
  normalizeWebsite,
  domainFromWebsite,
  guessEmails,
} from "./lib/email-scraper.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prospectsPath = join(__dirname, "../data/employer-prospects.json");
const progressPath = join(__dirname, "../data/scrape-progress.json");

const limit = Number(process.env.SCRAPE_LIMIT ?? 0);
const concurrency = Math.max(1, Number(process.env.SCRAPE_CONCURRENCY ?? 8));
const force = process.env.SCRAPE_FORCE === "1";
const saveEvery = Math.max(1, Number(process.env.SCRAPE_SAVE_EVERY ?? 25));

function loadProgress() {
  if (!existsSync(progressPath)) return { scrapedKeys: [] };
  return JSON.parse(readFileSync(progressPath, "utf8"));
}

function saveProgress(progress) {
  writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

function prospectKey(p) {
  return p.cqcLocationId ?? `${p.companyName}|${p.city}`.toLowerCase();
}

function needsScrape(p, scrapedKeys) {
  const key = prospectKey(p);
  if (scrapedKeys.has(key)) return false;
  if (!p.website && !normalizeWebsite(p.website)) return false;
  if (!force) {
    if (p.emailStatus === "verified_public" || p.emailStatus === "scraped") return false;
  }
  return true;
}

function applyScrapeResult(p, result) {
  const domain = result.domain ?? domainFromWebsite(normalizeWebsite(p.website));
  if (result.baseUrl) p.website = result.baseUrl;
  if (domain) p.domain = domain;

  if (result.best) {
    p.email = result.best;
    p.emailStatus = "scraped";
    p.emailCandidates = result.emails;
    p.scrapedAt = new Date().toISOString();
    p.scrapePagesFetched = result.pagesFetched;
    return "scraped";
  }

  if (domain && (!p.email || p.emailStatus === "needs_enrichment")) {
    p.emailCandidates = guessEmails(domain);
    p.email = p.emailCandidates[0];
    p.emailStatus = "guessed";
    p.scrapedAt = new Date().toISOString();
    p.scrapePagesFetched = result.pagesFetched;
    return "guessed";
  }

  p.scrapedAt = new Date().toISOString();
  p.scrapePagesFetched = result.pagesFetched;
  return "none";
}

async function mapPool(items, fn, poolSize) {
  const results = new Array(items.length);
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(poolSize, items.length) }, worker));
  return results;
}

function summarize(prospects) {
  const counts = {};
  for (const p of prospects) {
    const s = p.emailStatus ?? "none";
    counts[s] = (counts[s] ?? 0) + 1;
  }
  const sendable = prospects.filter(
    (p) =>
      p.email &&
      (p.emailStatus === "verified_public" ||
        p.emailStatus === "scraped" ||
        p.emailStatus === "guessed"),
  );
  return { counts, sendable: sendable.length, withWebsite: prospects.filter((p) => p.website).length };
}

async function main() {
  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  const progress = loadProgress();
  const scrapedKeys = new Set(progress.scrapedKeys ?? []);

  const pending = prospects
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => needsScrape(p, scrapedKeys));

  const batch = limit > 0 ? pending.slice(0, limit) : pending;

  console.log(`Email scraper — ${prospects.length.toLocaleString()} total prospects`);
  console.log(`  With website: ${prospects.filter((p) => p.website).length.toLocaleString()}`);
  console.log(`  Pending scrape: ${pending.length.toLocaleString()}`);
  console.log(`  This run: ${batch.length.toLocaleString()} (concurrency=${concurrency})`);
  if (force) console.log("  SCRAPE_FORCE=1 — re-scraping verified/scraped records");
  console.log("");

  const stats = { scraped: 0, guessed: 0, none: 0, errors: 0 };
  let processed = 0;

  await mapPool(
    batch,
    async ({ p, index }) => {
      const key = prospectKey(p);
      try {
        const website = normalizeWebsite(p.website) ?? p.website;
        const result = await scrapeEmailsFromWebsite(website);
        const outcome = applyScrapeResult(p, result);
        stats[outcome]++;
        scrapedKeys.add(key);
        processed++;

        if (processed % 10 === 0 || outcome === "scraped") {
          const tag = outcome === "scraped" ? "✓" : outcome === "guessed" ? "~" : "·";
          console.log(
            `  [${processed}/${batch.length}] ${tag} ${p.companyName?.slice(0, 40)} → ${p.email ?? "(none)"} (${p.emailStatus})`,
          );
        }

        if (processed % saveEvery === 0) {
          writeFileSync(prospectsPath, JSON.stringify(prospects, null, 2));
          saveProgress({ scrapedKeys: [...scrapedKeys], updatedAt: new Date().toISOString() });
          console.log(`  … checkpoint saved (${processed} processed)`);
        }
      } catch {
        stats.errors++;
        scrapedKeys.add(key);
      }
    },
    concurrency,
  );

  writeFileSync(prospectsPath, JSON.stringify(prospects, null, 2));
  saveProgress({ scrapedKeys: [...scrapedKeys], updatedAt: new Date().toISOString() });

  const summary = summarize(prospects);
  console.log("\n✓ Scrape run complete");
  console.log(`  Scraped (found on site): ${stats.scraped.toLocaleString()}`);
  console.log(`  Guessed (no email found): ${stats.guessed.toLocaleString()}`);
  console.log(`  No result: ${stats.none.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors.toLocaleString()}`);
  console.log(`  Email status breakdown:`, summary.counts);
  console.log(`  Total sendable: ${summary.sendable.toLocaleString()}`);

  const remaining = prospects.filter((p) => needsScrape(p, scrapedKeys)).length;
  if (remaining > 0) {
    console.log(`\n  ${remaining.toLocaleString()} still pending — re-run to continue`);
  } else {
    console.log("\n  All website prospects scraped.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
