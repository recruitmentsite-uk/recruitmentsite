"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UNSPLASH, VERTICAL_LABELS, type Vertical } from "@placeuk/shared";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";
import { AuthShell } from "@/components/AuthShell";

export default function CandidateSignupClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [vertical, setVertical] = useState<Vertical>("healthcare");
  const [phone, setPhone] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
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
      body: JSON.stringify({
        role: "candidate",
        email,
        password,
        fullName,
        city,
        vertical,
        phone,
        smsEnabled,
      }),
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

    router.push("/account");
    router.refresh();
  }

  return (
    <AuthShell
      image={UNSPLASH.hero.commute}
      imageAlt="UK city morning for job seekers"
      panelLine="Salary shown upfront. Apply free in minutes."
    >
      <div className="border-t border-ink/10 bg-white px-6 py-8 sm:px-8">
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">Create candidate account</h1>
        <p className="mt-2 text-sm text-ink/55">
          Save your CV, get job alerts, and be discoverable by verified UK employers.
        </p>

        {!isAuthConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Supabase not configured. Add env vars to enable signup.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-ink/80">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Manchester"
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">Preferred sector</label>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value as Vertical)}
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80">Mobile (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07…"
              className="mt-1 w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-ink/60">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="mt-1"
            />
            Send me SMS job alerts (UK numbers only; standard rates apply)
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/50">
          Hiring instead?{" "}
          <Link href="/signup" className="font-semibold text-brand hover:underline">
            Employer signup
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
