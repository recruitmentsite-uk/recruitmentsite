#!/usr/bin/env node
/**
 * Expire jobs past expires_at and optionally nudge employers to renew.
 */
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { appendEmailLegalFooter, EMAIL_FROM } from "@placeuk/shared";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";

async function notifyEmployer(email, titles) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !email) return;

  const list = titles.map((t) => `• ${t}`).join("\n");
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: email,
      subject: `Your job listing${titles.length === 1 ? " has" : "s have"} expired`,
      text: appendEmailLegalFooter(
        `The following role${titles.length === 1 ? " has" : "s have"} expired and is no longer visible to candidates:\n\n${list}\n\nRenew from your dashboard: ${SITE_URL}/dashboard/jobs`,
      ),
    }),
  }).catch(() => null);
}

async function main() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log("⚠  Supabase not configured — expire jobs stub");
    return;
  }

  const { data: expiring } = await supabase
    .from("jobs")
    .select("id, title, employer_id, employers(contact_email, company_name)")
    .eq("status", "active")
    .lt("expires_at", new Date().toISOString())
    .limit(200);

  const { error } = await supabase.rpc("expire_old_jobs");
  if (error) {
    // Fallback if RPC missing
    console.warn("expire_old_jobs RPC failed, using update:", error.message);
    await supabase
      .from("jobs")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString());
  }

  const byEmployer = new Map();
  for (const job of expiring ?? []) {
    const emp = Array.isArray(job.employers) ? job.employers[0] : job.employers;
    const email = emp?.contact_email;
    if (!email) continue;
    if (!byEmployer.has(email)) byEmployer.set(email, []);
    byEmployer.get(email).push(job.title);
  }

  for (const [email, titles] of byEmployer) {
    await notifyEmployer(email, titles);
  }

  console.log(
    `✓ Expired ${(expiring ?? []).length} job(s); notified ${byEmployer.size} employer(s)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
