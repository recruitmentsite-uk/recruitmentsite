import { ApplicationsInbox } from "@/components/ApplicationsInbox";
import { DashboardHeader } from "@/components/DashboardShell";
import { getEmployerContext } from "@/lib/employer";
import { getAllApplications } from "@/lib/dashboard-data";

export const metadata = { title: "Applications" };

export default async function ApplicationsPage() {
  const ctx = await getEmployerContext();
  const applications = await getAllApplications(ctx);

  return (
    <>
      <DashboardHeader
        title="Applications"
        subtitle="AI-scored inbox — shortlist strong matches in seconds, not hours."
      />
      <div className="p-8">
        <ApplicationsInbox applications={applications} />

        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-5 flex gap-4">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-semibold text-brand">AI advantage vs Reed & Indeed</p>
            <p className="mt-1 text-sm text-slate-600">
              Every applicant is scored 0–100 against your job spec. Reed charges extra for CV search;
              Indeed relies on keyword filters. Recruitment Site shortlists for you automatically.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
