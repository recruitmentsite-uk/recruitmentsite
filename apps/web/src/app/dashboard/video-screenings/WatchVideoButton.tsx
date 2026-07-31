"use client";

import { useState } from "react";

export function WatchVideoButton({
  screeningId,
  disabled,
}: {
  screeningId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function openPlayer() {
    if (disabled) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/video-screenings/watch?id=${encodeURIComponent(screeningId)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not load video");
        setLoading(false);
        return;
      }
      setUrl(json.url);
      setOpen(true);
    } catch {
      setError("Could not load video");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPlayer}
        disabled={disabled || loading}
        className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Loading…" : "Watch"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {open && url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Video screening playback"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-ink shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-medium text-white">Video screening</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-white/70 hover:text-white"
              >
                Close
              </button>
            </div>
            <video src={url} controls autoPlay playsInline className="aspect-video w-full bg-black" />
          </div>
        </div>
      )}
    </>
  );
}
