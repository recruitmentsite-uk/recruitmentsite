#!/usr/bin/env node
/**
 * Publish Recruitment Site launch posts to Facebook Page + Instagram (+ optional LinkedIn).
 *
 *   node scripts/publish-launch-social-posts.mjs
 *   node scripts/publish-launch-social-posts.mjs --only=facebook,instagram
 */
import { chromium } from "playwright";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, ".social-publish-status.json");
const SNAP = (label) => join(root, `.social-publish-${label}.png`);

const LINKEDIN_COMPANY = "https://www.linkedin.com/company/recruitmentsite-uk";
const FACEBOOK_PAGE = "https://www.facebook.com/profile.php?id=61592529213211";
const INSTAGRAM = "https://www.instagram.com/recruitmentsite.uk/";

const MEDIA = {
  linkedin: join(root, "apps/web/public/brand/social/instagram-post-1080.png"),
  facebook: join(root, "apps/web/public/brand/social/instagram-post-1080.png"),
  instagram: join(root, "apps/web/public/brand/social/instagram-post-1080.png"),
};

const DEFAULT_POSTS = {
  linkedin: `Recruitment Site is live — a UK job board built around salary transparency.

Every listing shows pay upfront. Candidates apply free. Employers get unlimited posts on a flat monthly fee, with AI match scores and Google Jobs syndication — no agency commission.

Explore roles → https://recruitmentsite.co.uk
For employers → https://recruitmentsite.co.uk/pricing

#UKJobs #Recruitment #Hiring #SalaryTransparency #HRTech`,
  facebook: `Recruitment Site is live.

UK jobs with salary shown upfront. Free to apply. Flat-fee hiring for employers — no agency commission.

Browse roles → https://recruitmentsite.co.uk
Post a job → https://recruitmentsite.co.uk/pricing`,
  instagram: `Recruitment Site is live.

UK jobs with salary shown upfront · Free to apply · Flat-fee hiring for employers.

Link in bio → recruitmentsite.co.uk

#UKJobs #Recruitment #SalaryTransparency #HiringUK #JobBoard`,
};

