#!/usr/bin/env node
/**
 * Daily ops digest → hello@ (HTML + Unsplash). Summarises departments.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM, buildBrandedEmailHtml, appendEmailLegalFooter } from "@placeuk/shared";

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
    indeed: await checkUrl(`${SITE}/feeds/indeed.xml`),
    linkedin: await checkUrl(`${SITE}/feeds/linkedin.xml`),
    marketing: await checkUrl(`${SITE}/marketing`),
    pricing: await checkUrl(`${SITE}/pricing`),
  };

  const row = (label, ok) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#334155">${label}</td>
     <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:${ok ? "#0f766e" : "#b91c1c"}">${ok ? "OK" : "CHECK"}</td></tr>`;

  const bodyHtml = `
    <p style="margin:0 0 16px">Automated daily department report — ${new Date().toISOString().slice(0, 10)} UTC</p>
    <p style="margin:0 0 16px"><strong>Active published jobs:</strong> ${activeJobs ?? "n/a"}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px">
      ${row("Homepage", checks.home === 200)}
      ${row("Jobs board", checks.jobs === 200)}
      ${row("Indeed XML feed", checks.indeed === 200)}
      ${row("LinkedIn XML feed", checks.linkedin === 200)}
      ${row("Marketing", checks.marketing === 200)}
      ${row("Pricing", checks.pricing === 200)}
    </table>
    <p style="margin:0 0 8px;color:#64748b;font-size:14px">Departments scheduled in GitHub Actions (runs even when your PC is off): job sync, enrich, expire, matching, alerts, prospect expand, employer outreach, partner feeds, CS triage.</p>
    <p style="margin:0;color:#64748b;font-size:14px">Stripe live cutover is intentionally paused until you upload verification docs.</p>
  `;

  const html = buildBrandedEmailHtml({
    title: "Daily ops — Recruitment Site",
    preheader: `Jobs ${activeJobs ?? "?"} · feeds & marketing health check`,
    bodyHtml,
    ctaLabel: "Open live site",
    ctaUrl: SITE,
    hero: "growth",
    siteUrl: SITE,
  });

  console.log("Daily ops report");
  console.log(JSON.stringify({ activeJobs, checks }, null, 2));

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
      subject: `[Daily ops] ${activeJobs ?? "?"} jobs · site health ${new Date().toISOString().slice(0, 10)}`,
      html,
      text: appendEmailLegalFooter(
        `Daily ops: ${activeJobs ?? "?"} active jobs. Home ${checks.home}, jobs ${checks.jobs}, indeed ${checks.indeed}, linkedin ${checks.linkedin}`,
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
