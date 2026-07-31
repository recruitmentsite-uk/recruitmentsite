import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getVerticalImage,
  UNSPLASH,
  isCitySlug,
  slugToCity,
  getCitySeoTitle,
  getCitySeoDescription,
  POPULAR_CITIES,
  cityToSlug,
} from "@placeuk/shared";
import { getJobBySlug, getAllJobSlugs, getJobs, getSiteUrl } from "@/lib/jobs";
import { formatSalary } from "@/lib/format";
import { JobPostingSchema } from "@/components/JobPostingSchema";
import { ApplyForm } from "@/components/ApplyForm";
import { TrackJobView } from "@/components/TrackJobView";
import { UnsplashImage } from "@/components/UnsplashImage";
import { CityJobLanding } from "@/components/SeoLandingPages";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs();
  const citySlugs = POPULAR_CITIES.map((c) => cityToSlug(c));
  return [...slugs, ...citySlugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isCitySlug(slug)) {
    const city = slugToCity(slug);
    return buildPageMetadata({
      title: getCitySeoTitle(city),
      description: getCitySeoDescription(city),
      path: `/jobs/${slug}`,
    });
  }

  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };

  const salary = formatSalary(job);
  const url = `${getSiteUrl()}/jobs/${slug}`;
  return {
    title: `${job.title} — ${job.city}`,
    description: `${job.title} at ${job.employerName} in ${job.city}. ${salary}. Apply free on Recruitment Site.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${job.title} — ${job.city}`,
      description: job.description.slice(0, 160),
      type: "website",
      url,
    },
  };
}

export default async function JobDetailPage({ params, searchParams }: JobDetailPageProps) {
  const { slug } = await params;
  const { src } = await searchParams;

  if (isCitySlug(slug)) {
    const city = slugToCity(slug);
    const jobs = await getJobs({ city });
    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Jobs", url: "/jobs" },
      { name: city },
    ];

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
        />
        <CityJobLanding
          city={city}
          jobs={jobs}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Jobs", href: "/jobs" },
            { label: city },
          ]}
          heroImage={UNSPLASH.hero.commute}
        />
      </>
    );
  }

  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const siteUrl = getSiteUrl();
  const source = typeof src === "string" ? src.slice(0, 40) : undefined;

  return (
    <>
      <TrackJobView jobId={job.id} source={source} />
      <JobPostingSchema job={job} siteUrl={siteUrl} />

      <div data-hero className="relative -mt-[65px] h-64 overflow-hidden sm:h-72">
        <UnsplashImage
          src={getVerticalImage(job.vertical)}
          alt={job.title}
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end px-4 pb-8 pt-28">
          {job.featured && (
            <span className="mb-2 inline-block w-fit rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-amber-900">
              Featured
            </span>
          )}
          <h1 className="font-display text-2xl font-medium tracking-tight text-white sm:text-3xl">
            {job.title}
          </h1>
          <p className="mt-1 text-white/70">
            {job.employerName} · {job.city}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/jobs" className="text-sm font-medium text-brand hover:underline">
          ← Back to jobs
        </Link>

        <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Location", value: `${job.location}, ${job.city}` },
              { label: "Salary", value: formatSalary(job), highlight: true },
              { label: "Type", value: job.jobType.replace("_", " ") },
              { label: "Working pattern", value: job.remote },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.label}</dt>
                <dd className={`mt-1 font-semibold capitalize ${item.highlight ? "text-brand text-lg" : "text-slate-900"}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <h2 className="font-semibold text-slate-900">About the role</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">{job.description}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-brand">
                {skill}
              </span>
            ))}
          </div>

          <ApplyForm jobId={job.id} jobTitle={job.title} source={source} />

          <p className="mt-6 text-xs text-slate-400">
            {job.applicationCount} applications · Posted{" "}
            {new Date(job.publishedAt).toLocaleDateString("en-GB")}
          </p>
        </article>
      </div>
    </>
  );
}
