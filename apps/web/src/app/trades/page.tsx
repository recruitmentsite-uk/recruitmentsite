import Link from "next/link";
import { getJobsByVertical } from "@/lib/jobs";
import {
  TRADES_ROLE_TEMPLATES,
  VERTICAL_LABELS,
  formatGbp,
  UNSPLASH,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { UnsplashImage } from "@/components/UnsplashImage";
import { CompetitorCards } from "@/components/CompetitorComparison";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Trades & Construction Jobs UK",
  description:
    "Electricians, plumbers, site managers and labourers across the UK. Salary shown upfront. CIS and PAYE roles. Apply free.",
  path: "/trades",
});

export default async function TradesPage() {
  const jobs = await getJobsByVertical("trades");

  return (
    <>
      <Hero
        image={UNSPLASH.vertical.trades}
        badge="Trades & construction"
        title="Trades jobs across the UK"
        subtitle="Electricians, plumbers, site managers — salary upfront, CIS or PAYE clearly stated. No agency commission."
        primaryCta={{ label: `Browse ${jobs.length} jobs`, href: "/jobs?vertical=trades" }}
        secondaryCta={{ label: "Hire trades staff", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Built for construction hiring</h2>
            <p className="mt-3 text-slate-600">
              Checkatrade and Randstad charge per lead or placement. Recruitment Site gives SMEs unlimited posts
              with job alerts by trade and city — flat monthly fee, no commission on hire.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {["CSCS aware", "CIS / PAYE clear", "Day rates shown", "SMSTS roles"].map((tag) => (
                <span key={tag} className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-brand text-center">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl">
            <UnsplashImage src={UNSPLASH.sections.construction} alt="Construction site" fill />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-slate-900">Popular trades roles & typical pay</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRADES_ROLE_TEMPLATES.map((role) => (
              <div key={role.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">{role.title}</h3>
                <p className="mt-1 text-sm font-semibold text-brand">
                  {formatGbp(role.salary.min)} – {formatGbp(role.salary.max)}/yr
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {role.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-xl font-bold text-slate-900">Latest {VERTICAL_LABELS.trades} jobs</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-white text-center mb-8">Why contractors choose Recruitment Site</h2>
          <CompetitorCards />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-2 items-start">
        <JobAlertSignup />
        <div className="relative rounded-2xl overflow-hidden h-64">
          <UnsplashImage src={UNSPLASH.sections.handshake} alt="Trades hiring" fill />
        </div>
      </section>
    </>
  );
}