function loadPostPack() {
  const a = process.argv.find((x) => x.startsWith("--pack="));
  const pack = a ? a.slice("--pack=".length).trim() : "launch";
  if (pack === "launch") return { name: pack, posts: DEFAULT_POSTS };
  const path = join(root, "docs/social-posts", `${pack}.md`);
  if (!existsSync(path)) throw new Error(`Missing post pack ${path}`);
  const md = readFileSync(path, "utf8");
  const posts = { ...DEFAULT_POSTS };
  for (const platform of ["facebook", "instagram", "linkedin"]) {
    const re = new RegExp(`## ${platform}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
    const m = md.match(re);
    if (m) posts[platform] = m[1].trim();
  }
  return { name: pack, posts };
}

const { name: PACK_NAME, posts: POSTS } = loadPostPack();
console.log("Post pack:", PACK_NAME);

function argOnly() {
  const a = process.argv.find((x) => x.startsWith("--only="));
  if (!a) return ["facebook", "instagram"];
  return a
    .slice("--only=".length)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function latestMetaProfile() {
  const dirs = readdirSync(root)
    .filter((n) => n.startsWith(".social-admin-chrome-profile"))
    .map((n) => ({ n, t: statSync(join(root, n)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (!dirs.length) throw new Error("No .social-admin-chrome-profile* found");
  return join(root, dirs[0].n);
}

async function snap(page, label) {
  await page.screenshot({ path: SNAP(label), fullPage: false }).catch(() => {});
  console.log("SNAP", label);
}

async function launch(profileDir) {
  return chromium.launchPersistentContext(profileDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 950 },
    locale: "en-GB",
    slowMo: 55,
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

async function publishFacebook(result) {
  const profile = latestMetaProfile();
  console.log("\n=== Facebook ===", profile);
  const ctx = await launch(profile);
  const page = ctx.pages()[0] || (await ctx.newPage());
  try {
    await page.goto(FACEBOOK_PAGE, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    await snap(page, "fb-01");

    for (const re of [/Use Page/i, /Switch Now/i, /Allow all cookies/i, /Not now/i]) {
      const el = page.getByRole("button", { name: re }).first();
      if (await el.isVisible({ timeout: 1200 }).catch(() => false)) {
        await el.click({ force: true });
        await page.waitForTimeout(1000);
      }
    }

    const create = page
      .getByRole("button", { name: /what's on your mind|create post|write something|photo\/video/i })
      .or(page.getByText(/what's on your mind/i))
      .first();
    if (await create.isVisible({ timeout: 10000 }).catch(() => false)) {
      await create.click({ force: true });
    } else {
      await page
        .locator('[aria-label*="What\'s on your mind"], [role="button"]:has-text("Photo/video")')
        .first()
        .click({ force: true })
        .catch(() => {});
    }
    await page.waitForTimeout(2000);
    await snap(page, "fb-02-composer");

    const box = page.locator('div[role="textbox"][contenteditable="true"]').last();
    await box.waitFor({ state: "visible", timeout: 15000 });
    await box.click();
    await page.keyboard.type(POSTS.facebook, { delay: 8 });
    await page.waitForTimeout(800);

    if (existsSync(MEDIA.facebook)) {
      const [chooser] = await Promise.all([
        page.waitForEvent("filechooser", { timeout: 8000 }).catch(() => null),
        page
          .getByRole("button", { name: /photo|video|add photo/i })
          .first()
          .click({ force: true })
          .catch(() => {}),
      ]);
      if (chooser) await chooser.setFiles(MEDIA.facebook);
      else {
        const file = page.locator('input[type="file"][accept*="image"]').last();
        if (await file.count()) await file.setInputFiles(MEDIA.facebook);
      }
      await page.waitForTimeout(3000);
    }

    for (let step = 0; step < 3; step++) {
      const next = page.getByRole("button", { name: /^(next)$/i }).first();
      const postBtn = page.getByRole("button", { name: /^(post|posts? now|publish)$/i }).first();
      if (await postBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        for (let i = 0; i < 12; i++) {
          if (!(await postBtn.isDisabled().catch(() => false))) break;
          await page.waitForTimeout(400);
        }
        await postBtn.click({ force: true });
        break;
      }
      if (await next.isVisible({ timeout: 2000 }).catch(() => false)) {
        await next.click({ force: true });
        await page.waitForTimeout(1500);
        continue;
      }
      throw new Error("Neither Next nor Post visible in Facebook composer");
    }
    await page.waitForTimeout(6000);
    await snap(page, "fb-03-done");
    result.facebook = { ok: true, url: FACEBOOK_PAGE };
    console.log("Facebook: posted");
  } catch (e) {
    result.facebook = { ok: false, error: String(e?.message || e) };
    console.error("Facebook failed:", e?.message || e);
    await snap(page, "fb-err");
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function publishInstagram(result) {
  const profile = latestMetaProfile();
  console.log("\n=== Instagram ===", profile);
  const ctx = await launch(profile);
  const page = ctx.pages()[0] || (await ctx.newPage());
  try {
    await page.goto("https://www.instagram.com/?hl=en", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    await snap(page, "ig-01");

    for (const name of [/not now/i, /decline/i]) {
      const dismiss = page.getByRole("button", { name }).first();
      if (await dismiss.isVisible({ timeout: 1500 }).catch(() => false)) {
        await dismiss.click({ force: true });
        await page.waitForTimeout(800);
      }
    }

    const newPost = page
      .getByRole("link", { name: /new post|create/i })
      .or(page.getByRole("button", { name: /new post|create/i }))
      .or(page.locator('svg[aria-label="New post"], svg[aria-label="Create"]').first())
      .first();
    if (await newPost.isVisible({ timeout: 10000 }).catch(() => false)) {
      await newPost.click({ force: true });
    } else {
      await page.locator('[aria-label="New post"], [aria-label="Create"]').first().click({ force: true });
    }
    await page.waitForTimeout(2000);
    await snap(page, "ig-02-create");

    const [chooser] = await Promise.all([
      page.waitForEvent("filechooser", { timeout: 15000 }).catch(() => null),
      page
        .getByRole("button", { name: /select from computer|select files/i })
        .first()
        .click({ force: true })
        .catch(() => {}),
    ]);
    if (chooser) await chooser.setFiles(MEDIA.instagram);
    else {
      const file = page.locator('input[type="file"]').first();
      await file.waitFor({ state: "attached", timeout: 15000 });
      await file.setInputFiles(MEDIA.instagram);
    }
    console.log("IG media selected");
    await page.waitForTimeout(3000);
    await snap(page, "ig-03-media");

    for (let i = 0; i < 2; i++) {
      const next = page.getByRole("button", { name: /^next$/i }).first();
      if (await next.isVisible({ timeout: 8000 }).catch(() => false)) {
        await next.click({ force: true });
        await page.waitForTimeout(1500);
      }
    }
    await snap(page, "ig-04-caption");

    const caption = page
      .locator('div[role="textbox"][contenteditable="true"], textarea[aria-label*="caption" i]')
      .first();
    await caption.waitFor({ state: "visible", timeout: 15000 });
    await caption.click();
    await page.keyboard.type(POSTS.instagram, { delay: 8 });
    await page.waitForTimeout(1000);

    const share = page.getByRole("button", { name: /^share$/i }).first();
    await share.waitFor({ state: "visible", timeout: 15000 });
    await share.click({ force: true });
    await page.waitForTimeout(8000);
    await snap(page, "ig-05-done");

    await page.goto(INSTAGRAM, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    await snap(page, "ig-06-profile");

    result.instagram = { ok: true, url: INSTAGRAM };
    console.log("Instagram: posted");
  } catch (e) {
    result.instagram = { ok: false, error: String(e?.message || e) };
    console.error("Instagram failed:", e?.message || e);
    await snap(page, "ig-err");
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function publishLinkedIn(result) {
  const profile = latestMetaProfile();
  console.log("\n=== LinkedIn ===", profile);
  const ctx = await launch(profile);
  const page = ctx.pages()[0] || (await ctx.newPage());
  try {
    await page.goto(`${LINKEDIN_COMPANY}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    await snap(page, "li-01");

    const start = page.getByRole("button", { name: /start a post|create a post|write a post/i }).first();
    if (await start.isVisible({ timeout: 8000 }).catch(() => false)) {
      await start.click({ force: true });
    } else {
      throw new Error("LinkedIn composer not available in this profile (may need LinkedIn login)");
    }
    await page.waitForTimeout(2000);
    const editor = page.locator('.ql-editor, div[role="textbox"][contenteditable="true"]').first();
    await editor.waitFor({ state: "visible", timeout: 15000 });
    await editor.click();
    await page.keyboard.type(POSTS.linkedin, { delay: 8 });
    if (existsSync(MEDIA.linkedin)) {
      const [chooser] = await Promise.all([
        page.waitForEvent("filechooser", { timeout: 8000 }).catch(() => null),
        page
          .getByRole("button", { name: /add a photo|photo|media|image/i })
          .first()
          .click({ force: true })
          .catch(() => {}),
      ]);
      if (chooser) await chooser.setFiles(MEDIA.linkedin);
    }
    await page.waitForTimeout(2000);
    const postBtn = page.getByRole("button", { name: /^post$/i }).first();
    await postBtn.click({ force: true });
    await page.waitForTimeout(5000);
    await snap(page, "li-03-done");
    result.linkedin = { ok: true, url: LINKEDIN_COMPANY };
    console.log("LinkedIn: posted");
  } catch (e) {
    result.linkedin = { ok: false, error: String(e?.message || e) };
    console.error("LinkedIn failed:", e?.message || e);
    await snap(page, "li-err");
  } finally {
    await ctx.close().catch(() => {});
  }
}

async function main() {
  const only = argOnly();
  for (const k of Object.values(MEDIA)) {
    if (!existsSync(k)) throw new Error(`Missing media ${k} — run render-social-brand-assets.mjs`);
  }
  const result = { at: new Date().toISOString(), platforms: {} };
  if (only.includes("facebook")) await publishFacebook(result.platforms);
  if (only.includes("instagram")) await publishInstagram(result.platforms);
  if (only.includes("linkedin")) await publishLinkedIn(result.platforms);
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log("\nWrote", OUT);
  console.log(JSON.stringify(result, null, 2));
  const failed = Object.values(result.platforms).some((p) => !p?.ok);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
