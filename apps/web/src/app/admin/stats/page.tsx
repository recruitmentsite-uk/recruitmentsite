"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminShell";
import { StatCard } from "@/components/DashboardShell";

type Stats = {
  employers: number;
  activeJobs: number;
  applicationsThisWeek: number;
  jobAlerts: number;
  estimatedMrr: number;
  pendingReview: number;
  openTickets: number;
  socialQueued: number;
  socialPublished: number;
  socialConnected: Record<string, boolean>;
  generatedAt: string;
  configured: boolean;
};

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <AdminHeader
        title="Platform stats"
        subtitle={
          stats?.generatedAt
            ? `Live snapshot · ${new Date(stats.generatedAt).toLocaleString()}`
            : "Loading live metrics…"
        }
      />
      <div className="px-6 md:px-8 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Employers" value={stats?.employers ?? "—"} icon="🏢" />
          <StatCard label="Active jobs" value={stats?.activeJobs ?? "—"} icon="💼" />
          <StatCard
            label="Applications (7d)"
            value={stats?.applicationsThisWeek ?? "—"}
            icon="📥"
          />
          <StatCard
            label="Est. MRR"
            value={stats ? `£${stats.estimatedMrr.toLocaleString()}` : "—"}
            icon="£"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Job alerts" value={stats?.jobAlerts ?? "—"} icon="🔔" />
          <StatCard label="Pending review" value={stats?.pendingReview ?? "—"} icon="⏳" />
          <StatCard label="Open tickets" value={stats?.openTickets ?? "—"} icon="🎫" />
          <StatCard
            label="Social published"
            value={stats?.socialPublished ?? "—"}
            change={`${stats?.socialQueued ?? 0} in queue`}
            icon="📣"
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Social API connections</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tokens stay in environment variables — never stored in the database.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats?.socialConnected ?? {}).map(([platform, ok]) => (
              <div
                key={platform}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
              >
                <span className="text-sm font-medium capitalize text-slate-800">
                  {platform}
                </span>
                <span
                  className={`text-xs font-semibold ${ok ? "text-teal-700" : "text-amber-700"}`}
                >
                  {ok ? "Connected" : "Not configured"}
                </span>
              </div>
            ))}
          </div>
          <ul className="mt-4 text-xs text-slate-500 space-y-1 list-disc pl-4">
            <li>Facebook / Instagram: META_PAGE_ID, META_PAGE_ACCESS_TOKEN, META_IG_USER_ID</li>
            <li>LinkedIn: LINKEDIN_ACCESS_TOKEN, LINKEDIN_ORGANIZATION_ID</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
