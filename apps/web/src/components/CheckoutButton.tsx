"use client";

import { useState } from "react";
import { PRICING_PLANS, formatGbp, type PlanTier } from "@placeuk/shared";

interface CheckoutButtonProps {
  tier: PlanTier;
  interval?: "month" | "year";
  offer?: "warm99";
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  tier,
  interval = "month",
  offer,
  className,
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          interval,
          ...(offer === "warm99" ? { offer: "warm99", skipTrial: true } : {}),
        }),
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
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : children}
    </button>
  );
}

export function PaygCheckoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payg" }),
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
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : children}
    </button>
  );
}

export function PricingCards({ offer }: { offer?: "warm99" } = {}) {
  const warm99 = offer === "warm99";
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {PRICING_PLANS.map((plan) => {
        const highlightWarm = warm99 && plan.tier === "growth";
        return (
          <div
            key={plan.tier}
            className={`rounded-xl border p-8 ${
              plan.tier === "growth"
                ? "border-brand ring-2 ring-brand/20 bg-teal-50/50"
                : "border-slate-200 bg-white"
            }`}
          >
            {plan.tier === "growth" && (
              <span className="mb-4 inline-block rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">
                {highlightWarm ? "Warm lead — £99 month 1" : "Most popular"}
              </span>
            )}
            <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
            <p className="mt-2">
              {highlightWarm ? (
                <>
                  <span className="text-3xl font-bold text-slate-900">{formatGbp(99)}</span>
                  <span className="text-slate-500"> month 1</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    then {formatGbp(plan.priceMonthly)}/month · no trial
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-slate-900">
                    {formatGbp(plan.priceMonthly)}
                  </span>
                  <span className="text-slate-500">/month</span>
                </>
              )}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {plan.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-brand">✓</span>
                  {h}
                </li>
              ))}
            </ul>
            <CheckoutButton
              tier={plan.tier}
              offer={highlightWarm ? "warm99" : undefined}
              className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                plan.tier === "growth"
                  ? "bg-brand text-white hover:bg-brand-dark"
                  : "border border-slate-300 text-slate-700 hover:border-brand hover:text-brand"
              }`}
            >
              {highlightWarm ? "Pay £99 · list a role today" : "Start free trial"}
            </CheckoutButton>
          </div>
        );
      })}
    </div>
  );
}
