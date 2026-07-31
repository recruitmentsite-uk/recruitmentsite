"use client";

import { useEffect } from "react";

export function TrackJobView({ jobId, source }: { jobId: string; source?: string }) {
  useEffect(() => {
    const key = `viewed:${jobId}`;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) return;
    sessionStorage?.setItem(key, "1");

    void fetch("/api/jobs/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, source: source || null }),
      keepalive: true,
    }).catch(() => null);
  }, [jobId, source]);

  return null;
}
