"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { UNSPLASH } from "@placeuk/shared";
import { MatchScoreBadge } from "@/components/DashboardShell";
import type { DashboardApplication } from "@/lib/dashboard-data";

const FILTERS = ["All", "Shortlisted", "Reviewing", "New", "Rejected"] as const;

interface ApplicationsInboxProps {
  applications: DashboardApplication[];
}

export function ApplicationsInbox({ applications }: ApplicationsInboxProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [statuses, setStatuses] = useState<Record<string, DashboardApplication["status"]>>(
    Object.fromEntries(applications.map((a) => [a.id, a.status])),
  );

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const status = statuses[app.id] ?? app.status;
      if (filter === "All") return true;
      if (filter === "New") return status === "submitted";
      return status === filter.toLowerCase();
    });
  }, [filter, statuses, applications]);

  async function cycleStatus(id: string) {
    const order: DashboardApplication["status"][] = ["submitted", "reviewing", "shortlisted", "rejected"];
    const current = statuses[id] ?? "submitted";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setStatuses((prev) => ({ ...prev, [id]: next }));

    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f ? "bg-brand text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span className="w-10" />
          <span>Candidate</span>
          <span>AI Score</span>
          <span>Status</span>
          <span>Applied</span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No applications in this filter.</p>
        ) : (
          filtered.map((app) => {
            const status = statuses[app.id] ?? app.status;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => cycleStatus(app.id)}
                className="grid w-full grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center border-b border-slate-50 px-5 py-4 hover:bg-teal-50/30 transition-colors text-left"
              >
                <Image
                  src={UNSPLASH.avatars[app.avatar]}
                  alt={app.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900">{app.name}</p>
                  <p className="text-sm text-slate-500">{app.role}</p>
                </div>
                <MatchScoreBadge score={app.score} />
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                  status === "shortlisted" ? "bg-teal-100 text-teal-800" :
                  status === "rejected" ? "bg-slate-100 text-slate-500" :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {status}
                </span>
                <span className="text-xs text-slate-400">{app.appliedAt}</span>
              </button>
            );
          })
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400">Click a row to cycle status — saved to your inbox automatically.</p>
    </>
  );
}
