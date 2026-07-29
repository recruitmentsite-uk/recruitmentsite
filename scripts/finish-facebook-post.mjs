#!/usr/bin/env node
/** Finish Facebook Page launch post (Post settings modal → Post). */
import { chromium } from "playwright";
import { readdirSync, statSync, existsSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE_URL = "https://www.facebook.com/profile.php?id=61592529213211";
const MEDIA = join(root, "apps/web/public/brand/social/instagram-post-1080.png");

function loadFacebookText() {
  const packArg = process.argv.find((x) => x.startsWith("--pack="));
  const pack = packArg ? packArg.slice("--pack=".length) : "employer-acquisition";
  const path = join(root, "docs/social-posts", `${pack}.md`);
  if (existsSync(path)) {
    const md = readFileSync(path, "utf8");
    const m = md.match(/## Facebook\s*\n([\s\S]*?)(?=\n## |$)/i);
    if (m) return m[1].trim();
  }
  return `UK employers — tired of agency fees and pay-per-click guessing?

Recruitment Site is a flat-fee UK job board: unlimited posts, AI match scores on every applicant, Google Jobs syndication — no placement commission.

30 days free to try → https://recruitmentsite.co.uk/pricing`;
}

const TEXT = loadFacebookText();

function latestProfile() {
  return join(
    root,
    readdirSync(root)
      .filter((n) => n.startsWith(".social-admin-chrome-profile"))
      .map((n) => ({ n, t: statSync(join(root, n)).mtimeMs }))
      .sort((a, b) => b.t - a.t)[0].n
  );
}

async function snap(page, label) {
  await page.screenshot({ path: join(root, `.fbpost-${label}.png`), fullPage: false }).catch(() => {});
  console.log("SNAP", label);
}

async function clickText(page, re, timeout = 2500) {
  for (const g of [
    () => page.getByRole("button", { name: re }).first(),
    () => page.getByRole("link", { name: re }).first(),
    () => page.getByText(re).first(),
  ]) {
    const el = g();
    if (await el.isVisible({ timeout }).catch(() => false)) {
      await el.click({ force: true });
      await page.waitForTimeout(1000);
      return true;
    }
  }
  return false;
}

async function main() {
  const ctx = await chromium.launchPersistentContext(latestProfile(), {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 950 },
    locale: "en-GB",
    slowMo: 50,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  let ok = false;

  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await clickText(page, /Use Page|Switch Now|Not now/i, 1500);
  await snap(page, "01");

  // If Post settings still open
  if (await page.getByRole("button", { name: /^Post$/i }).first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await page.getByRole("button", { name: /^Post$/i }).first().click({ force: true });
    ok = true;
    console.log("Clicked Post on existing dialog");
  } else {
    // Fresh composer
    await clickText(page, /what's on your mind|Photo\/video/i, 4000);
    await page.waitForTimeout(1500);
    const box = page.locator('div[role="textbox"][contenteditable="true"]').last();
    if (await box.isVisible({ timeout: 8000 }).catch(() => false)) {
      await box.click();
      await page.keyboard.type(TEXT, { delay: 6 });
    }
    if (existsSync(MEDIA)) {
      const [chooser] = await Promise.all([
        page.waitForEvent("filechooser", { timeout: 8000 }).catch(() => null),
        clickText(page, /photo|video|add photo/i, 3000),
      ]);
      if (chooser) await chooser.setFiles(MEDIA);
      else {
        const file = page.locator('input[type="file"]').last();
        if (await file.count()) await file.setInputFiles(MEDIA);
      }
      await page.waitForTimeout(3000);
    }
    await snap(page, "02");
    // Next → Post settings → Post
    for (let i = 0; i < 4; i++) {
      const postBtn = page.getByRole("button", { name: /^Post$/i }).first();
      if (await postBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (!(await postBtn.isDisabled().catch(() => false))) {
          await postBtn.click({ force: true });
          ok = true;
          console.log("Posted");
          break;
        }
      }
      await clickText(page, /^Next$/i, 2000);
      await page.waitForTimeout(1200);
    }
  }

  await page.waitForTimeout(5000);
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await snap(page, "03");
  writeFileSync(join(root, ".fb-post-status.json"), JSON.stringify({ ok, at: new Date().toISOString() }, null, 2));
  console.log("ok=", ok);
  await page.waitForTimeout(10000);
  await ctx.close().catch(() => {});
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
