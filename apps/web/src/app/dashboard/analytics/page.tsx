import Image from "next/image";
import { UNSPLASH } from "@placeuk/shared";
import { DashboardHeader, StatCard } from "@/components/DashboardShell";
import { getEmployerContext } from "@/lib/employer";
import { getAnalyticsSeries, getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const ctx = await getEmployerContext();
  const { stats } = await getDashboardData(ctx);
  const { weekly, sources, demo } = await getAnalyticsSeries(ctx);

  const maxViews = Math.max(1, ...weekly.map((d) => d.views));

  return (
    <>
      <DashboardHeader
        title="Analytics"
        subtitle={
          demo
            ? "Sign in to see live views and applications for your jobs."
            : "Live views and applications for your jobs."
        }
      />
      <div className="p-8">
        <div className="grid gap-5 sm:grid-cols-3 mb-8">
          <StatCard
            label="Total views"
            value={stats.profileViews.toLocaleString()}
            change={demo ? "Demo data" : "All-time job page views"}
            icon="👁"
          />
          <StatCard
            label="Applications (30d)"
            value={stats.totalApplications}
            change={demo ? "Demo data" : `${stats.newApplications} in the last 7 days`}
            icon="📥"
          />
          <StatCard
            label="Conversion rate"
            value={stats.profileViews ? `${stats.conversionRate}%` : "—"}
            change="Applications ÷ views"
            icon="📈"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Activity this week</h2>
            <div className="mt-6 flex items-end gap-2 h-40">
              {weekly.map((d, i) => (
                <div key={`${d.day}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-brand/80 hover:bg-brand transition-colors min-h-[4px]"
                    style={{ height: `${Math.max(4, (d.views / maxViews) * 100)}%` }}
                    title={`${d.views} views · ${d.apps} apps`}
                  />
                  <span className="text-xs text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Bars show page views; hover for application counts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Applications by source</h2>
            <div className="mt-6 space-y-4">
              {sources.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No attributed applications yet. Sources appear when candidates apply via
                  Google Jobs, Indeed, alerts, or your careers page.
                </p>
              ) : (
                sources.map((s) => (
                  <div key={s.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{s.source}</span>
                      <span className="font-medium text-slate-900">{s.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 relative overflow-hidden rounded-2xl">
          <Image
            src={UNSPLASH.sections.laptop}
            alt="Analytics"
            width={1200}
            height={300}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center px-8">
            <div className="text-white max-w-md">
              <p className="font-bold text-lg">Included on Growth — no extra charge</p>
              <p className="text-slate-300 text-sm mt-1">
                Views, applies and source breakdown included on Growth — so you can see what is working.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
