#!/usr/bin/env node
/**
 * Submit priority + recent job URLs to IndexNow (Bing / Yandex / partners).
 * Google still uses Search Console sitemap crawl; this accelerates other engines
 * and keeps fresh job URLs in the discovery pipeline.
 *
 * Usage:
 *   node scripts/submit-indexnow.mjs
 *   INDEXNOW_LIMIT=2000 node scripts/submit-indexnow.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk").replace(/\/$/, "");
const HOST = SITE.replace(/^https?:\/\//, "");
const KEY =
  process.env.INDEXNOW_KEY ||
  (() => {
    const p = join(root, "apps/web/public/indexnow-key.txt");
    return existsSync(p) ? readFileSync(p, "utf8").trim() : "";
  })();
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const LIMIT = Math.min(Number(process.env.INDEXNOW_LIMIT || 3000), 10000);
const BATCH = 1000;

const HUBS = [
  "/",
  "/jobs",
  "/healthcare",
  "/trades",
  "/tech",
  "/education",
  "/hospitality",
  "/logistics",
  "/finance",
  "/retail",
  "/legal",
  "/marketing",
  "/engineering",
  "/sectors",
  "/pricing",
  "/compare",
  "/for-employers",
  "/job-alerts",
  "/blog",
  "/nhs-band-salary-guide",
  "/salary-transparency",
  "/sitemap.xml",
];

async function keyLive() {
  const res = await fetch(KEY_LOCATION, { redirect: "follow" });
  const text = (await res.text()).trim();
  return { ok: res.ok && text.includes(KEY), status: res.status, text: text.slice(0, 80) };
}

async function collectUrls() {
  const urls = new Set(HUBS.map((p) => (p === "/" ? SITE : `${SITE}${p}`)));

  // Popular city SEO landings
  try {
    const shared = await import("@placeuk/shared");
    const cities = shared.POPULAR_CITIES ?? [];
    const cityToSlug = shared.cityToSlug;
    const verticalPaths = shared.VERTICAL_CITY_PATHS ?? [];
    const roles = shared.SEO_ROLE_PAGES ?? [];
    for (const city of cities) {
      const slug = cityToSlug(city);
      urls.add(`${SITE}/jobs/${slug}`);
      for (const vertical of verticalPaths) {
        urls.add(`${SITE}/${vertical}/jobs/${slug}`);
      }
    }
    for (const role of roles) {
      urls.add(`${SITE}/${role.vertical}/${role.slug}`);
    }
  } catch (e) {
    console.warn("  SEO page import skipped:", e.message);
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("jobs")
      .select("slug, updated_at, published_at")
      .eq("status", "active")
      .not("slug", "is", null)
      .order("updated_at", { ascending: false })
      .limit(LIMIT);
    if (error) {
      console.warn("  Supabase jobs fetch failed:", error.message);
    } else {
      for (const row of data ?? []) {
        if (row.slug) urls.add(`${SITE}/jobs/${encodeURIComponent(row.slug)}`);
      }
    }
  } else {
    console.warn("  No Supabase admin — submitting hubs / SEO pages only");
  }

  return [...urls];
}

async function submitBatch(urlList) {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });
  const body = await res.text().catch(() => "");
  return { status: res.status, ok: res.ok || res.status === 202, body: body.slice(0, 200) };
}

async function main() {
  console.log("IndexNow URL submission\n");
  if (!KEY) {
    console.error("✗ Missing INDEXNOW_KEY / apps/web/public/indexnow-key.txt");
    process.exit(1);
  }

  const live = await keyLive();
  console.log(`Key file ${KEY_LOCATION} → HTTP ${live.status}${live.ok ? " ✓" : " ✗"}`);
  if (!live.ok) {
    console.error("Deploy the key file to production before IndexNow will accept submissions.");
    console.error(`Expected body to contain: ${KEY}`);
    process.exit(1);
  }

  const urls = await collectUrls();
  console.log(`Collected ${urls.length} URLs (cap ${LIMIT} recent jobs + hubs/SEO)`);

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    const result = await submitBatch(batch);
    if (result.ok) {
      ok += batch.length;
      console.log(`  ✓ batch ${i / BATCH + 1}: ${batch.length} URLs → HTTP ${result.status}`);
    } else {
      fail += batch.length;
      console.error(`  ✗ batch ${i / BATCH + 1}: HTTP ${result.status} ${result.body}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone: ${ok} submitted, ${fail} failed`);
  console.log("Google: keep https://recruitmentsite.co.uk/sitemap.xml submitted in Search Console.");
  console.log("Tip: URL Inspection → Request indexing for / and top sector hubs weekly.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
