#!/usr/bin/env node
/**
 * Log into Supabase dashboard and report auth URL + SMTP settings.
 * Reads credentials from go-live-credentials.local.txt.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = readFileSync(credsPath, "utf8");
const password = creds.match(/Supabase login password: (\S+)/)?.[1];
const projectRef = creds.match(/Project ref: (\S+)/)?.[1] ?? "wvwhxnokuisxcgwbwqlo";
const email =
  creds.match(/Supabase login email: (\S+)/)?.[1] ??
  creds.match(/Primary signup email \(use for all service registrations\)\n(\S+)/)?.[1] ??
  "hello@recruitmentsite.co.uk";

const urlConfigPage = `https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`;
const smtpPage = `https://supabase.com/dashboard/project/${projectRef}/auth/smtp`;

async function login(page) {
  await page.goto("https://supabase.com/dashboard/sign-in", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.waitForTimeout(2000);
  if (!page.url().includes("/sign-in")) return;

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  if (await emailInput.isVisible({ timeout: 10000 }).catch(() => false)) {
    await emailInput.fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/dashboard/, { timeout: 120000 });
    await page.waitForTimeout(3000);
  }
}

async function readUrlConfig(page) {
  await page.goto(urlConfigPage, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(4000);
  const text = await page.locator("main, [role='main'], body").first().innerText().catch(() => "");
  const siteUrl =
    (await page.locator('input[name="site_url"], input[placeholder*="Site URL"]').inputValue().catch(() => "")) ||
    text.match(/Site URL[^\n]*\n([^\n]+)/)?.[1]?.trim();
  const redirects = await page
    .locator('textarea, input[placeholder*="Redirect"]')
    .allInnerTexts()
    .catch(() => []);
  return { siteUrl, redirects: redirects.join("\n"), pageText: text.slice(0, 2000) };
}

async function readSmtp(page) {
  await page.goto(smtpPage, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(4000);
  const text = await page.locator("main, [role='main'], body").first().innerText().catch(() => "");
  const enabled = /custom smtp|enable custom smtp/i.test(text) && /enabled|on/i.test(text);
  return {
    smtpEnabled: enabled,
    hasResendHost: text.includes("smtp.resend.com"),
    sender: text.match(/notifications@recruitmentsite\.co\.uk/)?.[0],
    pageText: text.slice(0, 2000),
  };
}

console.log("Supabase dashboard check\n");
console.log(`Login: ${email}\n`);

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage();

try {
  await login(page);
  console.log(page.url().includes("/sign-in") ? "✗ Login failed\n" : "✓ Logged in\n");

  console.log("── URL Configuration ──");
  const urls = await readUrlConfig(page);
  console.log("Site URL:", urls.siteUrl || "(not found — see dashboard)");
  console.log("Redirects:", urls.redirects || "(check dashboard manually)");
  const siteOk = urls.siteUrl?.includes("recruitmentsite.co.uk");
  const callbackOk = urls.pageText.includes("/auth/callback");
  console.log(siteOk ? "✓ Site URL looks correct" : "✗ Site URL may need update");
  console.log(callbackOk ? "✓ Callback URL present" : "✗ Callback URL may be missing");

  console.log("\n── SMTP Settings ──");
  const smtp = await readSmtp(page);
  console.log("Resend host:", smtp.hasResendHost ? "✓ smtp.resend.com" : "✗ not configured");
  console.log("Sender:", smtp.sender ?? "not found");
  console.log(smtp.smtpEnabled ? "✓ Custom SMTP appears enabled" : "? Enable custom SMTP if not already");

  await page.screenshot({ path: "supabase-auth-check.png", fullPage: true });
  console.log("\nScreenshot: supabase-auth-check.png");
} finally {
  await browser.close();
}
