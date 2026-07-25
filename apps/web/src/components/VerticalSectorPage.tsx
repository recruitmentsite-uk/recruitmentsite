import Link from "next/link";
import {
  VERTICAL_META,
  formatGbp,
  getVerticalImage,
  getRolePagesByVertical,
  type BrowseVertical,
} from "@placeuk/shared";
import { getJobsByVertical } from "@/lib/jobs";
import { Hero } from "@/components/Hero";
import { JobCard } from "@/components/JobCard";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { UnsplashImage } from "@/components/UnsplashImage";

interface VerticalSectorPageProps {
  vertical: BrowseVertical;
}

export async function VerticalSectorPage({ vertical }: VerticalSectorPageProps) {
  const meta = VERTICAL_META[vertical];
  const jobs = await getJobsByVertical(vertical);
  const roles = getRolePagesByVertical(vertical);
  const templates = meta.roleTemplates;

  return (
    <>
      <Hero
        image={getVerticalImage(vertical)}
        badge={meta.shortLabel}
        title={`${meta.label} jobs across the UK`}
        subtitle={meta.heroSubtitle}
        primaryCta={{
          label: `Browse ${jobs.length} jobs`,
          href: `/jobs?vertical=${vertical}`,
        }}
        secondaryCta={{ label: "Hire in this sector", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
              Built for {meta.shortLabel.toLowerCase()} hiring
            </h2>
            <p className="mt-3 text-ink/60">{meta.blurb}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-brand/5 px-3 py-2 text-center text-sm font-medium text-brand"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative h-64 overflow-hidden shadow-lift">
            <UnsplashImage src={getVerticalImage(vertical)} alt={meta.label} fill />
          </div>
        </div>
      </section>

      {(templates.length > 0 || roles.length > 0) && (
        <section className="border-y border-ink/8 bg-mist/50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-xl font-medium tracking-tight text-ink">Popular roles</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.length > 0
                ? roles.map((role) => (
                    <Link
                      key={role.slug}
                      href={`${meta.path}/${role.slug}`}
                      className="rounded-xl border border-ink/8 bg-white p-5 transition hover:border-brand/30 hover:shadow-lift"
                    >
                      <h3 className="font-semibold text-ink">{role.title.replace(" UK", "")}</h3>
                      {role.salaryMin && role.salaryMax && (
                        <p className="mt-1 text-sm font-semibold text-brand">
                          {formatGbp(role.salaryMin)} – {formatGbp(role.salaryMax)}/yr
                        </p>
                      )}
                      <p className="mt-2 text-sm text-ink/50">{role.tags.slice(0, 3).join(" · ")}</p>
                    </Link>
                  ))
                : templates.map((role) => (
                    <div
                      key={role.title}
                      className="rounded-xl border border-ink/8 bg-white p-5"
                    >
                      <h3 className="font-semibold text-ink">{role.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-brand">
                        {formatGbp(role.salary.min)} – {formatGbp(role.salary.max)}/yr
                      </p>
                      <p className="mt-2 text-sm text-ink/50">{role.tags.slice(0, 3).join(" · ")}</p>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-medium tracking-tight text-ink">Open roles</h2>
          <Link href={`/jobs?vertical=${vertical}`} className="text-sm font-semibold text-brand">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {jobs.slice(0, 6).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        {jobs.length === 0 && (
          <p className="mt-8 text-ink/50">
            No {meta.shortLabel.toLowerCase()} roles live yet —{" "}
            <Link href="/job-alerts" className="font-semibold text-brand hover:underline">
              set up an alert
            </Link>
            .
          </p>
        )}
      </section>

      <section className="border-t border-ink/8 bg-mist/40 py-16">
        <div className="mx-auto max-w-lg px-4">
          <h2 className="font-display text-xl font-medium text-ink">Get {meta.shortLabel.toLowerCase()} alerts</h2>
          <p className="mt-2 text-sm text-ink/50">Free daily email when matching roles go live.</p>
          <div className="mt-6">
            <JobAlertSignup />
          </div>
        </div>
      </section>
    </>
  );
}
