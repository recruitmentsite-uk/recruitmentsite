#!/usr/bin/env node
/**
 * Post-deploy / cloud site smoke — HTTP checks only (no local credentials file).
 */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk").replace(/\/$/, "");

const PATHS = [
  "/",
  "/jobs",
  "/pricing",
  "/for-employers",
  "/feeds/indeed.xml",
  "/feeds/linkedin.xml",
  "/sitemap.xml",
  "/recruitmentsite-indexnow-7f3a9c2e1b84.txt",
];

async function check(path) {
  const url = `${SITE}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    return { path, status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (err) {
    return { path, status: 0, ok: false, error: err.message };
  }
}

const results = [];
for (const path of PATHS) {
  const r = await check(path);
  results.push(r);
  console.log(`${r.ok ? "✓" : "✗"} ${r.path} → ${r.status}${r.error ? ` (${r.error})` : ""}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\nSite smoke failed: ${failed.length}/${results.length}`);
  process.exit(1);
}
console.log(`\n✓ Site smoke OK (${results.length} URLs)`);
