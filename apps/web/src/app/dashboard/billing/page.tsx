import Link from "next/link";
import { getPlanByTier, PRICING_PLANS, formatGbp, CV_DATABASE_ADDON_PRICE, COMPANY_LEGAL_NOTICE } from "@placeuk/shared";
import { DashboardHeader } from "@/components/DashboardShell";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CvDatabaseButton } from "@/components/CvDatabaseButton";
import { ManageBillingButton } from "@/components/ManageBillingButton";
import { getEmployerContext } from "@/lib/employer";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const ctx = await getEmployerContext();
  const plan = getPlanByTier(ctx?.plan ?? "growth") ?? PRICING_PLANS[1];

  return (
    <>
      <DashboardHeader title="Billing" subtitle="Simple flat fees — no placement commission, ever." />
      <div className="p-8 max-w-3xl">
        <div className="rounded-2xl border-2 border-brand bg-gradient-to-br from-teal-50 to-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-brand">Current plan</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 capitalize">{plan.name}</p>
              <p className="text-slate-500">{formatGbp(plan.priceMonthly)}/month · {ctx?.companyName ?? "Your company"}</p>
            </div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">Active</span>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            {plan.highlights.map((h) => (
              <li key={h} className="flex gap-2"><span className="text-brand">✓</span>{h}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Compare what you&apos;re saving</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: `Recruitment Site ${plan.name} (unlimited hires)`, cost: `${formatGbp(plan.priceMonthly)}/mo` },
              { label: "Reed (5 listings × £100)", cost: "£500/mo" },
              { label: "Hays (1 × £35k hire @ 18%)", cost: "£6,300 once" },
              { label: "Indeed PPC (est. 50 applies)", cost: "£400+/mo" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-600">{row.label}</span>
                <span className={`font-semibold ${row.label.startsWith("Recruitment Site") ? "text-brand" : "text-slate-400 line-through"}`}>
                  {row.cost}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {plan.tier !== "scale" && (
            <CheckoutButton tier="scale" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Upgrade to Scale
            </CheckoutButton>
          )}
          <ManageBillingButton
            hasBillingAccount={Boolean(ctx?.stripeCustomerId)}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-brand hover:text-brand disabled:opacity-50"
          >
            Manage subscription & invoices
          </ManageBillingButton>
          <Link href="/compare" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-brand">
            Full comparison →
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Add-ons</h2>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4 gap-4">
            <div>
              <p className="font-medium text-slate-900">CV database access</p>
              <p className="text-sm text-slate-500">Search candidate profiles — Reed charges extra for this.</p>
              {ctx?.cvDatabaseEnabled && (
                <Link href="/dashboard/candidates" className="text-sm font-semibold text-brand hover:underline">
                  Search candidates →
                </Link>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-brand">{formatGbp(CV_DATABASE_ADDON_PRICE)}/mo</p>
              <CvDatabaseButton enabled={ctx?.cvDatabaseEnabled} className="mt-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50" />
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-400 leading-relaxed">{COMPANY_LEGAL_NOTICE}</p>
      </div>
    </>
  );
}
