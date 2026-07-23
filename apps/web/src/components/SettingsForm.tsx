"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SettingsFormProps {
  initialCompanyName: string;
  initialSlug: string;
  initialAtsWebhook?: string;
}

export function SettingsForm({
  initialCompanyName,
  initialSlug,
  initialAtsWebhook = "",
}: SettingsFormProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [atsWebhook, setAtsWebhook] = useState(initialAtsWebhook);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/employer/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.companyName) setCompanyName(data.companyName);
        if (data.atsWebhookUrl) setAtsWebhook(data.atsWebhookUrl);
      })
      .catch(() => null);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/employer/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, atsWebhookUrl: atsWebhook }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Save failed");
      return;
    }
    localStorage.setItem(
      "recruitmentsite-employer-profile",
      JSON.stringify({ companyName, completedAt: new Date().toISOString() }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const slug = (initialSlug || companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {saved && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-brand">
          Settings saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Company profile</h2>
        <p className="mt-1 text-sm text-slate-500">Powers your branded careers page URL.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Company name</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <p className="text-xs text-slate-400">
            Careers URL (when domain live): {slug || "your-company"}.recruitmentsite.co.uk
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">ATS webhook</h2>
        <p className="mt-1 text-sm text-slate-500">New applications POST here in real time (Scale plan).</p>
        <input
          value={atsWebhook}
          onChange={(e) => setAtsWebhook(e.target.value)}
          placeholder="https://your-ats.com/webhooks/recruitmentsite"
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </section>

      <button type="submit" className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
        Save settings
      </button>
    </form>
  );
}
