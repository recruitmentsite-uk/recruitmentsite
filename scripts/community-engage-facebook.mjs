#!/usr/bin/env node
/**
 * Recruitment Site Community — join UK Facebook groups, engage threads, handle Messenger.
 *
 *   node scripts/community-engage-facebook.mjs
 *   node scripts/community-engage-facebook.mjs --max-joins=12 --max-replies=6 --max-posts=5 --chats=8
 *   node scripts/community-engage-facebook.mjs --light   # fewer joins/replies (4h cadence)
 *   node scripts/community-engage-facebook.mjs --skip-chats --skip-posts
 *
 * UK-only: employers · employees/jobseekers · students/grads · careers.
 * Messages classified by group name so copy matches the room.
 */
import { chromium } from "playwright";
import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG = join(root, "docs/community/activity-log.md");
const TARGETS = join(root, "docs/community/targets.md");
const STATUS = join(root, ".community-engage-status.json");
const SEEN = join(root, ".community-seen-groups.json");
const PAGE_ASSET = "61592529213211";

function argNum(name, fallback) {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  if (!a) return fallback;
  const n = Number(a.split("=")[1]);
  return Number.isFinite(n) ? n : fallback;
}

const LIGHT = process.argv.includes("--light");
const SKIP_CHATS = process.argv.includes("--skip-chats");
const SKIP_POSTS = process.argv.includes("--skip-posts");
// PropOS defaults: 12 joins / 6 replies / 8 chats (light: 4 / 2 / 4)
const MAX_JOINS = argNum("max-joins", LIGHT ? 4 : 12);
const MAX_REPLIES = argNum("max-replies", LIGHT ? 2 : 6);
const MAX_POSTS = argNum("max-posts", LIGHT ? 1 : 5);
const MAX_CHATS = argNum("chats", LIGHT ? 4 : 8);

/** UK-only research bank — interleaved so each run hits all audiences */
const SEARCHES = [
  "UK Employers Hiring",
  "UK Jobs",
  "UK Graduate Jobs",
  "UK Careers Advice",
  "Hiring Managers UK",
  "Jobs in London UK",
  "UK Apprenticeships",
  "Career Change UK",
  "HR UK Networking",
  "NHS Jobs UK",
  "UK University Students Jobs",
  "UK Career Networking",
  "UK SME Business Owners",
  "Care Jobs UK",
  "UK Student Jobs Part Time",
  "Return to Work UK",
  "Care Home Managers UK",
  "Hospitality Jobs UK",
  "UK Freshers Jobs",
  "University Careers UK",
  "Hospitality Managers UK",
  "Warehouse Jobs UK",
  "Construction Employers UK",
  "Remote Jobs UK",
  "Retail Managers UK",
  "Teaching Jobs UK",
  "UK Recruitment Managers",
  "Construction Jobs UK",
];

/** Classify group by name so messages match the room */
function classifyAudience(name) {
  const n = String(name || "");
  if (
    /employer|hiring manager|hr |human resources|business owner|sme|recruit(ment|er)|manager|agency|direct hire|promote your business|business network|advertis/i.test(
      n,
    )
  ) {
    return "employer";
  }
  if (
    /student|fresher|graduate|uni(versity)?|apprentice|school leaver|internship|campus/i.test(n)
  ) {
    return "student";
  }
  if (/career|cv tip|interview tip|return to work|career change|networking circle/i.test(n)) {
    return "career";
  }
  if (/job|jobs|vacanc|work in|looking for work|nhs|care |hospitality|warehouse|teaching|construction/i.test(n)) {
    return "employee";
  }
  return "employee";
}

