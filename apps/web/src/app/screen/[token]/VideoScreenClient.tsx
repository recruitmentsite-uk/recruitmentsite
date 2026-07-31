"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VideoScreenClient({ token }: { token: string }) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/video-screenings/${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else {
          setPrompt(json.prompt);
          setStatus(json.status);
          if (json.hasVideo || json.status === "submitted") setDone(true);
        }
      })
      .catch(() => setError("Could not load invite"));
  }, [token]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("video", file);
    const res = await fetch(`/api/video-screenings/${token}`, { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(json.error ?? "Upload failed");
      return;
    }
    setDone(true);
    setStatus("submitted");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link href="/" className="font-bold text-brand">Recruitment Site</Link>
      </header>
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Video screening</h1>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {!error && (
            <>
              <p className="mt-4 text-sm text-slate-600">{prompt || "Loading…"}</p>
              {done ? (
                <p className="mt-6 rounded-lg bg-teal-50 p-4 text-sm text-teal-800">
                  Thanks — your video has been submitted ({status}).
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-slate-500">
                    Record a short video on your phone or computer (MP4/WebM, under 80MB), then upload it here.
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    capture="user"
                    disabled={uploading}
                    onChange={onUpload}
                    className="block w-full text-sm"
                  />
                  {uploading && <p className="text-sm text-slate-500">Uploading…</p>}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
