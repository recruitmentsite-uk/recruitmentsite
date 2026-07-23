import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getPlanByTier } from "@placeuk/shared";
import { getEmployerContext } from "@/lib/employer";
import { getTeamData } from "@/lib/dashboard-data";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const ctx = await getEmployerContext();
    if (!ctx || ctx.role === "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, role = "recruiter" } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const team = await getTeamData(ctx);
    if (team.seatCount >= ctx.teamSeats) {
      return NextResponse.json(
        { error: `Seat limit reached (${ctx.teamSeats} on ${getPlanByTier(ctx.plan)?.name ?? ctx.plan} plan)` },
        { status: 400 },
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    const { error } = await admin.from("employer_invites").insert({
      employer_id: ctx.employerId,
      email: email.toLowerCase(),
      role,
      token,
      expires_at: expiresAt,
      invited_by: ctx.userId,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }

    const inviteUrl = `${getSiteUrl()}/signup?invite=${token}`;

    if (process.env.RESEND_API_KEY) {
      await sendEmail({
        to: email,
        subject: `You're invited to join ${ctx.companyName} on Recruitment Site`,
        text: `You've been invited to join ${ctx.companyName} on Recruitment Site.\n\nAccept invite: ${inviteUrl}\n\nExpires in 7 days.`,
      });
    }

    return NextResponse.json({ success: true, inviteUrl });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  const ctx = await getEmployerContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await getTeamData(ctx);
  return NextResponse.json(team);
}