const POST_BY_AUDIENCE = {
  employer: [
    "Quick one for UK hirers — if agency fees are chewing the budget, flat-fee unlimited posts + AI match scores (and Google Jobs syndication) is what we've been building at recruitmentsite.co.uk/pricing. Happy to compare notes on what you're hiring for.",
    "For SME owners hiring in the UK: candidates apply free on our side, you get unlimited listings without commission. recruitmentsite.co.uk/pricing — what's the hardest role to fill right now?",
  ],
  employee: [
    "If you're job hunting in the UK — applications are free on Recruitment Site and roles get matched with AI + pushed via Google Jobs. recruitmentsite.co.uk — what kind of role are you after?",
    "Sharing for jobseekers here: free to apply, UK roles with match scores so you're not drowning in junk listings. recruitmentsite.co.uk — good luck with the search.",
  ],
  student: [
    "For students / grads in the UK looking for first roles or part-time work — apply free on Recruitment Site; listings are matched and syndicated more widely. recruitmentsite.co.uk — what are you studying / aiming for?",
    "Uni / apprenticeship hunters: free applications + AI match scoring on UK roles at recruitmentsite.co.uk. Drop what city/sector you're targeting if helpful.",
  ],
  career: [
    "Career change tip from our board: free apply + AI match scores helps filter noise when you're pivoting. UK roles at recruitmentsite.co.uk — what field are you moving into?",
    "If you're rebuilding a CV or returning to work in the UK, happy to point you at free applications and clearer role matching: recruitmentsite.co.uk",
  ],
};

const REPLY_BY_AUDIENCE = {
  employer: [
    {
      match: /agency|commission|expensive|cost of hir|recruiter fee/i,
      text: "Agency fees add up fast. Flat-fee unlimited posting + Google Jobs syndication keeps spend predictable for a lot of UK SMEs — recruitmentsite.co.uk/pricing if useful.",
    },
    {
      match: /hiring|staff|vacancy|need (nurses|chefs|drivers|carers)|looking for (staff|people)/i,
      text: "If you're hiring in the UK, flat monthly fee + unlimited posts + AI match scores (no agency commission) is what we offer. Happy to compare notes: recruitmentsite.co.uk/pricing",
    },
    {
      match: /./,
      text: "Useful for hirers here — free candidate apply, unlimited employer posts on a flat fee, AI match scores. recruitmentsite.co.uk/pricing",
    },
  ],
  employee: [
    {
      match: /cv|apply|interview|job hunt|looking for (a )?job|vacancy/i,
      text: "Good luck with the search. Applications are free on our UK board and roles get pushed via Google Jobs too: recruitmentsite.co.uk",
    },
    {
      match: /remote|hybrid|wfh/i,
      text: "Remote UK search is noisy — free apply + AI match scoring helps cut the junk: recruitmentsite.co.uk",
    },
    {
      match: /nhs|nurse|hca|care home|healthcare/i,
      text: "Healthcare roles are competitive. Candidates apply free on our side; employers get match scores without agency mark-up. recruitmentsite.co.uk",
    },
    {
      match: /./,
      text: "Thanks for sharing — if anyone here is job hunting in the UK, applications are free at recruitmentsite.co.uk (AI match + Google Jobs syndication).",
    },
  ],
  student: [
    {
      match: /graduate|internship|placement|part.?time|fresher|student/i,
      text: "For students/grads: free to apply on Recruitment Site — UK roles with AI matching. recruitmentsite.co.uk — what year / subject are you?",
    },
    {
      match: /apprentice/i,
      text: "Apprenticeship hunting is tough — free applications + wider syndication on our UK board if useful: recruitmentsite.co.uk",
    },
    {
      match: /./,
      text: "Sharing for students here — free UK applications and match scoring at recruitmentsite.co.uk. Good luck with the search.",
    },
  ],
  career: [
    {
      match: /career change|redundant|return to work|pivot/i,
      text: "Career pivots are hard. Free apply + AI match scores can cut noise when you're changing lane — recruitmentsite.co.uk",
    },
    {
      match: /./,
      text: "Useful thread. If you're exploring UK roles while changing direction, free applications here: recruitmentsite.co.uk",
    },
  ],
};

const CHAT_REPLIES = [
  {
    match: /pricing|price|cost|how much|employer|post a job|hire|staff/i,
    text: "Hey — thanks for the message. For employers: unlimited job posts on a flat monthly fee, AI match scores, Google Jobs syndication, no agency commission. https://recruitmentsite.co.uk/pricing — what are you hiring for?",
  },
  {
    match: /job|looking|vacancy|apply|cv|nhs/i,
    text: "Hi — thanks for getting in touch. Candidates apply free; roles are matched with AI and listed more widely via Google Jobs. https://recruitmentsite.co.uk — what kind of role are you after?",
  },
  {
    match: /hello|hi |hey|interested|info/i,
    text: "Hi — thanks for the message. We're Recruitment Site: free apply for candidates; flat-fee unlimited posts + AI matching for employers. How can I help?",
  },
  {
    match: /./,
    text: "Thanks for the message — I'll pick this up. Jobs: https://recruitmentsite.co.uk · Employers: https://recruitmentsite.co.uk/pricing. What's the best thing to help with first?",
  },
];

