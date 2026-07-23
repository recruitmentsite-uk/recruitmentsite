import Link from "next/link";
import Image from "next/image";
import { UNSPLASH, PRICING_PLANS, formatGbp } from "@placeuk/shared";
import {
  DashboardHeader,
  StatCard,
  MatchScoreBadge,
} from "@/components/DashboardShell";
import { CompetitorComparison } from "@/components/CompetitorComparison";
import { getEmployerContext } from "@/lib/employer";
import { getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Dashboard Overview" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; onboarding?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getEmployerContext();
  const { stats, recentApplications, activeJobs, demo } = await getDashboardData(ctx);

  return (
    <>
      <DashboardHeader
        title="Overview"
        subtitle="Your hiring command centre — everything Reed offers, without the agency fees."
      />

      {demo && (
        <div className="mx-8 mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Demo data shown.{" "}
          <Link href="/signup" className="font-semibold underline">Create an account</Link>{" "}
          or connect Supabase to see live applications.
        </div>
      )}

      {params.onboarding === "complete" && (
        <div className="mx-8 mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-brand">
          Setup complete! Post a job to start receiving AI-scored applications, or explore your{" "}
          <Link href="/dashboard/careers" className="font-semibold underline">branded careers page</Link>.
        </div>
      )}

      <div className="p-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl h-48">
          <Image
            src={UNSPLASH.sections.dashboard}
            alt="Analytics dashboard"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand/90 to-teal-800/70 flex items-center px-8">
            <div>
              <p className="text-teal-100 text-sm font-medium">This week</p>
              <p className="text-3xl font-bold text-white">{stats.newApplications} new applications</p>
              <p className="text-teal-100 text-sm mt-1">Avg AI match score: {stats.avgMatchScore}/100</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active jobs" value={stats.activeJobs} change="+1 this week" icon="💼" />
          <StatCard label="Total applications" value={stats.totalApplications} change="+18 this week" icon="📥" />
          <StatCard label="Profile views" value={stats.profileViews.toLocaleString()} change="+12% vs last week" icon="👁" />
          <StatCard label="Apply conversion" value={`${stats.conversionRate}%`} change="Above industry avg" icon="📈" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">Application inbox</h2>
                <p className="text-xs text-slate-400">AI-scored — a feature Reed & Indeed don&apos;t offer at this price</p>
              </div>
              <Link href="/dashboard/applications" className="text-sm font-semibold text-brand hover:underline">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentApplications.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">No applications yet — post a job to get started.</p>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                    <Image
                      src={UNSPLASH.avatars[app.avatar]}
                      alt={app.name}
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{app.name}</p>
                      <p className="text-sm text-slate-500 truncate">{app.role}</p>
                    </div>
                    <MatchScoreBadge score={app.score} />
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      app.status === "shortlisted" ? "bg-teal-100 text-teal-800" :
                      app.status === "rejected" ? "bg-slate-100 text-slate-500" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">{app.appliedAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">Your jobs</h2>
              <Link href="/dashboard/jobs/new" className="text-sm font-semibold text-brand hover:underline">
                + New
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.status === "active" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>{job.applications} applications</span>
                    <span>{job.views} views</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-brand"
                      style={{ width: `${Math.min(100, (job.applications / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-bold text-slate-900">How Recruitment Site compares</h2>
          <p className="mt-1 text-sm text-slate-500 mb-6">
            Features you get on Growth ({formatGbp(PRICING_PLANS[1].priceMonthly)}/mo) vs what competitors charge extra for.
          </p>
          <CompetitorComparison />
        </section>
      </div>
    </>
  );
}
