#!/usr/bin/env node
/**
 * Automated cold outreach to SMEs hiring on competitor boards.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { emailLegalFooterHtml, EMAIL_FROM_HELLO } from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prospectsPath = join(__dirname, "../data/employer-prospects.json");

const EMAIL_TEMPLATE = (p) => {
  const role = p.hiringSignal?.split(" on ")[0] ?? "staff";
  const board = p.competitorBoard ?? "Reed/Indeed";
  const hook = p.outreachHook ? `<p><em>${p.outreachHook}</em></p>` : "";

  return {
    subject: `${p.city} care homes: unlimited hiring for £149/mo (founding rate)`,
    html: `
    <p>Hi ${p.companyName} team,</p>
    <p>We noticed you're hiring ${role} in ${p.city} — likely via ${board}.</p>
    ${hook}
    <p>We're Recruitment Site, a new flat-fee job board for UK care homes and SMEs. I know switching platforms feels risky when you're new — so we're offering <strong>founding employers in ${p.city}</strong>:</p>
    <ul>
      <li><strong>30 days completely free</strong> — no card required</li>
      <li><strong>£149/mo locked for 12 months</strong> (normally £249) — unlimited posts</li>
      <li>Google Jobs syndication from day one — candidates find you via Google</li>
      <li>AI match scores on every applicant — skip manual CV sifting</li>
      <li>No agency commission (unlike Hays at 15–20%)</li>
    </ul>
    <p>Unlike ${board === "Reed" ? "Reed at £100+ per listing" : board === "Hays" ? "Hays at 15–20% placement fees" : "Indeed PPC at £400+/month"}, you keep every hire for one flat fee.</p>
    <p>Founding employer rate — no cap on signups. Happy to set you up this week.</p>
    <p><a href="https://recruitmentsite.co.uk/pricing">Claim founding rate →</a></p>
    <p>— Recruitment Site<br><a href="https://recruitmentsite.co.uk/unsubscribe?email=${encodeURIComponent(p.email)}">Unsubscribe</a></p>
    ${emailLegalFooterHtml()}
  `,
  };
};

async function main() {
  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  const resendKey = process.env.RESEND_API_KEY;
  const supabase = getSupabaseAdmin();
  const dryRun = !resendKey;

  console.log(`Recruitment Site employer outreach — ${prospects.length} prospects`);
  if (dryRun) console.log("⚠  Dry run (set RESEND_API_KEY to send)\n");

  const limit = Number(process.env.OUTREACH_LIMIT ?? 0);
  const includeGuessed = process.env.OUTREACH_INCLUDE_GUESSED === "1";

  const ready = prospects
    .filter((p) => {
      if (!p.email) return false;
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
          campaign_id: "employer-outreach-v1",
          event_type: "sent",
          metadata: { company: p.companyName },
        });
      }
    }
  }

  console.log(`\n✓ ${sent} emails ${dryRun ? "prepared" : "sent"}`);
  console.log("Target: 200/week → 4–10 new employers at 2–5% conversion");
}

main().catch(console.error);