function latestMetaProfile() {
  return join(
    root,
    readdirSync(root)
      .filter((n) => n.startsWith(".social-admin-chrome-profile"))
      .map((n) => ({ n, t: statSync(join(root, n)).mtimeMs }))
      .sort((a, b) => b.t - a.t)[0].n
  );
}

function loadSeen() {
  if (!existsSync(SEEN)) return { hrefs: [] };
  try {
    return JSON.parse(readFileSync(SEEN, "utf8"));
  } catch {
    return { hrefs: [] };
  }
}

function saveSeen(seen) {
  writeFileSync(SEEN, JSON.stringify(seen, null, 2));
}

async function snap(page, label) {
  await page.screenshot({ path: join(root, `.community-${label}.png`), fullPage: false }).catch(() => {});
  console.log("SNAP", label);
}

function pickFrom(bank, text) {
  for (const r of bank) {
    if (r.match.test(text || "")) return r.text;
  }
  return bank[bank.length - 1].text;
}

function pickAudienceReply(groupName, snippet) {
  const audience = classifyAudience(groupName);
  const bank = REPLY_BY_AUDIENCE[audience] || REPLY_BY_AUDIENCE.employee;
  // Prefer post snippet when it matches; else fall through audience defaults
  return { audience, text: pickFrom(bank, `${groupName}\n${snippet || ""}`) };
}

function pickAudiencePost(groupName) {
  const audience = classifyAudience(groupName);
  const bank = POST_BY_AUDIENCE[audience] || POST_BY_AUDIENCE.employee;
  const text = bank[Math.floor(Math.random() * bank.length)];
  return { audience, text };
}

function logRow({ action, target, notes }) {
  const when = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const row = `| ${when} | Facebook | ${action} | ${target} | ${(notes || "").replace(/\|/g, "/").slice(0, 200)} |`;
  let md = existsSync(LOG)
    ? readFileSync(LOG, "utf8")
    : "# Activity\n\n| When (UTC) | Platform | Action | Target / URL | Notes |\n|---|---|---|---|---|\n";
  const lines = md.split("\n");
  const headerIdx = lines.findIndex((l) => l.startsWith("| When"));
  let at = headerIdx >= 0 ? headerIdx + 2 : lines.length;
  if (lines[at]?.startsWith("|---") || lines[at]?.startsWith("| ---")) at += 1;
  lines.splice(at, 0, row);
  writeFileSync(LOG, lines.join("\n"));
}

function appendTarget(name, href, status) {
  if (!existsSync(TARGETS)) return;
  let t = readFileSync(TARGETS, "utf8");
  if (t.includes(href)) {
    t = t.replace(
      new RegExp(`(\\|[^\\n]*${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]*\\| )[^|]+`),
      `$1${status}`
    );
    writeFileSync(TARGETS, t);
    return;
  }
  const row = `| Facebook | [${name}](${href}) | Community | ${status} |\n`;
  writeFileSync(TARGETS, t.trimEnd() + "\n" + row);
}

