#!/usr/bin/env node
/**
 * Add Resend DNS via Cloudflare dashboard API using Chrome Profile 17 (dark green Rbee Mehmood).
 * Run: node scripts/cloudflare-add-resend-profile17.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const resendKey = readFileSync(credsPath, "utf8").match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
const domain = "recruitmentsite.co.uk";
const dnsUrl =
  "https://dash.cloudflare.com/dc66fd6d2b192f104141cbfe9dac1c73/recruitmentsite.co.uk/dns/records";
const userDataDir = join(process.env.LOCALAPPDATA, "Google", "Chrome", "User Data");
const profileDir = "Profile 17";

const RECORDS = [
  {
    type: "TXT",
    name: "resend._domainkey",
    content:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmiG8KCQpg7dqtSwirqfarkxkuAFM0Js1ISlczLxlL107tfu8NixPIKWohOZ9s7SDYjZAcNRaecx1F2ygz0yrliAHPZNworhxFkBIZKTMYsyNw2mDK6CcSrmQCVgLBRuouR1GMi9fZ+3KC/a82DNjCAwZLWQj4xUrbIj1m+aZEHwIDAQAB",
  },
  { type: "MX", name: "send", content: "feedback-smtp.eu-west-1.amazonses.com", priority: 10 },
  { type: "TXT", name: "send", content: "v=spf1 include:amazonses.com ~all" },
];

async function cfApi(request, path, opts = {}) {
  const res = await request.fetch(`https://dash.cloudflare.com/api/v4${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    ...opts,
  });
  const body = await res.json();
  if (!body.success) throw new Error(`${path}: ${JSON.stringify(body.errors ?? body)}`);
  return body.result;
}

async function upsertRecord(request, zoneId, record) {
  const fqdn = `${record.name}.${domain}`;
  const existing = await cfApi(
    request,
    `/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(fqdn)}`,
  );
  const payload = {
    type: record.type,
    name: record.name,
    content: record.content,
    ttl: 1,
    proxied: false,
    ...(record.priority != null ? { priority: record.priority } : {}),
  };
  if (existing?.length) {
    await cfApi(request, `/zones/${zoneId}/dns_records/${existing[0].id}`, {
      method: "PATCH",
      data: payload,
    });
    console.log(`  ✓ Updated ${record.type} ${record.name}`);
  } else {
    await cfApi(request, `/zones/${zoneId}/dns_records`, { method: "POST", data: payload });
    console.log(`  ✓ Created ${record.type} ${record.name}`);
  }
}

async function waitForSession(request, maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const zones = await cfApi(request, `/zones?name=${domain}`);
      if (zones?.[0]?.id) return zones[0].id;
    } catch {
      /* waiting for login */
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Not logged into Cloudflare in Profile 17 — log in in the Chrome window.");
}

console.log("Opening Chrome Profile 17 (dark green Rbee Mehmood)...\n");

const context = await chromium.launchPersistentContext(userDataDir, {
  channel: "chrome",
  headless: false,
  args: [`--profile-directory=${profileDir}`],
  viewport: null,
});
const page = context.pages()[0] ?? (await context.newPage());
const request = context.request;

await page.goto(dnsUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
console.log("Waiting for Cloudflare session...");
const zoneId = await waitForSession(request);
console.log(`✓ Zone ${zoneId}\nAdding records:`);

for (const record of RECORDS) {
  await upsertRecord(request, zoneId, record);
}

console.log("\n✓ DNS records added.");

if (resendKey) {
  const listed = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${resendKey}` },
  }).then((r) => r.json());
  const found = listed?.data?.find((d) => d.name === domain);
  if (found) {
    await fetch(`https://api.resend.com/domains/${found.id}/verify`, {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: "{}",
    });
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 10000));
      const check = await fetch(`https://api.resend.com/domains/${found.id}`, {
        headers: { Authorization: `Bearer ${resendKey}` },
      }).then((r) => r.json());
      console.log(`  Resend: ${check.status}`);
      if (check.status === "verified") break;
    }
  }
}

await page.waitForTimeout(2000);
await context.close();
