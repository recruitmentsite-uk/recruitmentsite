import Link from "next/link";
import Image from "next/image";
import { UNSPLASH, getVerticalImage } from "@placeuk/shared";
import { DashboardHeader } from "@/components/DashboardShell";
import { BoostButton } from "@/components/BoostButton";
import { JobActions } from "@/components/JobActions";
import { getEmployerContext } from "@/lib/employer";
import { getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Manage Jobs" };

export default async function DashboardJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ boost?: string }>;
}) {
  const params = await searchParams;
  const ctx = await getEmployerContext();
  const { activeJobs } = await getDashboardData(ctx);

  return (
    <>
      <DashboardHeader title="Your jobs" subtitle="Manage listings, track performance, boost visibility." />
      <div className="p-8">
        {params.boost === "success" && (
          <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-brand text-sm">
            Featured boost activated — your job will appear at the top of search for 7 days.
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500">{activeJobs.length} active listings</p>
          <Link
            href="/dashboard/jobs/bulk"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-brand"
          >
            Bulk CSV
          </Link>
          <Link
            href="/dashboard/jobs/new"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            + Post new job
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {activeJobs.map((job) => (
            <div key={job.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-32">
                <Image
                  src={getVerticalImage(job.vertical as "healthcare" | "trades" | "tech" | "general")}
                  alt={job.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${
                  job.status === "active" ? "bg-teal-500 text-white" : "bg-slate-500 text-white"
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900">{job.title}</h3>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-bold text-brand">{job.applications}</p>
                    <p className="text-xs text-slate-500">Applications</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-900">{job.views}</p>
                    <p className="text-xs text-slate-500">Views</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-900">
                      {job.views ? ((job.applications / job.views) * 100).toFixed(1) : "0"}%
                    </p>
                    <p className="text-xs text-slate-500">Conversion</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <BoostButton jobId={job.id} className="flex-1 rounded-lg bg-accent/15 py-2 text-xs font-semibold text-amber-800 hover:bg-accent/25">
                    Boost £49
                  </BoostButton>
                </div>
                <JobActions jobId={job.id} status={job.status} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 relative overflow-hidden rounded-2xl h-40">
          <Image src={UNSPLASH.sections.handshake} alt="Hiring success" fill className="object-cover" />
          <div className="absolute inset-0 bg-brand/80 flex items-center justify-center text-center px-6">
            <div>
              <p className="text-white font-bold text-lg">Syndicated to Google Jobs + Indeed automatically</p>
              <p className="text-teal-100 text-sm mt-1">Feed: /feeds/indeed.xml — register in Indeed Employer dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