async function dismiss(page) {
  for (const name of [/not now/i, /maybe later/i, /allow all cookies/i, /^close$/i, /decline optional/i]) {
    const b = page.getByRole("button", { name }).first();
    if (await b.isVisible({ timeout: 500 }).catch(() => false)) {
      await b.click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

async function launch() {
  return chromium.launchPersistentContext(latestMetaProfile(), {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 950 },
    locale: "en-GB",
    slowMo: 45,
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

function isUkRelevantGroup(name) {
  const n = String(name || "");
  // Skip obvious non-UK / US local groups
  if (/\b(USA|U\.S\.A|United States|Florida|Texas|California|New York|Osceola|Canada|Australia|India|Nigeria|Pakistan)\b/i.test(n)) {
    return false;
  }
  // Prefer UK signals; allow neutral names from UK-targeted searches
  if (/\b(UK|U\.K\.|United Kingdom|Britain|British|England|Scotland|Wales|London|Manchester|Birmingham|NHS|Leeds|Glasgow|Edinburgh|Bristol|Liverpool)\b/i.test(n)) {
    return true;
  }
  // Soft allow: no foreign geo markers (search query already UK-scoped)
  return !/\b(county|state of)\b/i.test(n);
}

async function collectGroupLinks(page) {
  return page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/groups/"]')) {
      const href = a.href.split("?")[0].replace(/\/$/, "") + "/";
      if (!/\/groups\/(\d+|[\w.-]+)\/?$/i.test(href)) continue;
      if (/search|create|discover|joins/i.test(href)) continue;
      const lines = (a.innerText || "")
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 2 && !/^\d[\d,.]*\s*(members?|posts?)/i.test(x));
      const name = lines[0] || a.getAttribute("aria-label") || "Group";
      out.push({ href, name: name.slice(0, 80) });
    }
    const seen = new Set();
    return out.filter((g) => {
      if (seen.has(g.href)) return false;
      seen.add(g.href);
      return true;
    });
  });
}

async function tryJoin(page, g, result, seen) {
  await page.goto(g.href, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);
  await dismiss(page);
  const title = (await page.title()).replace(/\s*\|\s*Facebook.*$/i, "").trim();
  if (title && !/^facebook$/i.test(title)) g.name = title.slice(0, 100);

  const joinBtn = page.getByRole("button", { name: /^(join group|join|request to join)$/i }).first();
  if (await joinBtn.isVisible({ timeout: 3500 }).catch(() => false)) {
    const label = (await joinBtn.innerText().catch(() => "Join")) || "Join";
    await joinBtn.click({ force: true });
    await page.waitForTimeout(2200);
    await dismiss(page);
    const status = /request/i.test(label) ? "requested" : "joined";
    result[status === "joined" ? "joined" : "requested"].push(g);
    logRow({ action: status, target: `[${g.name}](${g.href})`, notes: "daily community pass" });
    appendTarget(g.name, g.href, status);
    seen.hrefs.push(g.href);
    console.log(status, g.name);
    return status;
  }

  const body = await page.locator("body").innerText();
  if (/joined|you're in|you are a member|write something/i.test(body)) {
    if (!seen.hrefs.includes(g.href)) seen.hrefs.push(g.href);
    result.already.push(g);
    console.log("already member", g.name);
    return "already";
  }
  console.log("skip (no join)", g.name);
  return "skip";
}

async function tryReply(page, g, result) {
  try {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(800);
    const commentBtn = page.getByRole("button", { name: /^comment$/i }).first();
    if (await commentBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await commentBtn.scrollIntoViewIfNeeded().catch(() => {});
      await commentBtn.click({ force: true });
    } else {
      const write = page.getByText(/write a comment|comment as/i).first();
      if (!(await write.isVisible({ timeout: 2500 }).catch(() => false))) return false;
      await write.click({ force: true });
    }
    await page.waitForTimeout(1000);

    const snippet = (await page.locator('div[dir="auto"]').nth(2).innerText().catch(() => "")) || "";
    const { audience, text: reply } = pickAudienceReply(g.name, snippet);
    const box = page.locator('div[role="textbox"][contenteditable="true"][aria-label*="Comment" i]').last();
    if (!(await box.count())) return false;
    await box.scrollIntoViewIfNeeded().catch(() => {});
    await box.click({ force: true }).catch(async () => {
      await box.evaluate((el) => {
        el.focus();
        el.scrollIntoView({ block: "center" });
      });
    });
    await page.keyboard.type(reply, { delay: 10 });
    await page.waitForTimeout(500);
    const send = page.getByRole("button", { name: /^(comment|post|reply)$/i }).last();
    if (await send.isVisible({ timeout: 1500 }).catch(() => false)) await send.click({ force: true });
    else await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    result.replied.push({ group: g.name, href: g.href, audience, reply: reply.slice(0, 100) });
    logRow({
      action: "reply",
      target: `[${g.name}](${g.href})`,
      notes: `[${audience}] ${reply}`,
    });
    console.log("replied", audience, g.name);
    return true;
  } catch (e) {
    console.warn("reply skip", e?.message || e);
    return false;
  }
}

/** Original wall post tailored to group audience (not a comment) */
async function tryPost(page, g, result) {
  try {
    const { audience, text } = pickAudiencePost(g.name);
    // Open composer
    const starters = [
      page.getByRole("button", { name: /write something|create (a )?public post|share your thoughts/i }).first(),
      page.getByText(/write something|share your thoughts|create a public post/i).first(),
    ];
    let opened = false;
    for (const el of starters) {
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        await el.click({ force: true });
        opened = true;
        break;
      }
    }
    if (!opened) {
      console.log("post skip (no composer)", g.name);
      return false;
    }
    await page.waitForTimeout(1200);

    const box = page
      .locator('div[role="textbox"][contenteditable="true"]')
      .filter({ hasNot: page.locator('[aria-label*="Comment" i]') })
      .last();
    const fallback = page.locator('div[role="textbox"][contenteditable="true"]').last();
    const target = (await box.count()) ? box : fallback;
    if (!(await target.count())) return false;

    await target.click({ force: true }).catch(async () => {
      await target.evaluate((el) => el.focus());
    });
    await page.keyboard.type(text, { delay: 12 });
    await page.waitForTimeout(600);

    const postBtn = page.getByRole("button", { name: /^post$/i }).last();
    if (await postBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await postBtn.click({ force: true });
    } else {
      // Post settings modal (same as Page composer)
      const next = page.getByRole("button", { name: /^next$/i }).last();
      if (await next.isVisible({ timeout: 1000 }).catch(() => false)) {
        await next.click({ force: true });
        await page.waitForTimeout(800);
      }
      const post2 = page.getByRole("button", { name: /^post$/i }).last();
      if (await post2.isVisible({ timeout: 2000 }).catch(() => false)) await post2.click({ force: true });
      else return false;
    }
    await page.waitForTimeout(2500);

    result.posted.push({ group: g.name, href: g.href, audience, text: text.slice(0, 100) });
    logRow({
      action: "post",
      target: `[${g.name}](${g.href})`,
      notes: `[${audience}] ${text}`,
    });
    console.log("posted", audience, g.name);
    return true;
  } catch (e) {
    console.warn("post skip", e?.message || e);
    return false;
  }
}

