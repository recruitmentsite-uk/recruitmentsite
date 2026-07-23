#!/usr/bin/env node
/**
 * Add Resend DNS records to Cloudflare and trigger verification.
 * Reads RESEND_API_KEY + CLOUDFLARE_API_TOKEN from go-live-credentials.local.txt
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const domain = "recruitmentsite.co.uk";
const resendKey = process.env.RESEND_API_KEY ?? pick("RESEND_API_KEY");
const cfToken = process.env.CLOUDFLARE_API_TOKEN ?? pick("CLOUDFLARE_API_TOKEN");

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

async function resend(path, opts = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${path}: ${body.message ?? res.statusText}`);
  return body;
}

function recordName(fullName) {
  if (!fullName || fullName === domain) return "@";
  const suffix = `.${domain}`;
  if (fullName.endsWith(suffix)) return fullName.slice(0, -suffix.length);
  return fullName;
}

async function upsert(zoneId, record) {
  const type = record.type.toUpperCase();
  const name = recordName(record.name);
  const content = record.value?.replace(/^"|"$/g, "") ?? record.value;
  const fqdn = name === "@" ? domain : `${name}.${domain}`;
  const existing = await cf(`/zones/${zoneId}/dns_records?type=${type}&name=${encodeURIComponent(fqdn)}`);
  const payload = { type, name, content, ttl: 1, proxied: false, ...(record.priority != null ? { priority: record.priority } : {}) };
  if (existing?.length) {
    await cf(`/zones/${zoneId}/dns_records/${existing[0].id}`, { method: "PATCH", body: JSON.stringify(payload) });
    console.log(`  ✓ Updated ${type} ${name}`);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, { method: "POST", body: JSON.stringify(payload) });
    console.log(`  ✓ Created ${type} ${name}`);
  }
}

if (!resendKey || !cfToken) {
  console.error("Need RESEND_API_KEY and CLOUDFLARE_API_TOKEN in go-live-credentials.local.txt");
  process.exit(1);
}

const zones = await cf(`/zones?name=${domain}`);
const zoneId = zones[0]?.id;
if (!zoneId) throw new Error("Zone not found");

const listed = await resend("/domains");
const found = listed.data?.find((d) => d.name === domain);
if (!found) throw new Error("Resend domain not found");

const detail = await resend(`/domains/${found.id}`);
console.log(`Resend domain status: ${detail.status}`);
console.log("Adding DNS records...\n");

for (const r of detail.records ?? []) {
  if (r.record === "Tracking") continue;
  await upsert(zoneId, r);
}

await resend(`/domains/${found.id}/verify`, { method: "POST", body: "{}" });

for (let i = 0; i < 12; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  const check = await resend(`/domains/${found.id}`);
  console.log(`  Status: ${check.status}`);
  if (check.status === "verified") {
    console.log("\n✓ Domain verified");
    process.exit(0);
  }
}
console.log("\nVerification pending — DNS may need more propagation time.");
