"use client";

import { useState } from "react";

export function ManageBillingButton({
  hasBillingAccount,
  className,
  children,
}: {
  hasBillingAccount?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!hasBillingAccount) {
      alert("Subscribe to a plan first to manage billing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Billing portal unavailable — configure Stripe in .env.local");
      }
    } catch {
      alert("Could not open billing portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : children}
    </button>
  );
}