async function handleChats(page, result) {
  console.log("\n=== Messenger / Page chats ===");
  // Keep this bounded — Business Suite often hangs; Messenger.com first only
  const urls = ["https://www.facebook.com/messages/"];

  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch (e) {
      console.log("chats goto skip", e?.message || e);
      continue;
    }
    await page.waitForTimeout(2500);
    await dismiss(page);
    await snap(page, "chats-open");

    const rows = page.locator('a[href*="/messages/t/"]');
    const n = Math.min(await rows.count().catch(() => 0), MAX_CHATS);
    console.log("conversation candidates", n, "on", page.url());

    let handled = 0;
    for (let i = 0; i < n && handled < MAX_CHATS; i++) {
      try {
        const row = rows.nth(i);
        if (!(await row.isVisible({ timeout: 1000 }).catch(() => false))) continue;
        await row.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1200);
        await dismiss(page);

        const threadText =
          (await page.locator('[role="main"]').first().innerText({ timeout: 4000 }).catch(() => "")) || "";
        if (
          /recruitmentsite\.co\.uk/i.test(threadText.slice(-400)) &&
          /thanks for (the message|getting in touch)/i.test(threadText.slice(-600))
        ) {
          console.log("chat already handled");
          continue;
        }

        const box = page.locator('div[role="textbox"][contenteditable="true"]').last();
        if (!(await box.isVisible({ timeout: 2000 }).catch(() => false))) continue;

        const reply = pickFrom(CHAT_REPLIES, threadText.slice(-800));
        await box.click({ force: true });
        await page.keyboard.type(reply, { delay: 12 });
        await page.waitForTimeout(400);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1500);

        result.messaged.push({ preview: threadText.slice(0, 80), reply: reply.slice(0, 100) });
        logRow({ action: "chat_reply", target: page.url(), notes: reply.slice(0, 160) });
        handled += 1;
        console.log("chat replied", handled);
      } catch (e) {
        console.log("chat row skip", e?.message || e);
      }
    }
  }

  if (!result.messaged.length) {
    logRow({
      action: "inbox_check",
      target: "facebook.com/messages",
      notes: "No new chats needing reply this pass",
    });
  }
  console.log("chats done");
}

const result = {
  at: new Date().toISOString(),
  light: LIGHT,
  joined: [],
  requested: [],
  already: [],
  replied: [],
  posted: [],
  messaged: [],
  errors: [],
};

