import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { normalizeUkPhone } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit(`alert:${ip}`, 10, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { email, city, vertical, keywords, phone, smsEnabled } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (!rateLimit(`alert-email:${email.toLowerCase()}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many alert signups for this email." }, { status: 429 });
    }

    const phoneE164 = phone ? normalizeUkPhone(String(phone)) : null;
    const wantsSms = Boolean(smsEnabled && phoneE164);
    if (smsEnabled && !phoneE164) {
      return NextResponse.json({ error: "Enter a valid UK mobile for SMS alerts" }, { status: 400 });
    }

    const channel = wantsSms ? "both" : "email";
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.log(`[demo] Job alert: ${email} city=${city} vertical=${vertical} sms=${wantsSms}`);
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const { error } = await supabase.from("job_alerts").insert({
      email,
      city: city || null,
      vertical: vertical || null,
      keywords: keywords || null,
      frequency: "daily",
      active: true,
      phone_e164: phoneE164,
      sms_enabled: wantsSms,
      channel,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sms: wantsSms });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
