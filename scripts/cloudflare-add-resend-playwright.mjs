#!/usr/bin/env node
/**
 * Log into Cloudflare and add Resend DNS records via dashboard API (session cookies).
 * Reads credentials from go-live-credentials.local.txt.
 *
 * Run: node scripts/cloudflare-add-resend-playwright.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credsPath = join(__dirname, "..", "go-live-credentials.local.txt");
const creds = readFileSync(credsPath, "utf8");
const cfLogin = creds.match(/Cloudflare[\s\S]*?Login: (\S+) \/ (\S+)/)?.[1];
const cfPass = creds.match(/Cloudflare[\s\S]*?Login: (\S+) \/ (\S+)/)?.[2];
const resendKey = creds.match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
const domain = "recruitmentsite.co.uk";

const RECORDS = [
  {
    type: "TXT",
    name: "resend._domainkey",
    content:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmiG8KCQpg7dqtSwirqfarkxkuAFM0Js1ISlczLxlL107tfu8NixPIKWohOZ9s7SDYjZAcNRaecx1F2ygz0yrliAHPZNworhxFkBIZKTMYsyNw2mDK6CcSrmQCVgLBRuouR1GMi9fZ+3KC/a82DNjCAwZLWQj4xUrbIj1m+aZEHwIDAQAB",
  },
  {
    type: "MX",
    name: "send",
    content: "feedback-smtp.eu-west-1.amazonses.com",
    priority: 10,
  },
  {
    type: "TXT",
    name: "send",
    content: "v=spf1 include:amazonses.com ~all",
  },
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
  const fqdn = record.name === "@" ? domain : `${record.name}.${domain}`;
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

async function login(page) {
  await page.goto("https://dash.cloudflare.com/login", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2000);
  if (page.url().includes("/login")) {
    await page.locator('input[type="email"], input[name="email"]').first().fill(cfLogin, { timeout: 60000 });
    await page.locator('input[type="password"]').first().fill(cfPass);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/dash\.cloudflare\.com(?!\/login)/, { timeout: 180000 });
    await page.waitForTimeout(3000);
  }
}

async function verifyResend() {
  if (!resendKey) return;
  let listed;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      listed = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${resendKey}` },
      }).then((r) => r.json());
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  const found = listed?.data?.find((d) => d.name === domain);
  if (!found) return;

  await fetch(`https://api.resend.com/domains/${found.id}/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => {});

  for (let i = 0; i < 18; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    try {
      const check = await fetch(`https://api.resend.com/domains/${found.id}`, {
        headers: { Authorization: `Bearer ${resendKey}` },
      }).then((r) => r.json());
      console.log(`  Resend status: ${check.status}`);
      if (check.status === "verified") {
        console.log("\n✓ Resend domain verified");
        return true;
      }
    } catch {
      console.log("  Resend status: (API timeout, retrying...)");
    }
  }
  console.log("\nResend verification still pending — DNS may need more propagation time.");
  return false;
}

async function main() {
  if (!cfLogin || !cfPass) {
    console.error("Cloudflare login not found in go-live-credentials.local.txt");
    process.exit(1);
  }

  console.log("Cloudflare → add Resend DNS (Playwright session API)\n");

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PW_CHANNEL ?? "chrome",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const request = context.request;

  try {
    await login(page);
    console.log("✓ Logged into Cloudflare");

    await page.goto(`https://dash.cloudflare.com/`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(2000);

    const zones = await cfApi(request, `/zones?name=${domain}`);
    const zoneId = zones?.[0]?.id;
    if (!zoneId) throw new Error(`Zone not found for ${domain}`);
    console.log(`✓ Zone: ${zoneId}\nAdding records:`);

    for (const record of RECORDS) {
      await upsertRecord(request, zoneId, record);
    }

    console.log("\n✓ DNS records saved in Cloudflare");
  } finally {
    await browser.close();
  }

  console.log("\nTriggering Resend verification...");
  const verified = await verifyResend();
  process.exit(verified ? 0 : 2);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
