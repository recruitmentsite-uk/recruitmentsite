"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link href="/" className="font-bold text-brand">Recruitment Site</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Employer login</h1>
          <p className="mt-2 text-sm text-slate-500">Access your dashboard, applications, and billing.</p>

          {!isAuthConfigured() && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Supabase not configured.{" "}
              <Link href="/dashboard" className="font-semibold underline">Continue to demo dashboard →</Link>
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand hover:underline">
              Create employer account
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link href="/forgot-password" className="text-slate-400 hover:text-brand">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
