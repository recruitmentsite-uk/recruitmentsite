import Link from "next/link";
import Image from "next/image";
import { UNSPLASH, SITE_NAME } from "@placeuk/shared";
import { DashboardHeader } from "@/components/DashboardShell";
import { getEmployerContext } from "@/lib/employer";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function CareersPage() {
  const ctx = await getEmployerContext();
  const { activeJobs } = await getDashboardData(ctx);
  const companyName = ctx?.companyName ?? "Your Company";
  const slug = ctx?.slug ?? companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <>
      <DashboardHeader
        title="Branded careers page"
        subtitle="Included on Growth — a feature Reed and Indeed charge extra for."
      />
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
            Live preview
          </span>
          <code className="rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {slug}.recruitmentsite.co.uk
          </code>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="relative h-48">
            <Image src={UNSPLASH.hero.team} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand/90 to-teal-800/70 flex items-end p-8">
              <div>
                <p className="text-teal-100 text-sm">Careers at</p>
                <h2 className="text-3xl font-bold text-white">{companyName}</h2>
              </div>
            </div>
          </div>
          <div className="p-8">
            <p className="text-slate-600">
              Join {companyName}. All roles show salary upfront. Apply in under 5 minutes.
            </p>
            <h3 className="mt-8 font-bold text-slate-900">Open roles</h3>
            <div className="mt-4 divide-y divide-slate-100">
              {activeJobs.filter((j) => j.status === "active").map((job) => (
                <div key={job.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.applications} applicants</p>
                  </div>
                  <Link href={`/jobs/${job.slug}`} className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white">
                    Apply
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-xs text-slate-400">
              Powered by {SITE_NAME}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard/settings" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-brand">
            Edit company profile
          </Link>
          <Link href="/dashboard/jobs/new" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Add a job to careers page
          </Link>
        </div>
      </div>
    </>
  );
}
