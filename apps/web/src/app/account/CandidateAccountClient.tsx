"use client";

import { useState } from "react";
import Link from "next/link";
import type { CandidateContext } from "@/lib/candidate";

export default function CandidateAccountClient({ profile }: { profile: CandidateContext }) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
  const [phone, setPhone] = useState(profile.phoneE164 ?? "");
  const [smsEnabled, setSmsEnabled] = useState(profile.smsEnabled);
  const [rightToWorkUk, setRightToWorkUk] = useState(profile.rightToWorkUk);
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState(profile.skills);
  const [saving, setSaving] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/candidate/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, city, headline, bio, linkedinUrl, phone, smsEnabled, rightToWorkUk }),
    });
    setSaving(false);
    setMessage(res.ok ? "Profile saved." : "Could not save profile.");
  }

  async function uploadCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage("Uploading CV…");
    const fd = new FormData();
    fd.append("cv", file);
    const res = await fetch("/api/candidate/profile", { method: "POST", body: fd });
    const json = await res.json();
    if (res.ok) {
      setSkills(json.skills ?? skills);
      setMessage("CV uploaded and profile enriched.");
    } else {
      setMessage(json.error ?? "Upload failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-brand">Recruitment Site</Link>
        <Link href="/jobs" className="text-sm font-medium text-slate-600 hover:text-brand">Browse jobs</Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
          <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
        </div>

        {message && (
          <p className="rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</p>
        )}

        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Headline</label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">About</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mobile</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
            SMS job alerts
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={rightToWorkUk} onChange={(e) => setRightToWorkUk(e.target.checked)} />
            I have the right to work in the UK
          </label>
          {skills.length > 0 && (
            <p className="text-sm text-slate-500">Skills: {skills.join(", ")}</p>
          )}
          <button type="submit" disabled={saving} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">CV</h2>
          <p className="mt-1 text-sm text-slate-500">
            {profile.cvStoragePath ? "CV on file — upload a new one to replace it." : "Upload your CV to appear in the employer CV database."}
          </p>
          <input type="file" accept=".pdf,.doc,.docx" onChange={uploadCv} className="mt-4 block text-sm" />
        </div>
      </main>
    </div>
  );
}
