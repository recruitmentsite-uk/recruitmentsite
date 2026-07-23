import Link from "next/link";
import { getJobsByVertical } from "@/lib/jobs";
import {
  HEALTHCARE_ROLE_TEMPLATES,
  NHS_BAND_SALARY_2025,
  VERTICAL_LABELS,
  formatGbp,
  UNSPLASH,
  SEO_ROLE_PAGES,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { UnsplashImage } from "@/components/UnsplashImage";
import { CompetitorCards } from "@/components/CompetitorComparison";
import { NhsBandLookup } from "@/components/NhsBandLookup";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Healthcare Jobs UK — Nurses, Care Assistants, HCAs",
  description:
    "Find NHS and care home jobs across the UK. Band 5 nurses, care assistants, HCAs, RMNs. Salary transparent. Apply free.",
  path: "/healthcare",
});

export default async function HealthcarePage() {
  const jobs = await getJobsByVertical("healthcare");

  return (
    <>
      <Hero
        image={UNSPLASH.hero.healthcare}
        badge="UK's #1 hiring vertical"
        title="Healthcare jobs across the UK"
        subtitle="NHS Band pay, CQC-registered employers, NMC/HCPC verified roles. Reed can't match our healthcare depth."
        primaryCta={{ label: `Browse ${jobs.length} jobs`, href: "/jobs?vertical=healthcare" }}
        secondaryCta={{ label: "Hire staff", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Built for healthcare hiring</h2>
            <p className="mt-3 text-slate-600">
              Unlike generic boards, Recruitment Site includes NMC, HCPC, DBS and NHS Band fields out of the box.
              Agencies charge 20–30% on locum rates — we charge a flat fee.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {["NMC verified", "DBS checked", "NHS Band pay", "CQC employers"].map((tag) => (
                <span key={tag} className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-brand text-center">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl">
            <UnsplashImage src={UNSPLASH.sections.careHome} alt="Care home" fill />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-slate-900">Popular roles & NHS pay bands</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HEALTHCARE_ROLE_TEMPLATES.map((role) => {
              const band = "nhsBand" in role.compliance ? role.compliance.nhsBand : undefined;
              const salary = band ? NHS_BAND_SALARY_2025[band] : null;
              const seoPage = SEO_ROLE_PAGES.find((p) =>
                p.title.toLowerCase().includes(role.title.split("(")[0].trim().toLowerCase().slice(0, 12)),
              );
              const Card = (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow h-full">
                  <h3 className="font-semibold text-slate-900">{role.title}</h3>
                  {salary && (
                    <p className="mt-1 text-sm font-semibold text-brand">
                      {formatGbp(salary.min)} – {formatGbp(salary.max)}/yr
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.compliance.dbsRequired && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">DBS</span>
                    )}
                    {"nmcRequired" in role.compliance && role.compliance.nmcRequired && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">NMC</span>
                    )}
                    {"hcpcRequired" in role.compliance && role.compliance.hcpcRequired && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">HCPC</span>
                    )}
                  </div>
                  {seoPage && (
                    <p className="mt-3 text-xs font-semibold text-brand">View all roles →</p>
                  )}
                </div>
              );
              return seoPage ? (
                <Link key={role.title} href={`/healthcare/${seoPage.slug}`}>
                  {Card}
                </Link>
              ) : (
                <div key={role.title}>{Card}</div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-xl font-bold text-slate-900">Latest {VERTICAL_LABELS.healthcare} jobs</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-xl font-bold text-white text-center mb-8">Why care homes choose Recruitment Site over Reed</h2>
          <CompetitorCards />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-8 lg:grid-cols-2 items-start">
        <div className="relative rounded-2xl overflow-hidden h-64">
          <UnsplashImage src={UNSPLASH.sections.nurse} alt="Nurse" fill />
        </div>
        <div className="space-y-6">
          <NhsBandLookup />
          <JobAlertSignup />
        </div>
      </section>
    </>
  );
}
