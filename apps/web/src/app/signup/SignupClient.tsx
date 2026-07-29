"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { VERTICAL_LABELS, type Vertical } from "@placeuk/shared";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/onboarding";
  const inviteToken = searchParams.get("invite");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vertical, setVertical] = useState<Vertical>("healthcare");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Auth not configured — set Supabase env vars.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, companyName, vertical, inviteToken }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Signup failed");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Account created — check your email to confirm, then log in.");
      setLoading(false);
      return;
    }

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
          <h1 className="text-2xl font-bold text-slate-900">Create employer account</h1>
          <p className="mt-2 text-sm text-slate-500">
            {inviteToken ? "Accept your team invite and join your company." : "Flat-fee hiring for UK employers."}
          </p>

          {!isAuthConfigured() && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Supabase not configured. Add env vars to enable signup.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {!inviteToken && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Company name</label>
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Sector</label>
                  <select
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value as Vertical)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Work email</label>
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
                minLength={8}
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Looking for a job?{" "}
            <Link href="/signup/candidate" className="font-semibold text-brand hover:underline">
              Candidate signup
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
