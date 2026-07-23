import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardShell";
import { CvDatabaseButton } from "@/components/CvDatabaseButton";
import { getEmployerContext } from "@/lib/employer";
import { searchCandidates } from "@/lib/dashboard-data";

export const metadata = { title: "CV Database" };

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; checkout?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getEmployerContext();
  const candidates = ctx?.cvDatabaseEnabled
    ? await searchCandidates(ctx, params.q)
    : [];

  return (
    <>
      <DashboardHeader
        title="CV database"
        subtitle="Search candidate profiles — a Reed premium feature included as a Recruitment Site add-on."
      />
      <div className="p-8">
        {params.checkout === "success" && (
          <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-brand">
            CV database activated — start searching candidates below.
          </div>
        )}

        {!ctx?.cvDatabaseEnabled ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-lg mx-auto">
            <span className="text-4xl">🔍</span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Unlock CV database access</h2>
            <p className="mt-2 text-sm text-slate-600">
              Search thousands of candidate profiles. Reed charges extra — add it to your plan in billing.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <CvDatabaseButton className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark" />
              <Link href="/dashboard/billing" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:border-brand">
                View billing
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form className="mb-6 flex gap-3">
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search by name, email, or headline..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button type="submit" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                Search
              </button>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {candidates.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">
                  No candidates found. Profiles appear as job seekers create accounts and apply.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <div key={c.id} className="p-5 hover:bg-slate-50">
                      <p className="font-medium text-slate-900">{c.fullName ?? c.email}</p>
                      {c.headline && <p className="text-sm text-slate-500">{c.headline}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.city && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c.city}</span>}
                        {c.skills.slice(0, 4).map((s) => (
                          <span key={s} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-brand">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
