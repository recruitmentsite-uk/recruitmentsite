"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  VERTICAL_LABELS,
  PRICING_PLANS,
  formatGbp,
  type Vertical,
} from "@placeuk/shared";

const STEPS = ["Company", "Plan", "First job"] as const;

export default function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [vertical, setVertical] = useState<Vertical>("healthcare");
  const [teamSize, setTeamSize] = useState("1-10");
  const [saving, setSaving] = useState(false);

  async function finish(skipJob = false) {
    setSaving(true);
    const profile = { companyName, vertical, teamSize, completedAt: new Date().toISOString() };
    localStorage.setItem("recruitmentsite-employer-profile", JSON.stringify(profile));

    if (!skipJob) {
      router.push("/dashboard/jobs/new?onboarding=1");
      return;
    }

    router.push("/dashboard?onboarding=complete");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold text-brand">
            Recruitment Site
          </Link>
          <span className="text-sm text-slate-500">Employer setup</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12">
        {checkoutSuccess && (
          <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-brand">
            Payment successful — let&apos;s set up your account.
          </div>
        )}

        <div className="mb-8 flex gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 rounded-full py-1.5 text-center text-xs font-semibold ${
                i <= step ? "bg-brand text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {step === 0 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Tell us about your company</h1>
              <p className="mt-2 text-sm text-slate-500">
                This powers your branded careers page and job listings.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Company name</label>
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Sunrise Care Homes Ltd"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Primary sector</label>
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
                <div>
                  <label className="block text-sm font-medium text-slate-700">Team size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="1-10">1–10 employees</option>
                    <option value="11-50">11–50 employees</option>
                    <option value="51-250">51–250 employees</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                disabled={!companyName.trim()}
                onClick={() => setStep(1)}
                className="mt-8 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                Continue
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Your plan</h1>
              <p className="mt-2 text-sm text-slate-500">
                Growth is our most popular plan — unlimited jobs, AI scoring, careers page.
              </p>
              <div className="mt-6 rounded-xl border-2 border-brand bg-teal-50 p-5">
                <p className="font-bold text-slate-900">Growth</p>
                <p className="text-2xl font-bold text-brand mt-1">
                  {formatGbp(PRICING_PLANS[1].priceMonthly)}/month
                </p>
                <ul className="mt-4 space-y-1 text-sm text-slate-600">
                  {PRICING_PLANS[1].highlights.map((h) => (
                    <li key={h} className="flex gap-2"><span className="text-brand">✓</span>{h}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600">
                  Back
                </button>
                <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark">
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-slate-900">Post your first job</h1>
              <p className="mt-2 text-sm text-slate-500">
                Roles with salary shown get 25–30% more applications. Google Jobs syndication starts automatically.
              </p>
              <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{companyName || "Your company"}</p>
                <p className="mt-1">Sector: {VERTICAL_LABELS[vertical]}</p>
                <p className="mt-1">Team: {teamSize} employees</p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => finish(false)}
                  className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  Post my first job →
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => finish(true)}
                  className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:border-brand"
                >
                  Skip for now — go to dashboard
                </button>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-brand">
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
