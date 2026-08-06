#!/usr/bin/env node
/**
 * Cold outreach to NHS trust + UK council HR / recruitment inboxes.
 *
 *   node scripts/build-nhs-council-prospects.mjs
 *   node scripts/outreach-nhs-council.mjs
 *   OUTREACH_LIMIT=100 node scripts/outreach-nhs-council.mjs
 *
 * Env: RESEND_API_KEY, SUPABASE_*, OUTREACH_LIMIT (0 = all sendable)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM_HELLO, buildBrandedEmailHtml } from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const prospectsPath = join(root, "data/nhs-council-prospects.json");
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";
const CAMPAIGN_ID = "nhs-council-hr-v1";

function loadLocalEnv() {
  for (const rel of [
    "go-live-credentials.local.txt",
    ".env.local",
    "apps/web/.env.local",
  ]) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
}

function trackOpen(email) {
  return `${SITE}/api/t/open?e=${encodeURIComponent(email)}&c=${encodeURIComponent(CAMPAIGN_ID)}`;
}
function trackClick(email, path = "/pricing") {
  return `${SITE}/api/t/click?e=${encodeURIComponent(email)}&c=${encodeURIComponent(CAMPAIGN_ID)}&u=${encodeURIComponent(path)}`;
}
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailTemplate(p) {
  const isNhs = p.sector === "nhs";
  const org = escapeHtml(p.companyName || "your organisation");
  const cta = trackClick(p.email, "/pricing");
  const unsub = `${SITE}/unsubscribe?email=${encodeURIComponent(p.email)}`;
  const subject = isNhs
    ? `${p.companyName}: cut agency spend with flat-fee job ads`
    : `${p.companyName}: flat-fee hiring board for council roles`;

  const bodyHtml = `
    <p style="margin:0 0 14px">Hello ${org} HR / Recruitment team,</p>
    <p style="margin:0 0 14px">${
      isNhs
        ? "NHS trusts are under pressure on agency and bank spend. Recruitment Site is a UK flat-fee job board — unlimited posts, Google Jobs syndication, AI match on applicants, no agency commission."
        : "Councils need predictable hiring costs. Recruitment Site is a UK flat-fee job board — unlimited posts, Google Jobs syndication, AI match on applicants, no agency commission."
    }</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#334155">
      <li style="margin-bottom:8px"><strong>30-day free trial</strong> — post roles and see applicant flow</li>
      <li style="margin-bottom:8px"><strong>Flat monthly fee</strong> — Growth £249 / Scale £499 (unlimited posts)</li>
      <li style="margin-bottom:8px">Candidates apply free (more volume vs paywalled boards)</li>
      <li style="margin-bottom:8px">Built for UK public-sector and care workforce hiring</li>
    </ul>
    <p style="margin:0 0 14px">Happy to set up ${org} this week — reply or use the link below.</p>
    <p style="margin:20px 0 0;font-size:13px;color:#94a3b8">
      <a href="${unsub}" style="color:#64748b">Unsubscribe</a>
    </p>
    <img src="${trackOpen(p.email)}" width="1" height="1" alt="" style="display:none" />
  `;

  return {
    subject,
    html: buildBrandedEmailHtml({
      title: isNhs ? "NHS workforce hiring — flat fee" : "Council hiring — flat fee",
      preheader: "30-day trial · unlimited posts · no agency commission",
      bodyHtml,
      ctaLabel: "Start free trial →",
      ctaUrl: cta,
      hero: isNhs ? "care" : "office",
      siteUrl: SITE,
    }),
  };
}

async function loadSuppressed(supabase) {
  const suppressed = new Set();
  if (!supabase) return suppressed;
  const { data: unsub } = await supabase
    .from("campaign_events")
    .select("prospect_email")
    .eq("event_type", "unsubscribed")
    .limit(10000);
  for (const row of unsub ?? []) {
    if (row.prospect_email) suppressed.add(String(row.prospect_email).toLowerCase());
  }
  for (const campaignId of [CAMPAIGN_ID, "employer-outreach-v1"]) {
    const { data: sent } = await supabase
      .from("campaign_events")
      .select("prospect_email")
      .eq("campaign_id", campaignId)
      .eq("event_type", "sent")
      .limit(20000);
    for (const row of sent ?? []) {
      if (row.prospect_email) suppressed.add(String(row.prospect_email).toLowerCase());
    }
  }
  return suppressed;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadLocalEnv();
  if (!existsSync(prospectsPath)) {
    console.error("Missing data/nhs-council-prospects.json — run: node scripts/build-nhs-council-prospects.mjs");
    process.exit(1);
  }

  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  const resendKey = process.env.RESEND_API_KEY;
  const supabase = getSupabaseAdmin();
  const dryRun = process.env.OUTREACH_DRY_RUN === "1" || !resendKey;
  const limit = Number(process.env.OUTREACH_LIMIT ?? 0);
  const sector = (process.env.OUTREACH_SECTOR || "all").toLowerCase(); // nhs|council|all
  const includeGuessed = process.env.OUTREACH_INCLUDE_GUESSED !== "0";

  console.log(`NHS + council HR outreach — ${prospects.length} prospects`);
  if (dryRun) console.log("⚠  Dry run (set RESEND_API_KEY and unset OUTREACH_DRY_RUN to send)\n");

  const suppressed = await loadSuppressed(supabase);
  const ready = prospects
    .filter((p) => {
      if (!p.email) return false;
      if (sector !== "all" && p.sector !== sector) return false;
      if (suppressed.has(String(p.email).toLowerCase())) return false;
      if (p.emailStatus === "verified_public" || p.emailStatus === "scraped") return true;
      return includeGuessed && p.emailStatus === "guessed";
    })
    .sort((a, b) => {
      const rank = (p) =>
        p.emailStatus === "scraped" || p.emailStatus === "verified_public" ? 0 : 1;
      const dr = rank(a) - rank(b);
      if (dr !== 0) return dr;
      return (a.priority ?? 9) - (b.priority ?? 9);
    });

  const batch = limit > 0 ? ready.slice(0, limit) : ready;
  const nhsN = batch.filter((p) => p.sector === "nhs").length;
  const councilN = batch.filter((p) => p.sector === "council").length;

  console.log(`  sendable: ${ready.length} (suppressed ${suppressed.size})`);
  console.log(`  batch: ${batch.length} (nhs=${nhsN}, council=${councilN})`);
  if (limit > 0) console.log(`  OUTREACH_LIMIT=${limit}`);

  let sent = 0;
  let failed = 0;
  for (const p of batch) {
    const { subject, html } = emailTemplate(p);
    if (dryRun) {
      sent++;
      continue;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM_HELLO,
        to: p.email,
        subject,
        html,
      }),
    });
    if (res.ok) {
      sent++;
      if (supabase) {
        await supabase.from("campaign_events").insert({
          prospect_email: p.email,
          campaign_id: CAMPAIGN_ID,
          event_type: "sent",
          metadata: {
            company: p.companyName,
            sector: p.sector,
            emailStatus: p.emailStatus,
          },
        });
      }
      if (sent % 25 === 0) console.log(`  … ${sent}/${batch.length}`);
      await sleep(120);
    } else {
      failed++;
      const err = await res.text().catch(() => "");
      console.log(`  ✗ ${p.sector} ${res.status} ${err.slice(0, 100)}`);
      if (res.status === 429 || /daily_quota|quota/i.test(err)) {
        console.log("⏹  Resend daily quota hit — stopping. Re-run tomorrow for the remainder.");
        break;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: failed === 0,
        dryRun,
        sent,
        failed,
        batch: batch.length,
        ready: ready.length,
        campaign: CAMPAIGN_ID,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
