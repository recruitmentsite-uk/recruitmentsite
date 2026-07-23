import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) return null;

  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ pendingJobs: [], recentApplications: [] });
  }

  const { data: pendingJobs } = await admin
    .from("jobs")
    .select("id, title, city, vertical, created_at, employers(company_name)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentApplications } = await admin
    .from("applications")
    .select("id, guest_name, guest_email, match_score, status, submitted_at, jobs(title)")
    .order("submitted_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ pendingJobs: pendingJobs ?? [], recentApplications: recentApplications ?? [] });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, jobId } = await request.json();
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ success: true, mode: "demo" });
  }

  if (action === "approve" && jobId) {
    await admin
      .from("jobs")
      .update({ status: "active", published_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("status", "pending_review");
  } else if (action === "reject" && jobId) {
    await admin.from("jobs").update({ status: "expired" }).eq("id", jobId);
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
