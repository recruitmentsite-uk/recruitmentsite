import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";

/** Redirect click tracker for outreach CTAs */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const campaign = (url.searchParams.get("c") || "employer-outreach-v1").slice(0, 80);
  const destRaw = url.searchParams.get("u") || "/pricing";
  const siteUrl = getSiteUrl();

  let dest: URL;
  try {
    dest = new URL(destRaw, siteUrl);
    // Only allow same-site redirects
    if (dest.origin !== new URL(siteUrl).origin && !dest.hostname.endsWith("recruitmentsite.co.uk")) {
      dest = new URL("/pricing", siteUrl);
    }
  } catch {
    dest = new URL("/pricing", siteUrl);
  }

  const supabase = getSupabaseAdmin();
  if (supabase && email.includes("@")) {
    await supabase.from("campaign_events").insert({
      prospect_email: email,
      campaign_id: campaign,
      event_type: "clicked",
      metadata: { dest: dest.pathname },
    });
  }

  return NextResponse.redirect(dest.toString(), 302);
}
