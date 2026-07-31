import { DashboardHeader } from "@/components/DashboardShell";

export const metadata = { title: "Equality monitoring" };

export default function EqualityPage() {
  return (
    <>
      <DashboardHeader
        title="Equality monitoring"
        subtitle="Voluntary, anonymous aggregates for UK reporting — never used for hiring decisions."
      />
      <div className="p-8 max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Candidates may optionally submit equality monitoring after applying. Responses are stored
            separately from recruiter review screens. Exports are aggregated only; categories with
            fewer than 5 responses are suppressed.
          </p>
          <a
            href="/api/equality/export"
            className="mt-6 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Download CSV export
          </a>
        </div>
      </div>
    </>
  );
}
