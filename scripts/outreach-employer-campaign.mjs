#!/usr/bin/env node
/**
 * Automated cold outreach to SMEs hiring on competitor boards.
 * Sends branded HTML emails with Unsplash hero imagery.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM_HELLO, buildBrandedEmailHtml } from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prospectsPath = join(__dirname, "../data/employer-prospects.json");
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";
const CAMPAIGN_ID = "employer-outreach-v1";

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

const EMAIL_TEMPLATE = (p) => {
  const role = p.hiringSignal?.split(" on ")[0] ?? "staff";
  const board = p.competitorBoard ?? "Reed/Indeed";
  const hook = p.outreachHook
    ? `<p style="margin:0 0 14px;padding:12px 14px;background:#f0fdfa;border-radius:10px;color:#0f766e"><em>${escapeHtml(p.outreachHook)}</em></p>`
    : "";
  const cta = trackClick(p.email, "/pricing");
  const unsub = `${SITE}/unsubscribe?email=${encodeURIComponent(p.email)}`;
  const compare =
    board === "Reed"
      ? "Reed at £100+ per listing"
      : board === "Hays"
        ? "Hays at 15–20% placement fees"
        : "Indeed PPC at £400+/month";

  const bodyHtml = `
    <p style="margin:0 0 14px">Hi ${escapeHtml(p.companyName)} team,</p>
    <p style="margin:0 0 14px">We noticed you're hiring <strong>${escapeHtml(role)}</strong> in <strong>${escapeHtml(p.city)}</strong> — likely via ${escapeHtml(board)}.</p>
    ${hook}
    <p style="margin:0 0 14px">We're Recruitment Site, a flat-fee UK job board for care homes and SMEs. Founding employers in ${escapeHtml(p.city)} get:</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#334155">
      <li style="margin-bottom:8px"><strong>30 days free</strong> — no card required</li>
      <li style="margin-bottom:8px"><strong>£149/mo locked for 12 months</strong> (normally £249) — unlimited posts</li>
      <li style="margin-bottom:8px">Google Jobs syndication from day one</li>
      <li style="margin-bottom:8px">AI match scores on every applicant</li>
      <li style="margin-bottom:8px">No agency commission</li>
    </ul>
    <p style="margin:0 0 14px">Unlike ${escapeHtml(compare)}, you keep every hire for one flat fee.</p>
    <p style="margin:0 0 8px">Happy to set you up this week.</p>
    <p style="margin:20px 0 0;font-size:13px;color:#94a3b8">
      <a href="${unsub}" style="color:#64748b">Unsubscribe</a>
    </p>
    <img src="${trackOpen(p.email)}" width="1" height="1" alt="" style="display:none" />
  `;

  return {
    subject: `${p.city} care homes: unlimited hiring for £149/mo (founding rate)`,
    html: buildBrandedEmailHtml({
      title: `Founding rate for ${p.city} employers`,
      preheader: `30 days free + £149/mo locked — unlimited posts on Recruitment Site`,
      bodyHtml,
      ctaLabel: "Claim founding rate →",
      ctaUrl: cta,
      hero: "care",
      siteUrl: SITE,
    }),
  };
};

async function loadSuppressed(supabase) {
  const suppressed = new Set();
  if (!supabase) return suppressed;

  const { data } = await supabase
    .from("campaign_events")
    .select("prospect_email")
    .eq("event_type", "unsubscribed")
    .limit(5000);

  for (const row of data ?? []) {
    if (row.prospect_email) suppressed.add(String(row.prospect_email).toLowerCase());
  }

  const { data: alreadySent } = await supabase
    .from("campaign_events")
    .select("prospect_email")
    .eq("campaign_id", CAMPAIGN_ID)
    .eq("event_type", "sent")
    .limit(10000);

  for (const row of alreadySent ?? []) {
    if (row.prospect_email) suppressed.add(String(row.prospect_email).toLowerCase());
  }

  return suppressed;
}

async function main() {
  const utcDay = new Date().getUTCDay(); // 0 Sun … 6 Sat
  const isWeekend = utcDay === 0 || utcDay === 6;
  if (isWeekend && process.env.OUTREACH_ALLOW_WEEKEND !== "1") {
    console.log("⏭  Weekday-only outreach — skipping weekend (set OUTREACH_ALLOW_WEEKEND=1 to force).");
    return;
  }

  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  const resendKey = process.env.RESEND_API_KEY;
  const supabase = getSupabaseAdmin();
  const dryRun = !resendKey;

  console.log(`Recruitment Site employer outreach — ${prospects.length} prospects`);
  if (dryRun) console.log("⚠  Dry run (set RESEND_API_KEY to send)\n");

  const limit = Number(process.env.OUTREACH_LIMIT ?? 0);
  const includeGuessed = process.env.OUTREACH_INCLUDE_GUESSED === "1";
  const suppressed = await loadSuppressed(supabase);

  const ready = prospects
    .filter((p) => {
      if (!p.email) return false;
      if (suppressed.has(String(p.email).toLowerCase())) return false;
      if (p.emailStatus === "verified_public" || p.emailStatus === "scraped") return true;
      return includeGuessed && p.emailStatus === "guessed";
    })
    .sort((a, b) => {
      const rank = (p) =>
        p.emailStatus === "verified_public" || p.emailStatus === "scraped"
          ? 0
          : p.emailStatus === "guessed"
            ? 1
            : 2;
      const dr = rank(a) - rank(b);
      if (dr !== 0) return dr;
      return (a.priority ?? 9) - (b.priority ?? 9);
    });

  const batch = limit > 0 ? ready.slice(0, limit) : ready;

  console.log(
    `  ${ready.length.toLocaleString()} sendable (${includeGuessed ? "verified + guessed" : "verified only"}) of ${prospects.length.toLocaleString()} total`,
  );
  console.log(`  ${suppressed.size.toLocaleString()} suppressed (unsubscribed or already sent)`);
  if (limit > 0) console.log(`  Sending batch of ${batch.length} (OUTREACH_LIMIT=${limit})`);
  console.log("");

  let sent = 0;
  for (const p of batch) {
    if (!p.email) continue;

    const { subject, html } = EMAIL_TEMPLATE(p);

    if (dryRun) {
      console.log(`  [dry-run] → ${p.email}: ${subject}`);
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
          metadata: { company: p.companyName },
        });
      }
    } else {
      const err = await res.text().catch(() => "");
      console.log(`  ✗ ${p.email}: ${res.status} ${err.slice(0, 120)}`);
    }
  }

  console.log(`\n✓ ${sent} HTML emails ${dryRun ? "prepared" : "sent"} (Unsplash hero)`);
  console.log("Target: expand list daily → 50–200/day → convert founding employers");
}

main().catch(console.error);
