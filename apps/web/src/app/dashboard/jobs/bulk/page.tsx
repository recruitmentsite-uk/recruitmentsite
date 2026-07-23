"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardShell";

export default function BulkUploadPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/jobs/bulk", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) {
      setStatus("error");
      setMessage(json.error ?? "Upload failed");
      return;
    }
    setStatus("success");
    setMessage(
      json.pendingReview
        ? `Imported ${json.imported} jobs — pending admin review before going live.`
        : `Imported ${json.imported} jobs successfully.`,
    );
  }

  return (
    <>
      <DashboardHeader title="Bulk upload" subtitle="Import up to 50 jobs from CSV." />
      <div className="p-8 max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600 mb-4">
            CSV columns: <code className="text-xs bg-slate-100 px-1 rounded">title, description, city, salary_min, salary_max, vertical, region, salary_period</code>
          </p>
          <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-x-auto mb-6">{`title,description,city,salary_min,salary_max,vertical
Registered Nurse,Band 5 role,Manchester,28407,34581,healthcare
Electrician,JIB certified,Leeds,32000,42000,trades`}</pre>

          <form onSubmit={handleSubmit}>
            <input type="file" name="file" accept=".csv,text/csv" required className="block w-full text-sm text-slate-600" />
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-4 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {status === "loading" ? "Uploading..." : "Upload CSV"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-brand">{message}</p>
          )}
          {status === "error" && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>
          )}
        </div>
        <Link href="/dashboard/jobs" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
          ← Back to jobs
        </Link>
      </div>
    </>
  );
}
