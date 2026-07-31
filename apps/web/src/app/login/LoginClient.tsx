"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UNSPLASH } from "@placeuk/shared";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Auth not configured — set Supabase env vars or use dashboard demo without login.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    await fetch("/api/employer/link", { method: "POST" });
    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell
      image={UNSPLASH.hero.hiring}
      imageAlt="UK employers collaborating in a workplace"
      panelLine="Hire with salary shown — and no agency cut."
    >
      <div className="border-t border-ink/10 bg-white px-6 py-8 sm:px-8">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">Employer login</h1>
        <p className="mt-2 text-sm text-ink/55">Access your dashboard, applications, and billing.</p>

        {!isAuthConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Supabase not configured.{" "}
            <Link href="/dashboard" className="font-semibold underline">
              Continue to demo dashboard →
            </Link>
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-ink/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/50">
          No account?{" "}
          <Link
            href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-brand hover:underline"
          >
            Create employer account
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/forgot-password" className="text-ink/40 hover:text-brand">
            Forgot password?
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
