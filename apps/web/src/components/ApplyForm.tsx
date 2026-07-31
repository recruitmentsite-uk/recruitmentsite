"use client";

import { useState } from "react";

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
  source?: string;
}

export function ApplyForm({ jobId, jobTitle, source }: ApplyFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [equalityDone, setEqualityDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Application failed");
      setApplicationId(json.applicationId ?? null);
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function submitEquality(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const preferNotToSay = fd.get("preferNotToSay") === "on";
    await fetch("/api/equality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        jobId,
        preferNotToSay,
        age_band: fd.get("age_band") || undefined,
        gender: fd.get("gender") || undefined,
        ethnicity: fd.get("ethnicity") || undefined,
        disability: fd.get("disability") || undefined,
      }),
    });
    setEqualityDone(true);
  }

  if (status === "success") {
    return (
      <div className="mt-10 space-y-6">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-6 text-center">
          <p className="font-semibold text-brand">Application submitted!</p>
          <p className="mt-2 text-sm text-slate-600">
            The employer will review your application for {jobTitle}. Good luck!
          </p>
        </div>

        {!equalityDone ? (
          <form onSubmit={submitEquality} className="rounded-lg border border-slate-200 bg-white p-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Optional equality monitoring</h3>
            <p className="text-sm text-slate-500">
              Voluntary and anonymous for reporting only — not shown to recruiters reviewing your application.
            </p>
            <select name="age_band" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Age band (optional)</option>
              <option value="16-24">16–24</option>
              <option value="25-34">25–34</option>
              <option value="35-44">35–44</option>
              <option value="45-54">45–54</option>
              <option value="55-64">55–64</option>
              <option value="65+">65+</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <select name="gender" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Gender (optional)</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <select name="ethnicity" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Ethnicity (optional)</option>
              <option value="white">White</option>
              <option value="mixed">Mixed</option>
              <option value="asian">Asian</option>
              <option value="black">Black</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <select name="disability" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">Disability (optional)</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="preferNotToSay" />
              Prefer not to answer any of these
            </label>
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Submit monitoring form
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-slate-500">Thanks — equality form recorded.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5 border-t border-slate-200 pt-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Apply for this role</h2>
        <p className="mt-1 text-sm text-slate-500">Usually under 5 minutes on mobile.</p>
      </div>
      <input type="hidden" name="jobId" value={jobId} />
      {source ? <input type="hidden" name="source" value={source} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Full name *
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="coverNote" className="block text-sm font-medium text-slate-700">
          Cover note (optional)
        </label>
        <textarea
          id="coverNote"
          name="coverNote"
          rows={3}
          placeholder="Briefly explain why you're a good fit..."
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-slate-700">
          CV (PDF or Word, max 5MB) *
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf"
          required
          className="mt-1 w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-brand hover:file:bg-teal-100"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4" />
        <span>
          I agree to the{" "}
          <a href="/privacy" className="text-brand underline" target="_blank">
            Privacy Policy
          </a>
          . I consent to Recruitment Site storing my CV for up to 12 months and sharing it with this
          employer.
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="rightToWork" className="mt-1 h-4 w-4" />
        <span>I confirm I have the right to work in the UK</span>
      </label>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="talentPool" defaultChecked className="mt-1 h-4 w-4" />
        <span>
          Also add me to the talent pool so employers with CV Database can contact me about similar
          roles
        </span>
      </label>

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="sticky bottom-4 w-full rounded-lg bg-brand py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-dark transition-colors disabled:opacity-60 sm:static sm:w-auto sm:px-10 sm:shadow-none"
      >
        {status === "loading" ? "Submitting..." : "Submit application — free"}
      </button>
    </form>
  );
}
