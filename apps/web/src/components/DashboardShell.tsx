"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE_NAME, getPlanByTier } from "@placeuk/shared";
import { createClient, isAuthConfigured } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/jobs", label: "Jobs", icon: "💼" },
  { href: "/dashboard/applications", label: "Applications", icon: "📥" },
  { href: "/dashboard/video-screenings", label: "Video screens", icon: "🎥" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/equality", label: "Equality export", icon: "📋" },
  { href: "/dashboard/careers", label: "Careers page", icon: "🌐" },
  { href: "/dashboard/candidates", label: "CV database", icon: "🔍" },
  { href: "/dashboard/jobs/bulk", label: "Bulk upload", icon: "📋" },
  { href: "/dashboard/jobs/new", label: "Post a job", icon: "➕" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  { href: "/dashboard/billing", label: "Billing", icon: "💳" },
];

interface DashboardSidebarProps {
  companyName?: string;
  plan?: string;
}

export function DashboardSidebar({ companyName, plan = "growth" }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const planInfo = getPlanByTier(plan as "starter" | "growth" | "scale");

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push(isAuthConfigured() ? "/login" : "/");
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm">
            P
          </span>
          {SITE_NAME}
        </Link>
        <p className="mt-1 text-xs text-slate-400 truncate">{companyName ?? "Employer dashboard"}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-50 text-brand"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4 space-y-3">
        <div className="rounded-xl bg-gradient-to-br from-brand to-teal-700 p-4 text-white">
          <p className="text-xs font-medium text-teal-100">Current plan</p>
          <p className="mt-1 font-bold capitalize">{planInfo?.name ?? plan}</p>
          <p className="mt-2 text-xs text-teal-100">Unlimited jobs · AI matching</p>
          <Link href="/dashboard/billing" className="mt-3 inline-block text-xs font-semibold underline">
            Manage billing
          </Link>
        </div>
        {isAuthConfigured() && (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:border-red-200 hover:text-red-600"
          >
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-200 bg-white px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className="mt-1 text-xs font-medium text-teal-600">{change}</p>
          )}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg">
          {icon}
        </span>
      </div>
    </div>
  );
}

export function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-teal-100 text-teal-800" :
    score >= 60 ? "bg-amber-100 text-amber-800" :
    "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      AI {score}
    </span>
  );
}
