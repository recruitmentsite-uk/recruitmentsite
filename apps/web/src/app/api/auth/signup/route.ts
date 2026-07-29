import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Vertical } from "@placeuk/shared";
import { normalizeUkPhone } from "@/lib/sms";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      companyName,
      vertical,
      inviteToken,
      role = "employer",
      fullName,
      city,
      phone,
      smsEnabled,
    } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role === "candidate" ? "candidate" : "employer" },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
    }

    const userId = authData.user.id;

    if (role === "candidate") {
      if (!fullName) {
        return NextResponse.json({ error: "Full name required" }, { status: 400 });
      }

      const phoneE164 = phone ? normalizeUkPhone(String(phone)) : null;
      const { error: candError } = await admin.from("candidates").insert({
        id: userId,
        email: email.toLowerCase(),
        full_name: fullName,
        city: city || null,
        verticals: vertical ? [vertical] : [],
        phone_e164: phoneE164,
        sms_enabled: Boolean(smsEnabled && phoneE164),
        alert_frequency: "daily",
      });

      if (candError) {
        return NextResponse.json({ error: "Failed to create candidate profile" }, { status: 500 });
      }

      // Link existing talent pool row if they previously applied as guest
      await admin
        .from("talent_profiles")
        .update({ candidate_id: userId, active: true, updated_at: new Date().toISOString() })
        .eq("email", email.toLowerCase());

      return NextResponse.json({ success: true, role: "candidate" });
    }

    if (inviteToken) {
      const { data: invite } = await admin
        .from("employer_invites")
        .select("*")
        .eq("token", inviteToken)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (!invite) {
        return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
      }

      const { count: teamCount } = await admin
        .from("employer_users")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", invite.employer_id);

      if ((teamCount ?? 0) >= 10) {
        return NextResponse.json({ error: "Team seat limit reached" }, { status: 400 });
      }

      await admin.from("employer_users").insert({
        employer_id: invite.employer_id,
        user_id: userId,
        role: invite.role,
        invited_at: invite.created_at,
        accepted_at: new Date().toISOString(),
      });

      await admin
        .from("employer_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      return NextResponse.json({ success: true, employerId: invite.employer_id, role: "employer" });
    }

    if (!companyName) {
      return NextResponse.json({ error: "Company name required" }, { status: 400 });
    }

    const slug = `${slugify(companyName)}-${Date.now().toString(36)}`;

    const { data: employer, error: empError } = await admin
      .from("employers")
      .insert({
        company_name: companyName,
        slug,
        vertical: (vertical as Vertical) ?? "general",
        plan: "starter",
        contact_email: email,
        active_job_limit: 3,
        screening_credits: 10,
      })
      .select("id")
      .single();

    if (empError || !employer) {
      return NextResponse.json({ error: "Failed to create employer" }, { status: 500 });
    }

    await admin.from("employer_users").insert({
      employer_id: employer.id,
      user_id: userId,
      role: "owner",
      accepted_at: new Date().toISOString(),
    });

    await admin.from("screening_credit_ledger").insert({
      employer_id: employer.id,
      delta: 10,
      balance_after: 10,
      reason: "signup_bonus",
    });

    return NextResponse.json({ success: true, employerId: employer.id, role: "employer" });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
