"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface JobSearchFormProps {
  variant?: "hero" | "compact";
  jobCount?: number;
}

export function JobSearchForm({ variant = "hero", jobCount }: JobSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title or keyword"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or postcode"
          className="sm:w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="flex flex-1 flex-col gap-1 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">What</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skill, or keyword"
            className="border-0 bg-transparent text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
        </label>
        <div className="hidden sm:block w-px bg-slate-200 self-stretch my-2" />
        <label className="flex flex-1 flex-col gap-1 px-3 py-2 sm:max-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Where</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or region"
            className="border-0 bg-transparent text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-brand px-8 py-4 text-base font-bold text-white hover:bg-brand-dark transition-colors sm:shrink-0"
        >
          Search jobs
        </button>
      </div>
      {jobCount !== undefined && (
        <p className="px-3 pb-1 text-xs text-slate-500">
          {jobCount.toLocaleString()} open roles · salary shown on every listing
        </p>
      )}
    </form>
  );
}
