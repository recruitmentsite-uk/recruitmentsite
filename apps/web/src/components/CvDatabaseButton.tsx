"use client";

import { useState } from "react";
import { CV_DATABASE_ADDON_PRICE } from "@placeuk/shared";

export function CvDatabaseButton({ enabled, className }: { enabled?: boolean; className?: string }) {
  const [loading, setLoading] = useState(false);

  if (enabled) {
    return (
      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">Active</span>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cv_database" }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Checkout unavailable — configure Stripe in .env.local");
      }
    } catch {
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className ?? "rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"}
    >
      {loading ? "Loading..." : `Add for £${CV_DATABASE_ADDON_PRICE}/mo`}
    </button>
  );
}
