#!/usr/bin/env node
/**
 * Add Google Search Console TXT verification record to Cloudflare DNS.
 * Usage: node scripts/add-gsc-dns-cloudflare.mjs "google-site-verification=TOKEN"
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const domain = "recruitmentsite.co.uk";
const cfToken = process.env.CLOUDFLARE_API_TOKEN ?? pick("CLOUDFLARE_API_TOKEN");
const content = (process.argv[2] || "").trim();

if (!cfToken) {
  console.error("Need CLOUDFLARE_API_TOKEN in go-live-credentials.local.txt");
  process.exit(1);
}
if (!content.startsWith("google-site-verification=")) {
  console.error('Usage: node scripts/add-gsc-dns-cloudflare.mjs "google-site-verification=TOKEN"');
  process.exit(1);
}

async function cf(path, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${cfToken}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!body.success) throw new Error(`Cloudflare ${path}: ${JSON.stringify(body.errors ?? body)}`);
  return body.result;
}

const zones = await cf(`/zones?name=${domain}`);
const zoneId = zones[0]?.id;
if (!zoneId) throw new Error("Zone not found for " + domain);

const existing = await cf(
  `/zones/${zoneId}/dns_records?type=TXT&name=${encodeURIComponent(domain)}`,
);
const match = existing?.find((r) => String(r.content).replace(/^"|"$/g, "") === content);
const payload = { type: "TXT", name: "@", content, ttl: 1, proxied: false };

if (match) {
  console.log("✓ TXT already present for", domain);
} else {
  await cf(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(payload) });
  console.log("✓ Created TXT @ →", content.slice(0, 40) + "…");
}

console.log("\nNext: Google Search Console → Verify ownership → Domain name provider → Verify");
