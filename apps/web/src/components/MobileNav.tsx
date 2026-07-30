"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/healthcare", label: "Healthcare" },
  { href: "/trades", label: "Trades" },
  { href: "/tech", label: "Tech" },
  { href: "/blog", label: "Guides" },
  { href: "/for-employers", label: "For employers" },
  { href: "/compare", label: "vs Reed" },
  { href: "/pricing", label: "Employer pricing" },
  { href: "/signup/candidate", label: "Candidate signup" },
  { href: "/login", label: "Sign in" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-brand hover:text-brand"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-[73px] z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="fixed left-0 right-0 top-[73px] z-50 max-h-[calc(100vh-73px)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg">
            <ul className="px-4 py-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-4">
              <Link
                href="/jobs"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl bg-brand py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Browse all jobs
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
