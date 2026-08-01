"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@placeuk/shared";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/social", label: "Social CMS" },
  { href: "/admin/moderation", label: "Moderation" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [gate, setGate] = useState<"loading" | "ok" | "forbidden">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/me");
      if (cancelled) return;
      setGate(res.ok ? "ok" : "forbidden");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (gate === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading admin…
      </div>
    );
  }

  if (gate === "forbidden") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Sign in with an email listed in <code className="text-xs">ADMIN_EMAILS</code>.
        </p>
        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/login" className="text-brand font-semibold hover:underline">
            Sign in
          </Link>
          <Link href="/dashboard" className="text-slate-500 hover:underline">
            Employer dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-brand">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
              SA
            </span>
            Super admin
          </Link>
          <p className="mt-1 text-xs text-slate-400 truncate">{SITE_NAME}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="block text-xs font-medium text-slate-500 hover:text-brand"
          >
            Employer dashboard
          </Link>
          <Link href="/" className="block text-xs font-medium text-slate-500 hover:text-brand">
            Public site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 md:px-8 py-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
