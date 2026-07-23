"use client";

import { useState } from "react";
import Link from "next/link";
import { LAUNCH_VERTICAL, VERTICAL_LABELS } from "@placeuk/shared";
import { DashboardHeader } from "@/components/DashboardShell";

export default function NewJobPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [jobSlug, setJobSlug] = useState("");
  const [pendingReview, setPendingReview] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          city: form.get("city"),
          vertical: form.get("vertical"),
          salaryMin: form.get("salaryMin"),
          salaryMax: form.get("salaryMax"),
          salaryPeriod: form.get("salaryPeriod"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to publish");
        setStatus("error");
        return;
      }
      setJobSlug(json.job?.slug ?? "");
      setPendingReview(Boolean(json.pendingReview));
      setStatus("success");
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <>
        <DashboardHeader title="Job published" />
        <div className="p-8 text-center max-w-lg mx-auto">
          <span className="text-5xl">✅</span>
          <p className="mt-4 font-semibold text-slate-900">Job saved!</p>
          <p className="mt-2 text-sm text-slate-600">
            {pendingReview
              ? "Submitted for review — an admin will approve it before it goes live on Google Jobs and Indeed."
              : "Google Jobs syndication runs automatically on Growth. Applications appear in your AI-scored inbox."}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/dashboard/jobs" className="text-sm font-semibold text-brand underline">
              View all jobs
            </Link>
            {jobSlug && (
              <Link href={`/jobs/${jobSlug}`} className="text-sm text-slate-500 underline">
                Preview live listing →
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Post a new job" subtitle="Salary required — listings with pay shown get 25–30% more applications." />
      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {status === "error" && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">Job title *</label>
            <input required name="title" placeholder="Registered Nurse (Band 5)" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description *</label>
            <textarea required name="description" rows={5} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">City *</label>
              <input required name="city" placeholder="Manchester" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Vertical</label>
              <select name="vertical" defaultValue={LAUNCH_VERTICAL} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Salary min (£) *</label>
              <input required name="salaryMin" type="number" placeholder="28407" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Salary max (£) *</label>
              <input required name="salaryMax" type="number" placeholder="34581" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Period</label>
              <select name="salaryPeriod" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="year">Per year</option>
                <option value="hour">Per hour</option>
                <option value="day">Per day</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark shadow-md disabled:opacity-50"
          >
            {status === "loading" ? "Publishing..." : "Publish job → Google Jobs"}
          </button>
        </form>
      </div>
    </>
  );
}
