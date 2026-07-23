"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function JobActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  async function removeJob() {
    if (!confirm("Expire this job listing?")) return;
    setLoading(true);
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={`/dashboard/jobs/${jobId}/edit`}
        className="flex-1 min-w-[80px] rounded-lg border border-slate-200 py-2 text-center text-xs font-medium text-slate-600 hover:border-brand hover:text-brand"
      >
        Edit
      </a>
      {status === "active" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("paused")}
          className="flex-1 min-w-[80px] rounded-lg border border-amber-200 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50"
        >
          Pause
        </button>
      ) : status === "paused" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("active")}
          className="flex-1 min-w-[80px] rounded-lg border border-teal-200 py-2 text-xs font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-50"
        >
          Resume
        </button>
      ) : null}
      {status === "pending_review" && (
        <span className="flex-1 rounded-lg bg-amber-50 py-2 text-center text-xs font-medium text-amber-800">
          Pending review
        </span>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={removeJob}
        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
