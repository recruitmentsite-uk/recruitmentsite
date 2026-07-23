import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Vertical } from "@placeuk/shared";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function POST(request: Request) {
  try {
    const { email, password, companyName, vertical, inviteToken } = await request.json();

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
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
    }

    const userId = authData.user.id;

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

      return NextResponse.json({ success: true, employerId: invite.employer_id });
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

    return NextResponse.json({ success: true, employerId: employer.id });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
