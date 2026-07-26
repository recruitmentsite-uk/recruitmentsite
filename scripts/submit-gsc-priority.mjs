#!/usr/bin/env node
/**
 * Print / optionally open the Google Search Console checklist for manual
 * indexing boosts (Google has no public bulk "request indexing" without API).
 *
 * If GOOGLE_SERVICE_ACCOUNT_JSON is set (service account JSON string or path)
 * and the account is an Owner on the GSC property, also ping the Indexing API
 * for JobPosting URLs (officially supported for job pages).
 *
 * Usage:
 *   node scripts/submit-gsc-priority.mjs
 *   GOOGLE_INDEXING_LIMIT=50 node scripts/submit-gsc-priority.mjs --api
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createSign } from "node:crypto";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk").replace(/\/$/, "");
const useApi = process.argv.includes("--api");
const API_LIMIT = Math.min(Number(process.env.GOOGLE_INDEXING_LIMIT || 100), 200);

const PRIORITY = [
  `${SITE}/`,
  `${SITE}/jobs`,
  `${SITE}/healthcare`,
  `${SITE}/trades`,
  `${SITE}/tech`,
  `${SITE}/education`,
  `${SITE}/for-employers`,
  `${SITE}/pricing`,
  `${SITE}/nhs-band-salary-guide`,
  `${SITE}/compare`,
];

function loadServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  if (raw.startsWith("{")) return JSON.parse(raw);
  const path = raw.startsWith("/") || /^[A-Za-z]:/.test(raw) ? raw : join(root, raw);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const unsigned = `${header}.${claim}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const sig = sign.sign(sa.private_key, "base64url");
  const jwt = `${unsigned}.${sig}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "token failed");
  return data.access_token;
}

async function publishUrl(token, url) {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type: "URL_UPDATED" }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function recentJobUrls() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase
    .from("jobs")
    .select("slug")
    .eq("status", "active")
    .not("slug", "is", null)
    .order("updated_at", { ascending: false })
    .limit(API_LIMIT);
  return (data ?? []).filter((r) => r.slug).map((r) => `${SITE}/jobs/${encodeURIComponent(r.slug)}`);
}

async function main() {
  console.log("Google Search Console / Indexing\n");
  console.log(`Property: ${SITE}`);
  console.log(`Sitemap:  ${SITE}/sitemap.xml`);
  console.log("");
  console.log("Manual (account: rbee.mehmood@gmail.com):");
  console.log("1. https://search.google.com/search-console?resource_id=sc-domain:recruitmentsite.co.uk");
  console.log("   (or URL-prefix property https://recruitmentsite.co.uk/)");
  console.log("2. Sitemaps → Add/resubmit sitemap.xml");
  console.log("3. URL Inspection → Request indexing for these hubs:");
  for (const u of PRIORITY) console.log(`   - ${u}`);
  console.log("4. Pages → watch Indexed vs Not indexed over 7–14 days");
  console.log("");

  if (!useApi) {
    console.log("API mode off. Re-run with --api after adding GOOGLE_SERVICE_ACCOUNT_JSON.");
    console.log("Service account must be added as Owner in GSC → Settings → Users.");
    return;
  }

  const sa = loadServiceAccount();
  if (!sa) {
    console.error("✗ Set GOOGLE_SERVICE_ACCOUNT_JSON to a service-account JSON path or string");
    process.exit(1);
  }

  const token = await getAccessToken(sa);
  const urls = [...PRIORITY, ...(await recentJobUrls())].slice(0, API_LIMIT);
  console.log(`Publishing ${urls.length} URLs via Indexing API…`);
  let ok = 0;
  for (const url of urls) {
    const result = await publishUrl(token, url);
    if (result.ok) {
      ok++;
      console.log(`  ✓ ${url}`);
    } else {
      console.log(`  ✗ ${url} → ${result.status} ${JSON.stringify(result.body).slice(0, 120)}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`\nDone: ${ok}/${urls.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
