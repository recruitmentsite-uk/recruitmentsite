#!/usr/bin/env node
/**
 * Daily ops digest → hello@ — site, sales, marketing, CS email summary.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM, buildBrandedEmailHtml, appendEmailLegalFooter } from "@placeuk/shared";
import { runCsTriage } from "./cs-triage-and-mark.mjs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";

async function countJobs(supabase) {
  if (!supabase) return null;
  const { count } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString());
  return count ?? null;
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  const supabase = getSupabaseAdmin();
  const resendKey = process.env.RESEND_API_KEY;
  const activeJobs = await countJobs(supabase);
  const checks = {
    home: await checkUrl(SITE),
    jobs: await checkUrl(`${SITE}/jobs`),
    forEmployers: await checkUrl(`${SITE}/for-employers`),
    indeed: await checkUrl(`${SITE}/feeds/indeed.xml`),
    linkedin: await checkUrl(`${SITE}/feeds/linkedin.xml`),
    marketing: await checkUrl(`${SITE}/marketing`),
    pricing: await checkUrl(`${SITE}/pricing`),
    indexnow: await checkUrl(`${SITE}/recruitmentsite-indexnow-7f3a9c2e1b84.txt`),
  };

  let cs = { totalAction: 0, totalSeen: 0, actions: [], errors: [] };
  let ticketsSynced = { created: 0, skipped: 0 };
  try {
    cs = await runCsTriage({ quiet: true });
    try {
      const { syncCsTickets } = await import("./sync-cs-tickets.mjs");
      ticketsSynced = await syncCsTickets(cs);
    } catch (syncErr) {
      cs.errors = [...(cs.errors || []), `ticket sync: ${syncErr.message || syncErr}`];
    }
  } catch (err) {
    cs.errors = [err.message || String(err)];
  }

  const row = (label, ok, detail = "") =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#334155">${label}</td>
     <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:${ok ? "#0f766e" : "#b91c1c"}">${ok ? "OK" : "CHECK"}${detail ? ` · ${detail}` : ""}</td></tr>`;

  const actionRows =
    cs.actions.length === 0
      ? `<p style="margin:0 0 16px;color:#64748b;font-size:14px">No actionable CS / partner emails today.</p>`
      : `<ul style="margin:0 0 16px;padding-left:18px;color:#334155;font-size:14px;line-height:1.55">${cs.actions
          .slice(0, 12)
          .map(
            (a) =>
              `<li><strong>${a.mailbox}</strong>: ${a.subject.replace(/</g, "&lt;")}<br/><span style="color:#64748b">${(a.from || "").replace(/</g, "&lt;")}</span></li>`,
          )
          .join("")}</ul>`;

  const bodyHtml = `
    <p style="margin:0 0 12px">Daily business departments — ${new Date().toISOString().slice(0, 10)} UTC</p>
    <p style="margin:0 0 16px"><strong>Active published jobs:</strong> ${activeJobs ?? "n/a"}</p>

    <p style="margin:0 0 8px;font-weight:600">1) Site</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px">
      ${row("Homepage", checks.home === 200)}
      ${row("Jobs board", checks.jobs === 200)}
      ${row("For employers", checks.forEmployers === 200)}
      ${row("Pricing", checks.pricing === 200)}
    </table>

    <p style="margin:0 0 8px;font-weight:600">2) Sales</p>
    <p style="margin:0 0 16px;color:#475569;font-size:14px">Cloud sends employer outreach daily (10:00 UTC, up to 50). Prospects expand at 05:00. Review only if Monday brief flags low reply volume.</p>

    <p style="margin:0 0 8px;font-weight:600">3) Marketing</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px">
      ${row("Marketing hub", checks.marketing === 200)}
      ${row("Indeed feed", checks.indeed === 200)}
      ${row("LinkedIn feed", checks.linkedin === 200)}
      ${row("IndexNow key", checks.indexnow === 200)}
    </table>
    <p style="margin:0 0 16px;color:#475569;font-size:14px">IndexNow + Google Indexing API run at 06:30 UTC. Candidate alert digests at 09:00.</p>

    <p style="margin:0 0 8px;font-weight:600">4) Customer service / email</p>
    <p style="margin:0 0 8px;color:#475569;font-size:14px">Marked ${cs.totalSeen} vendor/noise messages Seen · <strong>${cs.totalAction}</strong> actionable · tickets created ${ticketsSynced.created} (skipped ${ticketsSynced.skipped}) · <a href="${SITE}/admin/tickets">Open tickets</a></p>
    ${actionRows}
    ${
      cs.errors.length
        ? `<p style="margin:0 0 16px;color:#b91c1c;font-size:13px">IMAP issues: ${cs.errors.join("; ").replace(/</g, "&lt;")}</p>`
        : ""
    }

    <p style="margin:0;color:#64748b;font-size:13px">Human target ≤1 hour/week (Monday brief). Do not run departments locally unless Actions is red.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: "Daily ops — Recruitment Site",
    preheader: `Jobs ${activeJobs ?? "?"} · CS actions ${cs.totalAction} · site/sales/marketing`,
    bodyHtml,
    ctaLabel: "Open live site",
    ctaUrl: SITE,
    hero: "growth",
    siteUrl: SITE,
  });

  console.log(
    JSON.stringify(
      { activeJobs, checks, cs: { totalAction: cs.totalAction, totalSeen: cs.totalSeen, errors: cs.errors } },
      null,
      2,
    ),
  );

  if (!resendKey) {
    console.log("⚠  RESEND_API_KEY missing — report not emailed");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: ["hello@recruitmentsite.co.uk"],
      subject: `[Daily ops] ${activeJobs ?? "?"} jobs · CS ${cs.totalAction} action · ${new Date().toISOString().slice(0, 10)}`,
      html,
      text: appendEmailLegalFooter(
        `Daily ops: ${activeJobs ?? "?"} jobs. CS actionable ${cs.totalAction}. Home ${checks.home}, jobs ${checks.jobs}.`,
      ),
    }),
  });
  const data = await res.json().catch(() => ({}));
  console.log(res.ok ? `✓ Emailed hello@ — ${data.id}` : `✗ Email failed — ${data.message}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
