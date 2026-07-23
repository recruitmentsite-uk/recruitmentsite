import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, mode: "demo" });
    }

    await supabase
      .from("job_alerts")
      .update({ active: false })
      .ilike("email", email);

    await supabase.from("campaign_events").insert({
      prospect_email: email,
      campaign_id: "global",
      event_type: "unsubscribed",
      metadata: { source: "unsubscribe_page" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
