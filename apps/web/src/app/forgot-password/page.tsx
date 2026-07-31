"use client";

import { useState } from "react";
import Link from "next/link";
import { UNSPLASH } from "@placeuk/shared";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Auth not configured");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      image={UNSPLASH.hero.hiring}
      imageAlt="UK employers collaborating in a workplace"
      panelLine="Hire with salary shown — and no agency cut."
    >
      <div className="border-t border-ink/10 bg-white px-6 py-8 sm:px-8">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">Reset password</h1>
        {!isAuthConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Supabase not configured.</p>
        )}
        {sent ? (
          <p className="mt-4 text-sm text-ink/60">Check your email for a reset link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Work email"
              className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Send reset link
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
