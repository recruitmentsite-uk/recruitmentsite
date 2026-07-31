"use client";

import { useState } from "react";
import { VERTICAL_LABELS, type Vertical } from "@placeuk/shared";

export function JobAlertSignup() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/job-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          city: data.get("city") || undefined,
          vertical: data.get("vertical") || undefined,
          keywords: data.get("keywords") || undefined,
          phone: data.get("phone") || undefined,
          smsEnabled: data.get("smsEnabled") === "on",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create alert");
      setStatus("success");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create alert");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="font-semibold text-brand">Alert created!</p>
        <p className="mt-1 text-sm text-slate-600">We&apos;ll email (and SMS if you opted in) matching jobs daily.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <h3 className="font-semibold text-slate-900">Get job alerts</h3>
      <p className="mt-1 text-sm text-slate-500">Free daily emails — optional SMS for UK mobiles.</p>

      <div className="mt-4 space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="city"
          placeholder="City (e.g. Manchester)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <select
          name="vertical"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">All sectors</option>
          {(Object.entries(VERTICAL_LABELS) as [Vertical, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input
          name="keywords"
          placeholder="Keywords (e.g. nurse, band 5)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Mobile for SMS (optional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="smsEnabled" />
          Also send SMS alerts
        </label>
      </div>

      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">{error || "Could not create alert. Try again."}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "loading" ? "Creating..." : "Create alert"}
      </button>
    </form>
  );
}
