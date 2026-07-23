"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link href="/" className="font-bold text-brand">Recruitment Site</Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          {!isAuthConfigured() && (
            <p className="mt-4 text-sm text-amber-700">Supabase not configured.</p>
          )}
          {sent ? (
            <p className="mt-4 text-sm text-slate-600">Check your email for a reset link.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
              />
              <button type="submit" className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                Send reset link
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-sm">
            <Link href="/login" className="text-brand font-semibold hover:underline">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
