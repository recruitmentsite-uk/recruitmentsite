"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/jobs", label: "Find jobs" },
  { href: "/sectors", label: "All sectors" },
  { href: "/healthcare", label: "Healthcare" },
  { href: "/trades", label: "Trades" },
  { href: "/tech", label: "Tech" },
  { href: "/education", label: "Education" },
  { href: "/logistics", label: "Logistics" },
  { href: "/finance", label: "Finance" },
  { href: "/blog", label: "Guides" },
  { href: "/for-employers", label: "For employers" },
  { href: "/pricing", label: "Employer pricing" },
  { href: "/signup/candidate", label: "Candidate signup" },
  { href: "/login", label: "Sign in" },
];

interface MobileNavProps {
  tone?: "light" | "dark";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ tone = "dark", open, onOpenChange }: MobileNavProps) {
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
          tone === "light"
            ? "border-white/30 text-white hover:border-white hover:bg-white/10"
            : "border-ink/10 text-ink/70 hover:border-brand hover:text-brand"
        }`}
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
            className="fixed inset-0 top-[65px] z-40 bg-ink/30 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <nav className="fixed left-0 right-0 top-[65px] z-50 max-h-[calc(100vh-65px)] overflow-y-auto border-b border-ink/8 bg-paper/95 shadow-lift backdrop-blur-xl">
            <ul className="px-4 py-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-ink/80 transition hover:bg-mist hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/8 p-4">
              <Link
                href="/jobs"
                onClick={() => onOpenChange(false)}
                className="block w-full rounded-full bg-brand py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
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
