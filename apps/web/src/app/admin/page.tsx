"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const connected = stats
    ? Object.entries(stats.socialConnected).filter(([, v]) => v).map(([k]) => k)
    : [];

  return (
    <div>
      <AdminHeader
        title="Overview"
        subtitle="Platform ops hub — tickets, stats, and social publishing"
      />
      <div className="px-6 md:px-8 py-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active jobs" value={stats?.activeJobs ?? "—"} icon="💼" />
          <StatCard label="Employers" value={stats?.employers ?? "—"} icon="🏢" />
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
          <StatCard
            label="Open tickets"
            value={stats?.openTickets ?? "—"}
            change="Support queue"
            icon="🎫"
          />
          <StatCard
            label="Pending job review"
            value={stats?.pendingReview ?? "—"}
            icon="⏳"
          />
          <StatCard
            label="Social queue"
            value={stats?.socialQueued ?? "—"}
            change={`${stats?.socialPublished ?? 0} published`}
            icon="📣"
          />
          <StatCard
            label="API channels ready"
            value={connected.length}
            change={connected.length ? connected.join(", ") : "Add Meta / LinkedIn tokens"}
            icon="🔗"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/tickets"
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400 transition-colors"
          >
            <p className="font-semibold text-slate-900">Tickets</p>
            <p className="mt-1 text-sm text-slate-500">
              Track CS / partner / internal work and replies.
            </p>
          </Link>
          <Link
            href="/admin/social"
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400 transition-colors"
          >
            <p className="font-semibold text-slate-900">Social CMS</p>
            <p className="mt-1 text-sm text-slate-500">
              Compose, library, queue, and publish via API.
            </p>
          </Link>
          <Link
            href="/admin/stats"
            className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-400 transition-colors"
          >
            <p className="font-semibold text-slate-900">Full stats</p>
            <p className="mt-1 text-sm text-slate-500">
              Live product metrics and connection health.
            </p>
          </Link>
        </div>

        {stats && !stats.configured && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            Supabase service role not configured locally — stats show zeros until env is set.
            Run migration <code className="text-xs">011_super_admin.sql</code> in Supabase.
          </p>
        )}
      </div>
    </div>
  );
}
