#!/usr/bin/env node
/**
 * Daily job alert digests — match active alerts to new/updated jobs and email candidates.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { appendEmailLegalFooter, EMAIL_FROM, buildBrandedEmailHtml } from "@placeuk/shared";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";
const MAX_JOBS_PER_EMAIL = 5;

function matchJobs(jobs, alert) {
  const city = (alert.city || "").toLowerCase().trim();
  const vertical = (alert.vertical || "").toLowerCase().trim();
  const keywords = (alert.keywords || "").toLowerCase().trim();
  const terms = keywords ? keywords.split(/[\s,]+/).filter(Boolean) : [];

  return jobs.filter((job) => {
    if (city && !String(job.city || "").toLowerCase().includes(city)) return false;
    if (vertical && String(job.vertical || "").toLowerCase() !== vertical) return false;
    if (terms.length === 0) return true;
    const hay = `${job.title} ${job.description} ${(job.skills || []).join(" ")}`.toLowerCase();
    return terms.some((t) => hay.includes(t));
  });
}

function buildHtml(jobs, email) {
  const items = jobs
    .map((job) => {
      const salary =
        job.salary_disclosed && job.salary_min
          ? `£${Number(job.salary_min).toLocaleString()}–£${Number(job.salary_max || job.salary_min).toLocaleString()}`
          : "Salary on application";
      return `<li style="margin-bottom:12px">
        <a href="${SITE_URL}/jobs/${job.slug}?src=alert" style="color:#0f766e;font-weight:600;text-decoration:none">${job.title}</a>
        <br/><span style="color:#64748b;font-size:14px">${job.city} · ${salary}</span>
      </li>`;
    })
    .join("");

  return buildBrandedEmailHtml({
    title: "Jobs matching your alert",
    preheader: `${jobs.length} role${jobs.length === 1 ? "" : "s"} for you today`,
    bodyHtml: `
      <p style="color:#475569;margin:0 0 16px">Here are ${jobs.length} role${jobs.length === 1 ? "" : "s"} for you today.</p>
      <ul style="padding-left:18px;margin:0 0 24px">${items}</ul>
      <p style="font-size:13px;color:#94a3b8">
        <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#64748b">Unsubscribe</a>
      </p>
    `,
    hero: "healthcare",
    siteUrl: SITE_URL,
    ctaLabel: "Browse all jobs",
    ctaUrl: `${SITE_URL}/jobs`,
  });
}

async function sendDigest(to, subject, html, text) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`  [dry-run] Would email ${to}: ${subject}`);
    return true;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: appendEmailLegalFooter(text),
    }),
  });
  return res.ok;
}

async function main() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log("⚠  Supabase not configured — alert digest stub");
    return;
  }

  const { data: alerts, error } = await supabase
    .from("job_alerts")
    .select("id, email, keywords, city, vertical, frequency, last_sent_at, phone_e164, sms_enabled, channel")
    .eq("active", true)
    .eq("frequency", "daily")
    .limit(500);

  if (error) {
    console.error("Failed to load alerts:", error.message);
    process.exit(1);
  }

  if (!alerts?.length) {
    console.log("✓ No active daily alerts");
    return;
  }

  const sinceIso = new Date(Date.now() - 26 * 3600000).toISOString();
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, slug, title, description, city, vertical, skills, salary_min, salary_max, salary_disclosed, published_at, updated_at",
    )
    .eq("status", "active")
    .or(`published_at.gte.${sinceIso},updated_at.gte.${sinceIso}`)
    .order("published_at", { ascending: false })
    .limit(200);

  const recentJobs = jobs ?? [];
  if (!recentJobs.length) {
    console.log("✓ No recent jobs to digest");
    return;
  }

  let sent = 0;
  for (const alert of alerts) {
    const since = alert.last_sent_at
      ? new Date(alert.last_sent_at).getTime()
      : Date.now() - 26 * 3600000;
    const candidates = recentJobs.filter((j) => {
      const pub = new Date(j.published_at || j.updated_at || 0).getTime();
      return pub > since;
    });
    const matched = matchJobs(candidates, alert).slice(0, MAX_JOBS_PER_EMAIL);
    if (!matched.length) continue;

    const subject = `${matched.length} new job${matched.length === 1 ? "" : "s"} matching your alert`;
    const text = matched
      .map((j) => `- ${j.title} (${j.city}): ${SITE_URL}/jobs/${j.slug}?src=alert`)
      .join("\n");
    const ok = await sendDigest(alert.email, subject, buildHtml(matched, alert.email), text);

    let smsOk = true;
    if (alert.sms_enabled && alert.phone_e164) {
      smsOk = await sendSmsDigest(alert.phone_e164, matched);
    }

    if (ok || (alert.sms_enabled && smsOk)) {
      await supabase
        .from("job_alerts")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("id", alert.id);
      sent += 1;
      console.log(
        `  Sent digest to ${alert.email}${alert.sms_enabled ? " + SMS" : ""} (${matched.length} jobs)`,
      );
    }
  }

  console.log(`✓ Alert digests complete — notified ${sent}/${alerts.length} subscribers`);
}

async function sendSmsDigest(phone, jobs) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const top = jobs.slice(0, 3);
  const body =
    `Recruitment Site: ${jobs.length} new job${jobs.length === 1 ? "" : "s"}. ` +
    top.map((j) => `${j.title} (${j.city})`).join("; ") +
    ` — ${SITE_URL}/jobs?src=sms`;

  if (!sid || !token || !from) {
    console.log(`  [sms dry-run] → ${phone}: ${body.slice(0, 120)}`);
    return true;
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: phone, From: from, Body: body.slice(0, 1600) });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  return res.ok;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
