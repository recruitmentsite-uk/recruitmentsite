"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminShell";

interface PendingJob {
  id: string;
  title: string;
  city: string;
  vertical: string;
  created_at: string;
  employers: { company_name: string } | { company_name: string }[];
}

export default function AdminModerationPage() {
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/moderation");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPendingJobs(data.pendingJobs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function moderate(action: "approve" | "reject", jobId: string) {
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, jobId }),
    });
    await load();
  }

  return (
    <div>
      <AdminHeader
        title="Job moderation"
        subtitle="Approve or reject listings awaiting review"
      />
      <div className="px-6 md:px-8 py-8 max-w-4xl">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : pendingJobs.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs awaiting review.</p>
        ) : (
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-900">
              Pending review ({pendingJobs.length})
            </h2>
            {pendingJobs.map((job) => {
              const emp = job.employers;
              const company = Array.isArray(emp)
                ? emp[0]?.company_name
                : emp?.company_name;
              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">
                      {company} · {job.city} · {job.vertical}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moderate("approve", job.id)}
                      className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => moderate("reject", job.id)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
