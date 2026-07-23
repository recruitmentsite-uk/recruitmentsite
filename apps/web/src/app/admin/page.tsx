"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PendingJob {
  id: string;
  title: string;
  city: string;
  vertical: string;
  created_at: string;
  employers: { company_name: string } | { company_name: string }[];
}

export default function AdminPage() {
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/moderation");
    if (res.status === 403) {
      setForbidden(true);
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">Set ADMIN_EMAILS in .env.local to your login email.</p>
        <Link href="/dashboard" className="mt-6 text-brand font-semibold hover:underline">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-slate-900">Recruitment Site Admin — Job moderation</h1>
        <Link href="/dashboard" className="text-sm text-brand hover:underline">Dashboard</Link>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="font-semibold text-slate-900">Pending review ({pendingJobs.length})</h2>
        {pendingJobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No jobs awaiting review.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingJobs.map((job) => {
              const emp = job.employers;
              const company = Array.isArray(emp) ? emp[0]?.company_name : emp?.company_name;
              return (
                <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{company} · {job.city} · {job.vertical}</p>
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
