#!/usr/bin/env node
/**
 * Verify public feeds + submit partner registration requests where automation allows.
 * Sends branded HTML emails with Unsplash imagery.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EMAIL_FROM_HELLO, buildBrandedEmailHtml, appendEmailLegalFooter } from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";
const INDEED = `${SITE}/feeds/indeed.xml`;
const LINKEDIN = `${SITE}/feeds/linkedin.xml`;

function loadCred(key) {
  const path = join(root, "go-live-credentials.local.txt");
  if (!existsSync(path)) return process.env[key] ?? "";
  const text = readFileSync(path, "utf8");
  return text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim() ?? process.env[key] ?? "";
}

async function checkFeed(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    const ok = res.ok && text.includes("<source>") && text.includes("<job>");
    return { url, ok, status: res.status, bytes: text.length, sampleJobs: (text.match(/<job>/g) || []).length };
  } catch (e) {
    return { url, ok: false, status: 0, error: e.message };
  }
}

async function sendHtml({ resendKey, to, cc, subject, title, bodyHtml, hero, text }) {
  const html = buildBrandedEmailHtml({
    title,
    preheader: subject,
    bodyHtml,
    hero,
    siteUrl: SITE,
    ctaLabel: "View live jobs",
    ctaUrl: `${SITE}/jobs`,
  });
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM_HELLO,
      to: Array.isArray(to) ? to : [to],
      ...(cc ? { cc } : {}),
      subject,
      html,
      text: appendEmailLegalFooter(text),
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, id: data.id, error: data.message };
}

async function emailLinkedInBd(resendKey, feedStats) {
  const bodyHtml = `
    <p style="margin:0 0 14px">Hello LinkedIn Talent Solutions / Limited Listings team,</p>
    <p style="margin:0 0 14px">We operate <strong>Recruitment Site</strong> (<a href="${SITE}" style="color:#0f766e">${SITE.replace("https://", "")}</a>), a UK job board focused on healthcare and SME employers.</p>
    <p style="margin:0 0 14px">Please evaluate us for LinkedIn Limited Listings / Basic Jobs XML feed syndication.</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#334155">
      <li style="margin-bottom:8px">Live XML feed: <a href="${LINKEDIN}" style="color:#0f766e">${LINKEDIN}</a> (${feedStats.linkedinJobs} jobs)</li>
      <li style="margin-bottom:8px">Indeed-compatible feed: <a href="${INDEED}" style="color:#0f766e">${INDEED}</a> (${feedStats.indeedJobs} jobs)</li>
      <li style="margin-bottom:8px">Job search: <a href="${SITE}/jobs" style="color:#0f766e">${SITE}/jobs</a></li>
      <li style="margin-bottom:8px">Company: Recruitment Drive UK Ltd (Companies House 13481215)</li>
      <li style="margin-bottom:8px">Contact: hello@recruitmentsite.co.uk</li>
    </ul>
    <p style="margin:0">Happy to sign the partner agreement and iterate on feed certification.</p>
  `;
  return sendHtml({
    resendKey,
    to: "LL-BD@linkedin.com",
    cc: ["hello@recruitmentsite.co.uk"],
    subject: "Limited Listings partner evaluation — Recruitment Site (UK healthcare jobs)",
    title: "LinkedIn Limited Listings partnership",
    bodyHtml,
    hero: "hiring",
    text: `LinkedIn feed: ${LINKEDIN} (${feedStats.linkedinJobs} jobs). Contact hello@recruitmentsite.co.uk`,
  });
}

async function emailIndeedPartner(resendKey, feedStats) {
  const bodyHtml = `
    <p style="margin:0 0 14px">Internal checklist — Indeed organic feed registration</p>
    <p style="margin:0 0 14px">Feed URL (live): <a href="${INDEED}" style="color:#0f766e">${INDEED}</a> — <strong>${feedStats.indeedJobs}</strong> jobs</p>
    <ol style="margin:0 0 16px;padding-left:20px;color:#334155">
      <li style="margin-bottom:8px">Sign in at <a href="https://employers.indeed.com/" style="color:#0f766e">employers.indeed.com</a> or <a href="https://www.indeed.com/partners" style="color:#0f766e">indeed.com/partners</a></li>
      <li style="margin-bottom:8px">Submit XML source feed URL: <code>${INDEED}</code></li>
      <li style="margin-bottom:8px">Confirm Single-Source Feed Policy awareness</li>
      <li style="margin-bottom:8px">Monitor ingestion errors after crawl</li>
    </ol>
    <p style="margin:0">Also available for LinkedIn once approved: <a href="${LINKEDIN}" style="color:#0f766e">${LINKEDIN}</a></p>
  `;
  return sendHtml({
    resendKey,
    to: "hello@recruitmentsite.co.uk",
    subject: "[Action] Register Indeed XML feed — recruitmentsite.co.uk",
    title: "Indeed XML feed — action required",
    bodyHtml,
    hero: "growth",
    text: `Register Indeed feed ${INDEED} (${feedStats.indeedJobs} jobs) via employers.indeed.com / indeed.com/partners`,
  });
}

async function main() {
  console.log("Partner feed registration\n");

  const indeed = await checkFeed(INDEED);
  const linkedin = await checkFeed(LINKEDIN);
  console.log(
    `${indeed.ok ? "✓" : "✗"} Indeed feed ${indeed.url} — HTTP ${indeed.status}, ${indeed.sampleJobs ?? 0} jobs`,
  );
  console.log(
    `${linkedin.ok ? "✓" : "✗"} LinkedIn feed ${linkedin.url} — HTTP ${linkedin.status}, ${linkedin.sampleJobs ?? 0} jobs`,
  );

  const feedStats = {
    indeedJobs: indeed.sampleJobs ?? 0,
    linkedinJobs: linkedin.sampleJobs ?? 0,
  };

  const resendKey = loadCred("RESEND_API_KEY");
  const skipOutbound = process.env.PARTNER_FEEDS_DRY === "1" || !resendKey;
  if (skipOutbound) {
    console.log("\n⚠  Skipped outbound partner emails (no RESEND_API_KEY or PARTNER_FEEDS_DRY=1)");
  } else {
    const li = await emailLinkedInBd(resendKey, feedStats);
    console.log(
      `${li.ok ? "✓" : "✗"} LinkedIn BD HTML email${li.id ? ` — ${li.id}` : ""}${li.error ? ` — ${li.error}` : ""}`,
    );
    const ind = await emailIndeedPartner(resendKey, feedStats);
    console.log(
      `${ind.ok ? "✓" : "✗"} Indeed action HTML email to hello@${ind.id ? ` — ${ind.id}` : ""}${ind.error ? ` — ${ind.error}` : ""}`,
    );
  }

  console.log(`
GOV.UK Find a Job (manual portal — no public XML partner API):
  1. https://www.gov.uk/advertise-job
  2. Create employer account for Recruitment Drive UK Ltd
  3. For bulk/system upload, contact Employer Services: 0800 169 0178

Indeed Partner Console:
  https://www.indeed.com/partners
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
