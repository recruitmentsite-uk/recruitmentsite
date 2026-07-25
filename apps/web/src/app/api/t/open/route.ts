import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/** 1×1 tracking pixel for campaign open events */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const campaign = (url.searchParams.get("c") || "employer-outreach-v1").slice(0, 80);

  const supabase = getSupabaseAdmin();
  if (supabase && email.includes("@")) {
    await supabase.from("campaign_events").insert({
      prospect_email: email,
      campaign_id: campaign,
      event_type: "opened",
      metadata: { ua: request.headers.get("user-agent")?.slice(0, 120) ?? null },
    });
  }

  const gif = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
  return new NextResponse(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
