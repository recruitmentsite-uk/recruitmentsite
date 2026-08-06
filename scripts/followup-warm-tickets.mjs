#!/usr/bin/env node
/**
 * Chase open warm-lead tickets with a short follow-up email.
 * Skips anyone already emailed (campaign_events warm_followup_sent).
 *
 *   WARM_FOLLOWUP_LIMIT=25 node scripts/followup-warm-tickets.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM_HELLO, buildBrandedEmailHtml } from "@placeuk/shared";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGN_ID = "employer-outreach-v1";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";
const LIMIT = Number(process.env.WARM_FOLLOWUP_LIMIT ?? 25);

function loadLocalEnv() {
  for (const rel of ["go-live-credentials.local.txt", ".env.local", "apps/web/.env.local"]) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/);
      if (!m) continue;
      const k = m[1];
      const v = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
}

async function main() {
  loadLocalEnv();
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Supabase not configured");
    process.exit(1);
  }
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY missing");
    process.exit(1);
  }

  // Prefer tagged warm-leads; fall back to subject match for today's auto tickets
  let { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("id, subject, requester_email, requester_name, priority, tags, created_at, status")
    .eq("status", "open")
    .contains("tags", ["warm-lead"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!tickets?.length) {
    const fallback = await supabase
      .from("support_tickets")
      .select("id, subject, requester_email, requester_name, priority, tags, created_at, status")
      .eq("status", "open")
      .ilike("subject", "Warm lead:%")
      .order("created_at", { ascending: false })
      .limit(200);
    if (fallback.error) {
      console.error(fallback.error.message);
      process.exit(1);
    }
    tickets = fallback.data;
  }

  // Clickers (high / "clicked") first
  tickets = (tickets ?? []).sort((a, b) => {
    const rank = (t) =>
      /clicked/i.test(t.subject || "") || t.priority === "high" ? 0 : 1;
    const dr = rank(a) - rank(b);
    if (dr !== 0) return dr;
    return String(b.created_at).localeCompare(String(a.created_at));
  });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const { data: already } = await supabase
    .from("campaign_events")
    .select("prospect_email")
    .eq("campaign_id", CAMPAIGN_ID)
    .eq("event_type", "warm_followup_sent")
    .limit(2000);
  const sent = new Set(
    (already ?? []).map((r) => String(r.prospect_email || "").toLowerCase()),
  );

  let emailed = 0;
  let skipped = 0;
  const failures = [];

  for (const t of tickets ?? []) {
    if (emailed >= LIMIT) break;
    const email = String(t.requester_email || "")
      .trim()
      .toLowerCase();
    if (!email.includes("@") || sent.has(email)) {
      skipped += 1;
      continue;
    }

    const company = t.requester_name || "";
    const clicked = /clicked/i.test(t.subject || "") || t.priority === "high";
    const link = new URL("/pricing", SITE);
    link.searchParams.set("offer", "warm99");
    link.searchParams.set("email", email);

    const html = buildBrandedEmailHtml({
      title: clicked ? "Saw you checked pricing" : "Still hiring this month?",
      preheader: "£99 month 1 · unlimited posts · no agency cut",
      bodyHtml: clicked
        ? `
        <p style="margin:0 0 14px">Hi${company ? ` ${escapeHtml(company)}` : ""},</p>
        <p style="margin:0 0 14px">Thanks for taking a look at Recruitment Site pricing earlier.</p>
        <p style="margin:0 0 14px">If you have roles open this month, I can get your first job live today — <strong>flat fee, unlimited posts, no agency commission</strong>.</p>
        <p style="margin:0 0 14px">For warm leads: <strong>£99 for month 1</strong> on Growth (then £249/mo). Cancel anytime.</p>
        <p style="margin:0 0 14px">Reply with how many roles you’re hiring and I’ll set it up, or use the link below.</p>
      `
        : `
        <p style="margin:0 0 14px">Hi${company ? ` ${escapeHtml(company)} team` : ""},</p>
        <p style="margin:0 0 14px">Quick follow-up — if you have open roles this month, you can list them on Recruitment Site in minutes.</p>
        <p style="margin:0 0 14px"><strong>Flat monthly fee</strong> · unlimited posts · AI match · Google Jobs. No agency commission.</p>
        <p style="margin:0 0 14px">Founding offer: <strong>£99 for month 1</strong> (then £249/mo, cancel anytime).</p>
      `,
      ctaLabel: "Claim £99 month 1 →",
      ctaUrl: link.toString(),
      hero: "hiring",
      siteUrl: SITE,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM_HELLO,
        to: email,
        subject: clicked
          ? "Following up — £99 month 1 if you’re hiring"
          : company
            ? `${company} — still hiring? £99 month 1`
            : "Still hiring? £99 month 1 on Recruitment Site",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      failures.push({ email, status: res.status, err: err.slice(0, 120) });
      if (res.status === 429 || /daily_quota|quota/i.test(err)) {
        console.log("⏹  Resend quota hit — stopping. Remainder stays for next run.");
        break;
      }
      continue;
    }

    emailed += 1;
    sent.add(email);
    await supabase.from("campaign_events").insert({
      prospect_email: email,
      campaign_id: CAMPAIGN_ID,
      event_type: "warm_followup_sent",
      metadata: { ticket_id: t.id, company: company || null, clicked },
    });
    await supabase.from("support_ticket_messages").insert({
      ticket_id: t.id,
      author_email: "system@recruitmentsite.co.uk",
      body: `Follow-up nudge sent (${clicked ? "clicker" : "opener"}) with warm99 link.`,
      is_internal: true,
    });
    await supabase
      .from("support_tickets")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", t.id);
  }

  console.log(
    JSON.stringify({
      openWarmTickets: tickets?.length ?? 0,
      emailed,
      skipped,
      limit: LIMIT,
      failures: failures.slice(0, 8),
    }),
  );
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
