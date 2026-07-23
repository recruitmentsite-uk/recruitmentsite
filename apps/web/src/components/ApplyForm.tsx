"use client";

import { useState } from "react";

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
}

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-10 rounded-lg border border-teal-200 bg-teal-50 p-6 text-center">
        <p className="font-semibold text-brand">Application submitted!</p>
        <p className="mt-2 text-sm text-slate-600">
          The employer will review your application for {jobTitle}. Good luck!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4 border-t border-slate-200 pt-8">
      <h2 className="text-lg font-semibold text-slate-900">Apply for this role</h2>
      <input type="hidden" name="jobId" value={jobId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Full name *
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-slate-700">
          CV (PDF, max 5MB) *
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="mt-1 w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-teal-100"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          I agree to the{" "}
          <a href="/privacy" className="text-brand underline" target="_blank">
            Privacy Policy
          </a>
          . I consent to Recruitment Site storing my CV for up to 12 months and sharing it with this employer.
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="rightToWork" className="mt-1" />
        <span>I confirm I have the right to work in the UK</span>
      </label>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-brand py-3 font-semibold text-white hover:bg-brand-dark transition-colors disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === "loading" ? "Submitting..." : "Submit application — free"}
      </button>
    </form>
  );
}
