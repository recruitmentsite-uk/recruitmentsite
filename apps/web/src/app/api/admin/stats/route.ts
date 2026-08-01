import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { socialConnectionStatus } from "@/lib/social-publish";

const PLAN_PRICES: Record<string, number> = {
  starter: 99,
  growth: 249,
  scale: 499,
  payg: 0,
};

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({
      configured: false,
      employers: 0,
      activeJobs: 0,
      applicationsThisWeek: 0,
      jobAlerts: 0,
      estimatedMrr: 0,
      pendingReview: 0,
      openTickets: 0,
      socialQueued: 0,
      socialPublished: 0,
      socialConnected: socialConnectionStatus(),
      generatedAt: new Date().toISOString(),
    });
  }

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    employers,
    activeJobs,
    applications,
    alerts,
    pendingReview,
    paidEmployers,
    openTickets,
    socialQueued,
    socialPublished,
  ] = await Promise.all([
    admin.from("employers").select("*", { count: "exact", head: true }),
    admin.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin
      .from("applications")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", weekAgo),
    admin.from("job_alerts").select("*", { count: "exact", head: true }).eq("active", true),
    admin
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    admin.from("employers").select("plan").neq("plan", "starter"),
    admin
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "pending"]),
    admin
      .from("social_posts")
      .select("*", { count: "exact", head: true })
      .in("status", ["draft", "queued", "scheduled"]),
    admin
      .from("social_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  const mrr = (paidEmployers.data ?? []).reduce(
    (sum, e) => sum + (PLAN_PRICES[e.plan as string] ?? 0),
    0,
  );

  return NextResponse.json({
    configured: true,
    employers: employers.count ?? 0,
    activeJobs: activeJobs.count ?? 0,
    applicationsThisWeek: applications.count ?? 0,
    jobAlerts: alerts.count ?? 0,
    estimatedMrr: mrr,
    pendingReview: pendingReview.count ?? 0,
    openTickets: openTickets.count ?? 0,
    socialQueued: socialQueued.count ?? 0,
    socialPublished: socialPublished.count ?? 0,
    socialConnected: socialConnectionStatus(),
    generatedAt: new Date().toISOString(),
  });
}
