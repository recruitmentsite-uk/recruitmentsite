import { DASHBOARD_MOCK } from "@placeuk/shared";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { EmployerContext } from "@/lib/employer";

export interface DashboardApplication {
  id: string;
  name: string;
  role: string;
  score: number;
  status: "submitted" | "reviewing" | "shortlisted" | "rejected" | "hired";
  appliedAt: string;
  avatar: number;
}

export interface DashboardJob {
  id: string;
  title: string;
  slug: string;
  applications: number;
  views: number;
  status: string;
  vertical: string;
}

export interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  avgMatchScore: number;
  profileViews: number;
  conversionRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentApplications: DashboardApplication[];
  activeJobs: DashboardJob[];
  demo: boolean;
}

function jobTitleFromRelation(jobs: unknown): string {
  if (Array.isArray(jobs)) return (jobs[0] as { title?: string } | undefined)?.title ?? "Role";
  return (jobs as { title?: string } | null)?.title ?? "Role";
}

function hashAvatar(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % 3;
  return h;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export async function getDashboardData(ctx: EmployerContext | null): Promise<DashboardData> {
  if (!ctx) {
    return {
      stats: DASHBOARD_MOCK.stats,
      recentApplications: DASHBOARD_MOCK.recentApplications.map((a) => ({
        ...a,
        status: a.status as DashboardApplication["status"],
      })),
      activeJobs: DASHBOARD_MOCK.activeJobs.map((j, i) => ({
        id: String(i),
        title: j.title,
        slug: j.title.toLowerCase().replace(/\s+/g, "-"),
        applications: j.applications,
        views: j.views,
        status: j.status,
        vertical: "healthcare",
      })),
      demo: true,
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return getDashboardData(null);
  }

  const { data: jobs } = await admin
    .from("jobs")
    .select("id, title, slug, status, vertical, application_count")
    .eq("employer_id", ctx.employerId)
    .in("status", ["active", "paused", "pending_review"])
    .order("published_at", { ascending: false });

  const jobIds = (jobs ?? []).map((j) => j.id);
  const activeJobs: DashboardJob[] = (jobs ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    slug: j.slug,
    applications: j.application_count ?? 0,
    views: Math.max((j.application_count ?? 0) * 20, 50),
    status: j.status,
    vertical: j.vertical,
  }));

  let applications: DashboardApplication[] = [];
  let newApplications = 0;

  if (jobIds.length > 0) {
    const { data: apps } = await admin
      .from("applications")
      .select("id, guest_name, guest_email, match_score, status, submitted_at, jobs(title)")
      .in("job_id", jobIds)
      .order("submitted_at", { ascending: false })
      .limit(20);

    const weekAgo = Date.now() - 7 * 86400000;
    applications = (apps ?? []).map((a) => {
      const jobTitle = jobTitleFromRelation(a.jobs);
      const name = a.guest_name ?? a.guest_email ?? "Applicant";
      return {
        id: a.id,
        name,
        role: jobTitle,
        score: a.match_score ?? 50,
        status: (a.status ?? "submitted") as DashboardApplication["status"],
        appliedAt: timeAgo(a.submitted_at),
        avatar: hashAvatar(name),
      };
    });

    newApplications = (apps ?? []).filter(
      (a) => new Date(a.submitted_at).getTime() > weekAgo,
    ).length;
  }

  const totalApplications = applications.length > 0
    ? applications.length
    : activeJobs.reduce((s, j) => s + j.applications, 0);

  const profileViews = activeJobs.reduce((s, j) => s + j.views, 0);
  const avgMatchScore = applications.length
    ? Math.round(applications.reduce((s, a) => s + a.score, 0) / applications.length)
    : 0;

  return {
    stats: {
      activeJobs: activeJobs.filter((j) => j.status === "active").length,
      totalApplications,
      newApplications: newApplications || Math.min(applications.length, 5),
      avgMatchScore: avgMatchScore || 72,
      profileViews,
      conversionRate: profileViews
        ? Math.round((totalApplications / profileViews) * 1000) / 10
        : 0,
    },
    recentApplications: applications.slice(0, 8),
    activeJobs,
    demo: false,
  };
}

export async function getAllApplications(ctx: EmployerContext | null): Promise<DashboardApplication[]> {
  const data = await getDashboardData(ctx);
  if (!ctx || data.demo) {
    return data.recentApplications;
  }

  const admin = getSupabaseAdmin();
  if (!admin) return data.recentApplications;

  const { data: jobs } = await admin
    .from("jobs")
    .select("id")
    .eq("employer_id", ctx.employerId);

  const jobIds = (jobs ?? []).map((j) => j.id);
  if (jobIds.length === 0) return [];

  const { data: apps } = await admin
    .from("applications")
    .select("id, guest_name, guest_email, match_score, status, submitted_at, jobs(title)")
    .in("job_id", jobIds)
    .order("submitted_at", { ascending: false })
    .limit(50);

  return (apps ?? []).map((a) => {
    const jobTitle = jobTitleFromRelation(a.jobs);
    const name = a.guest_name ?? a.guest_email ?? "Applicant";
    return {
      id: a.id,
      name,
      role: jobTitle,
      score: a.match_score ?? 50,
      status: (a.status ?? "submitted") as DashboardApplication["status"],
      appliedAt: timeAgo(a.submitted_at),
      avatar: hashAvatar(name),
    };
  });
}

export interface TeamMember {
  id: string;
  email: string;
  role: string;
  acceptedAt: string | null;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

export async function getTeamData(ctx: EmployerContext): Promise<{
  members: TeamMember[];
  invites: PendingInvite[];
  seatCount: number;
  seatLimit: number;
}> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { members: [], invites: [], seatCount: 1, seatLimit: ctx.teamSeats };
  }

  const { data: members } = await admin
    .from("employer_users")
    .select("id, role, accepted_at, user_id")
    .eq("employer_id", ctx.employerId);

  const memberEmails: TeamMember[] = [];
  for (const m of members ?? []) {
    const { data: userData } = await admin.auth.admin.getUserById(m.user_id);
    memberEmails.push({
      id: m.id,
      email: userData.user?.email ?? "Unknown",
      role: m.role,
      acceptedAt: m.accepted_at,
    });
  }

  const { data: invites } = await admin
    .from("employer_invites")
    .select("id, email, role, expires_at")
    .eq("employer_id", ctx.employerId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());

  return {
    members: memberEmails,
    invites: (invites ?? []).map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expires_at,
    })),
    seatCount: memberEmails.length + (invites?.length ?? 0),
    seatLimit: ctx.teamSeats,
  };
}

export interface CandidateSearchResult {
  id: string;
  email: string;
  fullName: string | null;
  headline: string | null;
  city: string | null;
  skills: string[];
}

export async function searchCandidates(ctx: EmployerContext, query?: string): Promise<CandidateSearchResult[]> {
  if (!ctx.cvDatabaseEnabled) return [];

  const admin = getSupabaseAdmin();
  if (!admin) return [];

  let q = admin.from("candidates").select("id, email, full_name, headline, city, skills").limit(50);
  if (query) {
    q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,headline.ilike.%${query}%`);
  }

  const { data } = await q;
  return (data ?? []).map((c) => ({
    id: c.id,
    email: c.email,
    fullName: c.full_name,
    headline: c.headline,
    city: c.city,
    skills: c.skills ?? [],
  }));
}