const seen = loadSeen();
if (existsSync(LOG)) {
  for (const m of readFileSync(LOG, "utf8").matchAll(/groups\/[\w.-]+/g)) {
    const href = `https://www.facebook.com/${m[0].replace(/\/$/, "")}/`;
    if (!seen.hrefs.includes(href)) seen.hrefs.push(href);
  }
}

const ctx = await launch();
const page = ctx.pages()[0] || (await ctx.newPage());

try {
  await page.goto("https://www.facebook.com/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2000);
  await dismiss(page);
  await snap(page, "01-home");

  if (!SKIP_CHATS) {
    try {
      await Promise.race([
        handleChats(page, result),
        new Promise((_, rej) => setTimeout(() => rej(new Error("chats timeout 60s")), 60000)),
      ]);
    } catch (e) {
      console.log("chats aborted:", e?.message || e);
      logRow({ action: "inbox_check", target: "facebook.com/messages", notes: String(e?.message || e) });
    }
  } else {
    console.log("Skipping chats (--skip-chats)");
  }

  let joins = 0;
  let replies = 0;
  let posts = 0;

  for (const q of SEARCHES) {
    if (joins >= MAX_JOINS && replies >= MAX_REPLIES && (SKIP_POSTS || posts >= MAX_POSTS)) break;
    // Don't keep searching once join cap is hit — move on to my-groups messaging
    if (joins >= MAX_JOINS) break;

    const url = `https://www.facebook.com/search/groups/?q=${encodeURIComponent(q)}`;
    console.log("\nSearch:", q);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    } catch (e) {
      console.warn("search goto skip", q, e?.message || e);
      continue;
    }
    await page.waitForTimeout(3000);
    await dismiss(page);

    const links = (await collectGroupLinks(page))
      .filter((g) => !seen.hrefs.includes(g.href))
      .filter((g) => isUkRelevantGroup(g.name));
    console.log("new groups", links.length);

    for (const g of links.slice(0, 4)) {
      if (joins >= MAX_JOINS) break;

      const status = await tryJoin(page, g, result, seen);
      if (status === "joined" || status === "requested") joins += 1;

      const inGroup = status === "joined" || status === "already";
      if (!inGroup) {
        saveSeen(seen);
        continue;
      }

      // Prefer a relevant wall post in employer/student/career rooms; reply on employee/job threads
      const audience = classifyAudience(g.name);
      const wantPost =
        !SKIP_POSTS &&
        posts < MAX_POSTS &&
        (audience === "employer" || audience === "student" || audience === "career" || posts < 2);

      if (wantPost) {
        const okPost = await tryPost(page, g, result);
        if (okPost) posts += 1;
      }

      if (replies < MAX_REPLIES) {
        const ok = await tryReply(page, g, result);
        if (ok) replies += 1;
      }
      saveSeen(seen);
    }
  }

  await page
    .goto("https://www.facebook.com/groups/joins/?nav_source=tab", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    })
    .catch(() => null);
  await page.waitForTimeout(2500);
  await snap(page, "my-groups");
  const mine = (await collectGroupLinks(page)).filter((g) => isUkRelevantGroup(g.name));
  console.log("my-groups for messaging", mine.length);
  for (const g of mine.slice(0, 12)) {
    if (replies >= MAX_REPLIES && (SKIP_POSTS || posts >= MAX_POSTS)) break;
    try {
      await page.goto(g.href, { waitUntil: "domcontentloaded", timeout: 90000 });
    } catch (e) {
      console.warn("my-group goto skip", g.name, e?.message || e);
      continue;
    }
    await page.waitForTimeout(2000);
    const audience = classifyAudience(g.name);
    console.log("my-group", audience, g.name);
    if (!SKIP_POSTS && posts < MAX_POSTS) {
      const okPost = await tryPost(page, g, result);
      if (okPost) posts += 1;
    }
    if (replies < MAX_REPLIES) {
      const ok = await tryReply(page, g, result);
      if (ok) replies += 1;
    }
  }

  saveSeen(seen);
  writeFileSync(STATUS, JSON.stringify(result, null, 2));
  console.log("\nDone", JSON.stringify(result, null, 2));
} catch (e) {
  result.errors.push(String(e?.message || e));
  console.error(e);
  await snap(page, "err");
  writeFileSync(STATUS, JSON.stringify(result, null, 2));
  saveSeen(seen);
} finally {
  await page.waitForTimeout(3000);
  await ctx.close();
}

process.exit(result.errors.length ? 1 : 0);
