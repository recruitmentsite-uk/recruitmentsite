"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE_NAME } from "@placeuk/shared";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }

      setDone(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link href="/" className="font-bold text-brand">
          {SITE_NAME}
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Unsubscribe</h1>
          {done ? (
            <p className="mt-4 text-sm text-slate-600">
              You&apos;ve been unsubscribed. You won&apos;t receive further job alerts or outreach emails
              at this address.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-600">
                Stop job alerts and marketing emails from {SITE_NAME}.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {loading ? "Unsubscribing…" : "Unsubscribe"}
                </button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm">
            <Link href="/" className="text-brand font-semibold hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
      }
    >
      <UnsubscribeForm />
    </Suspense>
  );
}
