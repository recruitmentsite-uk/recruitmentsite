#!/usr/bin/env node
/**
 * Monday ops brief → hello@ — the only intentional weekly human touchpoint.
 * Goal: keep founder ops ≤ 1 hour/week.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM, buildBrandedEmailHtml } from "@placeuk/shared";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk").replace(/\/$/, "");
const ACTIONS =
  "https://github.com/recruitmentsite-uk/recruitmentsite/actions/workflows/automation.yml";

async function count(supabase, table, filters = (q) => q) {
  if (!supabase) return null;
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  q = filters(q);
  const { count: n } = await q;
  return n ?? 0;
}

async function check(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const supabase = getSupabaseAdmin();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const now = new Date().toISOString();

  const activeJobs = await count(supabase, "jobs", (q) =>
    q.eq("status", "active").gt("expires_at", now),
  );
  const applications = await count(supabase, "applications", (q) =>
    q.gte("submitted_at", weekAgo),
  );
  const employers = await count(supabase, "employers");
  const alerts = await count(supabase, "job_alerts", (q) => q.eq("active", true));

  const health = {
    home: await check(SITE),
    jobs: await check(`${SITE}/jobs`),
    indeed: await check(`${SITE}/feeds/indeed.xml`),
    linkedin: await check(`${SITE}/feeds/linkedin.xml`),
    indexnow: await check(`${SITE}/recruitmentsite-indexnow-7f3a9c2e1b84.txt`),
    sitemap: await check(`${SITE}/sitemap.xml`),
  };

  const ok = (status) => status === 200 || status === 202;
  const row = (label, good, detail = "") =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#334155">${label}</td>
     <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:${good ? "#0f766e" : "#b91c1c"}">${good ? "OK" : "CHECK"}${detail ? ` · ${detail}` : ""}</td></tr>`;

  const bodyHtml = `
    <p style="margin:0 0 12px"><strong>Your ≤1 hour/week ops slot</strong> — ${now.slice(0, 10)}</p>
    <p style="margin:0 0 16px;color:#475569;font-size:14px">Everything below already ran in GitHub cloud. Spend this hour only on the human checklist.</p>

    <p style="margin:0 0 8px;font-weight:600">Snapshot</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px">
      ${row("Active jobs", true, String(activeJobs ?? "?"))}
      ${row("Applications (7d)", true, String(applications ?? "?"))}
      ${row("Employers", true, String(employers ?? "?"))}
      ${row("Active job alerts", true, String(alerts ?? "?"))}
      ${row("Homepage", ok(health.home))}
      ${row("Jobs board", ok(health.jobs))}
      ${row("Indeed feed", ok(health.indeed))}
      ${row("LinkedIn feed", ok(health.linkedin))}
      ${row("IndexNow key", ok(health.indexnow))}
      ${row("Sitemap", ok(health.sitemap))}
    </table>

    <p style="margin:0 0 8px;font-weight:600">Human checklist (≤60 min)</p>
    <ol style="margin:0 0 20px;padding-left:20px;color:#334155;font-size:14px;line-height:1.6">
      <li><strong>Site / cloud:</strong> skim this email + <a href="${ACTIONS}">Actions</a> for red runs</li>
      <li><strong>CS email:</strong> reply to ACTION items from daily ops (hello/admin/billing…)</li>
      <li><strong>Sales:</strong> only if outreach/partner replies need a human</li>
      <li><strong>Marketing:</strong> Indeed/LinkedIn partner mail + optional GSC glance</li>
      <li>Admin spam/fraud + Stripe refunds/verification if waiting</li>
    </ol>

    <p style="margin:0;color:#64748b;font-size:13px">Cloud already handles site smoke (on deploy), sales outreach, marketing SEO/digests/feeds, CS inbox triage (noise → Seen), job sync/enrich/expire/matching.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: "Weekly ops brief — Recruitment Site",
    preheader: `${activeJobs ?? "?"} jobs · ${applications ?? "?"} apps · your 1hr checklist`,
    bodyHtml,
    ctaLabel: "Open GitHub Actions",
    ctaUrl: ACTIONS,
    hero: "growth",
    siteUrl: SITE,
  });

  console.log(
    JSON.stringify({ activeJobs, applications, employers, alerts, health }, null, 2),
  );

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("⚠  RESEND_API_KEY missing — brief not emailed");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: "hello@recruitmentsite.co.uk",
      subject: `Weekly ops brief · ${activeJobs ?? "?"} jobs · ≤1hr checklist`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("Email failed", res.status, await res.text());
    process.exit(1);
  }
  console.log("✓ Weekly ops brief emailed to hello@");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
