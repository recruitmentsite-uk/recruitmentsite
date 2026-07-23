import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, city, vertical, keywords } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.log(`[demo] Job alert: ${email} city=${city} vertical=${vertical}`);
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const { error } = await supabase.from("job_alerts").insert({
      email,
      city: city || null,
      vertical: vertical || null,
      keywords: keywords || null,
      frequency: "daily",
      active: true,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
