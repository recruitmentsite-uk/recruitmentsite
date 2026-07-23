"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { VERTICAL_LABELS } from "@placeuk/shared";
import { DashboardHeader } from "@/components/DashboardShell";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    vertical: "healthcare",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "year",
    status: "active",
  });

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.job) {
          setForm({
            title: data.job.title,
            description: data.job.description,
            city: data.job.city,
            vertical: data.job.vertical,
            salaryMin: String(data.job.salary_min ?? ""),
            salaryMax: String(data.job.salary_max ?? ""),
            salaryPeriod: data.job.salary_period ?? "year",
            status: data.job.status,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        city: form.city,
        vertical: form.vertical,
        salaryMin: form.salaryMin,
        salaryMax: form.salaryMax,
        salaryPeriod: form.salaryPeriod,
        status: form.status,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Save failed");
      return;
    }
    router.push("/dashboard/jobs");
    router.refresh();
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Loading job...</div>;
  }

  return (
    <>
      <DashboardHeader title="Edit job" subtitle="Update listing details and status." />
      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700">Job title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">City</label>
              <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="pending_review">Pending review</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Salary min (£)</label>
              <input required type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Salary max (£)</label>
              <input required type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Vertical</label>
              <select value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm">
                {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save changes"}
            </button>
            <Link href="/dashboard/jobs" className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
