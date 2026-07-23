import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ demo: true });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { data: existing } = await admin
    .from("employer_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ linked: true });
  }

  const { data: employer } = await admin
    .from("employers")
    .select("id")
    .eq("contact_email", user.email)
    .maybeSingle();

  if (employer) {
    await admin.from("employer_users").insert({
      employer_id: employer.id,
      user_id: user.id,
      role: "owner",
      accepted_at: new Date().toISOString(),
    });
    return NextResponse.json({ linked: true, employerId: employer.id });
  }

  return NextResponse.json({ linked: false });
}
