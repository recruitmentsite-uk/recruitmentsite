import Image from "next/image";
import { UNSPLASH } from "@placeuk/shared";
import { DashboardHeader, StatCard } from "@/components/DashboardShell";
import { getEmployerContext } from "@/lib/employer";
import { getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const ctx = await getEmployerContext();
  const { stats } = await getDashboardData(ctx);

  const weeklyData = [
    { day: "Mon", views: 420, apps: 8 },
    { day: "Tue", views: 380, apps: 12 },
    { day: "Wed", views: 510, apps: 15 },
    { day: "Thu", views: 490, apps: 11 },
    { day: "Fri", views: 340, apps: 6 },
    { day: "Sat", views: 180, apps: 3 },
    { day: "Sun", views: 220, apps: 4 },
  ];
  const maxViews = Math.max(...weeklyData.map((d) => d.views));

  return (
    <>
      <DashboardHeader title="Analytics" subtitle="Track performance — data Reed only shows on premium tiers." />
      <div className="p-8">
        <div className="grid gap-5 sm:grid-cols-3 mb-8">
          <StatCard label="Total views (30d)" value={stats.profileViews.toLocaleString()} change="+12% vs last month" icon="👁" />
          <StatCard label="Applications (30d)" value={stats.totalApplications} change="+23% vs last month" icon="📥" />
          <StatCard label="Cost per application" value={stats.totalApplications ? `£${(249 / stats.totalApplications).toFixed(2)}` : "—"} change="vs £8+ on Indeed PPC" icon="💰" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Views this week</h2>
            <div className="mt-6 flex items-end gap-2 h-40">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-brand/80 hover:bg-brand transition-colors"
                    style={{ height: `${(d.views / maxViews) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Applications by source</h2>
            <div className="mt-6 space-y-4">
              {[
                { source: "Google Jobs", pct: 42, color: "bg-blue-500" },
                { source: "Indeed feed", pct: 22, color: "bg-indigo-500" },
                { source: "Recruitment Site direct", pct: 21, color: "bg-brand" },
                { source: "Job alerts", pct: 15, color: "bg-teal-400" },
              ].map((s) => (
                <div key={s.source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{s.source}</span>
                    <span className="font-medium text-slate-900">{s.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 relative overflow-hidden rounded-2xl">
          <Image src={UNSPLASH.sections.laptop} alt="Analytics" width={1200} height={300} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center px-8">
            <div className="text-white max-w-md">
              <p className="font-bold text-lg">Included on Growth — no extra charge</p>
              <p className="text-slate-300 text-sm mt-1">Indeed charges for analytics. Reed hides data behind premium. Recruitment Site includes it standard.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
