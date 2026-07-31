"use client";

import { useState } from "react";

export function ScreeningCreditsButton({
  credits,
  className,
}: {
  credits: number;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "screening_credits", credits }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      alert(json.error ?? "Checkout unavailable — configure Stripe in .env.local");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={buy} disabled={loading} className={className}>
      {loading ? "Redirecting…" : `Buy ${credits}`}
    </button>
  );
}
