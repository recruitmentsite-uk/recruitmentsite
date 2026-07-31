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
    .select("id, title, slug, status, vertical, application_count, view_count")
    .eq("employer_id", ctx.employerId)
    .in("status", ["active", "paused", "pending_review"])
    .order("published_at", { ascending: false });

  const jobIds = (jobs ?? []).map((j) => j.id);
  const activeJobs: DashboardJob[] = (jobs ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    slug: j.slug,
    applications: j.application_count ?? 0,
    views: j.view_count ?? 0,
    status: j.status,
    vertical: j.vertical,
  }));

  let applications: DashboardApplication[] = [];
  let newApplications = 0;
  let totalApplications = 0;
  let avgMatchScore = 0;

  if (jobIds.length > 0) {
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: apps } = await admin
      .from("applications")
      .select("id, guest_name, guest_email, match_score, status, submitted_at, jobs(title)")
      .in("job_id", jobIds)
      .order("submitted_at", { ascending: false })
      .limit(50);

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

    const { count } = await admin
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("job_id", jobIds)
      .gte("submitted_at", monthAgo);

    totalApplications = count ?? applications.length;

    const scored = (apps ?? []).filter((a) => a.match_score != null);
    avgMatchScore = scored.length
      ? Math.round(scored.reduce((s, a) => s + (a.match_score ?? 0), 0) / scored.length)
      : 0;
  }

  const profileViews = activeJobs.reduce((s, j) => s + j.views, 0);

  return {
    stats: {
      activeJobs: activeJobs.filter((j) => j.status === "active").length,
      totalApplications,
      newApplications,
      avgMatchScore,
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

export interface AnalyticsPoint {
  day: string;
  views: number;
  apps: number;
}

export interface SourceBreakdown {
  source: string;
  pct: number;
  color: string;
}

const SOURCE_COLORS: Record<string, string> = {
  "Google Jobs": "bg-blue-500",
  "Indeed feed": "bg-indigo-500",
  "Recruitment Site direct": "bg-brand",
  "Job alerts": "bg-teal-400",
  Careers: "bg-cyan-500",
  Other: "bg-slate-400",
};

function labelSource(raw: string | null | undefined): string {
  const s = (raw || "direct").toLowerCase();
  if (s.includes("google")) return "Google Jobs";
  if (s.includes("indeed")) return "Indeed feed";
  if (s.includes("alert")) return "Job alerts";
  if (s.includes("career")) return "Careers";
  if (s === "direct" || s === "organic") return "Recruitment Site direct";
  return "Other";
}

export async function getAnalyticsSeries(ctx: EmployerContext | null): Promise<{
  weekly: AnalyticsPoint[];
  sources: SourceBreakdown[];
  demo: boolean;
}> {
  if (!ctx) {
    return {
      weekly: [
        { day: "Mon", views: 0, apps: 0 },
        { day: "Tue", views: 0, apps: 0 },
        { day: "Wed", views: 0, apps: 0 },
        { day: "Thu", views: 0, apps: 0 },
        { day: "Fri", views: 0, apps: 0 },
        { day: "Sat", views: 0, apps: 0 },
        { day: "Sun", views: 0, apps: 0 },
      ],
      sources: [],
      demo: true,
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) return getAnalyticsSeries(null);

  const { data: jobs } = await admin
    .from("jobs")
    .select("id")
    .eq("employer_id", ctx.employerId);
  const jobIds = (jobs ?? []).map((j) => j.id);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyMap = new Map<string, AnalyticsPoint>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    weeklyMap.set(key, { day: days[d.getDay()]!, views: 0, apps: 0 });
  }

  if (jobIds.length === 0) {
    return { weekly: [...weeklyMap.values()], sources: [], demo: false };
  }

  const weekAgoIso = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: events } = await admin
    .from("job_events")
    .select("event_type, created_at")
    .in("job_id", jobIds)
    .gte("created_at", weekAgoIso)
    .limit(5000);

  for (const ev of events ?? []) {
    const key = new Date(ev.created_at).toISOString().slice(0, 10);
    const point = weeklyMap.get(key);
    if (!point) continue;
    if (ev.event_type === "view") point.views += 1;
    if (ev.event_type === "apply") point.apps += 1;
  }

  const { data: apps } = await admin
    .from("applications")
    .select("source, submitted_at")
    .in("job_id", jobIds)
    .gte("submitted_at", weekAgoIso)
    .limit(2000);

  // Prefer application rows for apps if job_events apply not yet populated
  const hasApplyEvents = (events ?? []).some((e) => e.event_type === "apply");
  if (!hasApplyEvents) {
    for (const point of weeklyMap.values()) point.apps = 0;
    for (const a of apps ?? []) {
      const key = new Date(a.submitted_at).toISOString().slice(0, 10);
      const point = weeklyMap.get(key);
      if (point) point.apps += 1;
    }
  }

  const counts = new Map<string, number>();
  for (const a of apps ?? []) {
    const label = labelSource(a.source);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((s, n) => s + n, 0);
  const sources: SourceBreakdown[] =
    total === 0
      ? []
      : [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([source, n]) => ({
            source,
            pct: Math.round((n / total) * 100),
            color: SOURCE_COLORS[source] ?? "bg-slate-400",
          }));

  return { weekly: [...weeklyMap.values()], sources, demo: false };
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

  let candidatesQ = admin
    .from("candidates")
    .select("id, email, full_name, headline, city, skills")
    .limit(50);
  if (query) {
    candidatesQ = candidatesQ.or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,headline.ilike.%${query}%`,
    );
  }

  let talentQ = admin
    .from("talent_profiles")
    .select("id, email, full_name, headline, city, skills")
    .eq("active", true)
    .limit(50);
  if (query) {
    talentQ = talentQ.or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,headline.ilike.%${query}%`,
    );
  }

  const [{ data: candidates }, { data: talent }] = await Promise.all([candidatesQ, talentQ]);

  const byEmail = new Map<string, CandidateSearchResult>();
  for (const c of candidates ?? []) {
    byEmail.set(c.email.toLowerCase(), {
      id: c.id,
      email: c.email,
      fullName: c.full_name,
      headline: c.headline,
      city: c.city,
      skills: c.skills ?? [],
    });
  }
  for (const c of talent ?? []) {
    const key = c.email.toLowerCase();
    if (byEmail.has(key)) continue;
    byEmail.set(key, {
      id: c.id,
      email: c.email,
      fullName: c.full_name,
      headline: c.headline,
      city: c.city,
      skills: c.skills ?? [],
    });
  }

  return [...byEmail.values()].slice(0, 50);
}
