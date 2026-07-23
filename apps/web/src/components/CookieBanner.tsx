"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("placeuk-cookie-consent")) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("placeuk-cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          We use essential cookies for job alerts and analytics. See our{" "}
          <Link href="/privacy" className="font-medium text-brand underline">
            privacy policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
