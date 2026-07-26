"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface JobSearchFormProps {
  variant?: "hero" | "compact";
  jobCount?: number;
  defaultQuery?: string;
  defaultCity?: string;
  /** Keep current sector when searching from /jobs */
  preserveVertical?: string;
}

export function JobSearchForm({
  variant = "hero",
  jobCount,
  defaultQuery = "",
  defaultCity = "",
  preserveVertical,
}: JobSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    if (preserveVertical) params.set("vertical", preserveVertical);
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
          className="flex-1 rounded-xl border border-mist-deep bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or postcode"
          className="rounded-xl border border-mist-deep bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:w-40"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl rounded-2xl bg-white/95 p-2 shadow-search backdrop-blur-md ring-1 ring-white/40"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-stretch">
        <label className="flex flex-1 flex-col gap-1 px-4 py-3 text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
            Role
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nurse, electrician, developer…"
            className="border-0 bg-transparent text-base font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0"
          />
        </label>
        <div className="my-3 hidden w-px self-stretch bg-mist-deep sm:block" />
        <label className="flex flex-1 flex-col gap-1 px-4 py-3 text-left sm:max-w-[220px]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
            Place
          </span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or region"
            className="border-0 bg-transparent text-base font-medium text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-brand px-8 py-4 text-sm font-semibold tracking-wide text-white transition hover:bg-brand-dark sm:shrink-0"
        >
          Search
        </button>
      </div>
      {jobCount !== undefined && (
        <p className="px-4 pb-2 text-left text-xs text-ink/45">
          {jobCount.toLocaleString()} open roles · salary on every listing
        </p>
      )}
    </form>
  );
}
