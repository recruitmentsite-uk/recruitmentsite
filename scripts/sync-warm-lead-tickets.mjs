#!/usr/bin/env node
/**
 * Turn employer-outreach opens/clicks into support tickets and offer
 * the first N warm leads: skip trial — £99 month 1 (Growth).
 */
import { pathToFileURL } from "node:url";
import { getSupabaseAdmin } from "./lib/supabase-admin.mjs";
import { EMAIL_FROM_HELLO, buildBrandedEmailHtml } from "@placeuk/shared";

const CAMPAIGN_ID = "employer-outreach-v1";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk";
const OFFER_LIMIT = Number(process.env.WARM_LEAD_OFFER_LIMIT ?? 20);
const SEND_OFFERS = process.env.WARM_LEAD_SEND_EMAIL === "1";

function offerUrl(email) {
  const u = new URL("/pricing", SITE);
  u.searchParams.set("offer", "warm99");
  u.searchParams.set("email", email);
  return u.toString();
}

async function main() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log("⚠  Supabase not configured — skip warm-lead sync");
    return;
  }

  const { data: events, error } = await supabase
    .from("campaign_events")
    .select("prospect_email, event_type, created_at, metadata")
    .eq("campaign_id", CAMPAIGN_ID)
    .in("event_type", ["opened", "clicked"])
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) {
    console.error("Failed to load campaign events:", error.message);
    process.exit(1);
  }

  const byEmail = new Map();
  for (const row of events ?? []) {
    const email = String(row.prospect_email || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) continue;
    const cur = byEmail.get(email) || {
      email,
      opened: false,
      clicked: false,
      lastAt: row.created_at,
      company: row.metadata?.company || null,
    };
    if (row.event_type === "opened") cur.opened = true;
    if (row.event_type === "clicked") cur.clicked = true;
    if (!cur.company && row.metadata?.company) cur.company = row.metadata.company;
    byEmail.set(email, cur);
  }

  const warm = [...byEmail.values()].sort((a, b) => {
    if (a.clicked !== b.clicked) return a.clicked ? -1 : 1;
    return 0;
  });

  const { data: offeredRows } = await supabase
    .from("campaign_events")
    .select("prospect_email")
    .eq("campaign_id", CAMPAIGN_ID)
    .eq("event_type", "warm99_offered")
    .limit(500);

  const alreadyOffered = new Set(
    (offeredRows ?? []).map((r) => String(r.prospect_email || "").toLowerCase()),
  );
  let offersRemaining = Math.max(0, OFFER_LIMIT - alreadyOffered.size);

  let ticketsCreated = 0;
  let ticketsSkipped = 0;
  let offersSent = 0;
  const resendKey = process.env.RESEND_API_KEY;

  for (const lead of warm) {
    const externalRef = `warm-lead:${CAMPAIGN_ID}:${lead.email}`;
    const { data: existing } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("external_ref", externalRef)
      .maybeSingle();

    const link = offerUrl(lead.email);
    const signal = lead.clicked ? "clicked pricing" : "opened email";
    const body = [
      `Warm outreach lead (${signal}).`,
      lead.company ? `Company: ${lead.company}` : null,
      `Offer link (first ${OFFER_LIMIT}): ${link}`,
      "Action: personal follow-up → get them to list a role today.",
      "Offer: skip trial — £99 for month 1 on Growth, then standard £249/mo.",
    ]
      .filter(Boolean)
      .join("\n");

    if (existing?.id) {
      ticketsSkipped += 1;
    } else {
      const { data: ticket, error: insertErr } = await supabase
        .from("support_tickets")
        .insert({
          subject: `Warm lead: ${lead.company || lead.email} (${signal})`,
          body,
          status: "open",
          priority: lead.clicked ? "high" : "normal",
          channel: "internal",
          requester_email: lead.email,
          requester_name: lead.company || null,
          assignee_email: "admin@recruitmentsite.co.uk",
          external_ref: externalRef,
          tags: ["warm-lead", "outreach", "auto", lead.clicked ? "clicked" : "opened"],
        })
        .select("id")
        .single();

      if (insertErr) {
        console.warn(`Ticket insert failed for ${lead.email}: ${insertErr.message}`);
      } else {
        ticketsCreated += 1;
        await supabase.from("support_ticket_messages").insert({
          ticket_id: ticket.id,
          author_email: "system@recruitmentsite.co.uk",
          body,
          is_internal: true,
        });
      }
    }

    if (
      SEND_OFFERS &&
      resendKey &&
      offersRemaining > 0 &&
      !alreadyOffered.has(lead.email)
    ) {
      const html = buildBrandedEmailHtml({
        title: "Skip the trial — £99 month 1",
        preheader: "Post unlimited roles this month for £99",
        bodyHtml: `
          <p style="margin:0 0 14px">Hi${lead.company ? ` ${escapeHtml(lead.company)} team` : ""},</p>
          <p style="margin:0 0 14px">You checked out Recruitment Site after our note — thanks.</p>
          <p style="margin:0 0 14px">For the next <strong>${offersRemaining}</strong> founding employers this month:</p>
          <ul style="margin:0 0 16px;padding-left:20px;color:#334155">
            <li style="margin-bottom:8px"><strong>£99 for month 1</strong> (Growth — normally £249)</li>
            <li style="margin-bottom:8px"><strong>No 30-day trial wait</strong> — card charged, jobs go live today</li>
            <li style="margin-bottom:8px">Unlimited posts · AI match · Google Jobs</li>
          </ul>
          <p style="margin:0 0 14px">After month 1, standard Growth is £249/mo (cancel anytime).</p>
        `,
        ctaLabel: "Claim £99 month 1 →",
        ctaUrl: link,
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
          to: lead.email,
          subject: "Skip the trial — £99 month 1 on Recruitment Site",
          html,
        }),
      });

      if (res.ok) {
        offersSent += 1;
        offersRemaining -= 1;
        alreadyOffered.add(lead.email);
        await supabase.from("campaign_events").insert({
          prospect_email: lead.email,
          campaign_id: CAMPAIGN_ID,
          event_type: "warm99_offered",
          metadata: { company: lead.company, offer: "warm99" },
        });
      } else {
        const err = await res.text().catch(() => "");
        console.warn(`Offer email failed ${lead.email}: ${res.status} ${err.slice(0, 120)}`);
      }
    }
  }

  console.log(
    JSON.stringify({
      warmLeads: warm.length,
      ticketsCreated,
      ticketsSkipped,
      offersSent,
      offersRemaining,
      offerLimit: OFFER_LIMIT,
      sendOffers: SEND_OFFERS,
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

const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { main as syncWarmLeadTickets };
