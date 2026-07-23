#!/usr/bin/env node
/**
 * Opens visible Chrome, waits for Cloudflare login, then adds Resend DNS records.
 * Run: node scripts/cloudflare-add-resend-interactive.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = readFileSync(credsPath, "utf8");
const cfLogin = creds.match(/Cloudflare[\s\S]*?Login: (\S+) \/ (\S+)/)?.[1];
const cfPass = creds.match(/Cloudflare[\s\S]*?Login: (\S+) \/ (\S+)/)?.[2];
const resendKey = creds.match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
const domain = "recruitmentsite.co.uk";
const dnsUrl =
  "https://dash.cloudflare.com/dc66fd6d2b192f104141cbfe9dac1c73/recruitmentsite.co.uk/dns/records";

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
  if (!body.success) throw new Error(JSON.stringify(body.errors ?? body));
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

async function waitForSession(request, page, maxMs = 600000) {
  console.log("→ Complete Cloudflare login/captcha in the Chrome window if shown.\n");
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const zones = await cfApi(request, `/zones?name=${domain}`);
      if (zones?.[0]?.id) return zones[0].id;
    } catch {
      /* not logged in yet */
    }
    await page.waitForTimeout(3000);
  }
  throw new Error("Timed out — log into Cloudflare in the Chrome window, then re-run.");
}

async function verifyResend() {
  if (!resendKey) return false;
  const listed = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${resendKey}` },
  }).then((r) => r.json());
  const found = listed?.data?.find((d) => d.name === domain);
  if (!found) return false;
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
    if (check.status === "verified") return true;
  }
  return false;
}

console.log("Opening Chrome — complete Cloudflare captcha/login if prompted...\n");

const browser = await chromium.launch({
  headless: false,
  channel: "chrome",
  args: ["--start-maximized"],
});
const context = await browser.newContext({ viewport: null });
const page = await context.newPage();
const request = context.request;

await page.goto(dnsUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
console.log("Waiting for Cloudflare session...");
const zoneId = await waitForSession(request, page);
console.log(`✓ Logged in — zone ${zoneId}\nAdding Resend DNS records:`);

for (const record of RECORDS) {
  await upsertRecord(request, zoneId, record);
}

console.log("\n✓ All 3 DNS records added.");
console.log("Triggering Resend verification...");
const verified = await verifyResend();
console.log(verified ? "\n✓ Resend domain verified!" : "\nResend still pending — may take a few minutes.");

await page.waitForTimeout(3000);
await browser.close();
