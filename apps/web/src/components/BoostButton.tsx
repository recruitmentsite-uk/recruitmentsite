"use client";

import { useState } from "react";
import { FEATURED_BOOST_PRICE } from "@placeuk/shared";

export function BoostButton({
  jobId,
  className,
  children,
}: {
  jobId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "boost", jobId }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Boost checkout unavailable — configure Stripe in .env.local");
      }
    } catch {
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : children ?? `Boost £${FEATURED_BOOST_PRICE}`}
    </button>
  );
}
