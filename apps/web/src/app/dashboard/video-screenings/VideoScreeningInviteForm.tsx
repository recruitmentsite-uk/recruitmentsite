"use client";

import { useState } from "react";

export default function VideoScreeningInviteForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/video-screenings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateEmail: fd.get("email"),
        candidateName: fd.get("name") || undefined,
        prompt: fd.get("prompt") || undefined,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(json.error ?? "Failed to send invite");
      return;
    }
    setMessage(`Invite sent. Link: ${json.link}`);
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
      <h2 className="font-semibold text-slate-900">Send invite</h2>
      <input
        name="name"
        placeholder="Candidate name"
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Candidate email"
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
      />
      <textarea
        name="prompt"
        rows={3}
        placeholder="Prompt (optional)"
        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
      />
      {message && <p className="text-sm text-slate-600 break-all">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send video invite"}
      </button>
    </form>
  );
}
