import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SITE_NAME, UNSPLASH, getPlanByTier, type PlanTier } from "@placeuk/shared";
import { getSupabaseAdmin, mapDbJob } from "@/lib/supabase";
import { formatSalary } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";

interface CareersPageProps {
  params: Promise<{ slug: string }>;
}

async function getEmployerCareers(slug: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: employer } = await admin
    .from("employers")
    .select("id, company_name, slug, plan")
    .eq("slug", slug)
    .maybeSingle();

  if (!employer) return null;

  const plan = getPlanByTier(employer.plan as PlanTier);
  if (!plan?.careersSubdomain) return { employer, jobs: [], gated: true as const };

  const { data: jobs } = await admin
    .from("jobs")
    .select("*, employers(company_name)")
    .eq("employer_id", employer.id)
    .eq("status", "active")
    .order("published_at", { ascending: false });

  return {
    employer,
    jobs: (jobs ?? []).map((row) => mapDbJob(row)),
    gated: false as const,
  };
}

export async function generateMetadata({ params }: CareersPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEmployerCareers(slug);
  if (!data) return { title: "Careers" };
  return buildPageMetadata({
    title: `Careers at ${data.employer.company_name}`,
    description: `Open roles at ${data.employer.company_name}. Apply in under 5 minutes on ${SITE_NAME}.`,
    path: `/careers/${slug}`,
  });
}

const CAREERS_HEROES = [
  UNSPLASH.hero.team,
  UNSPLASH.hero.kitchen,
  UNSPLASH.hero.workshop,
  UNSPLASH.sections.handshake,
  UNSPLASH.sections.interview,
] as const;

function careersHeroForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i) * (i + 1)) % CAREERS_HEROES.length;
  return CAREERS_HEROES[hash];
}

export default async function PublicCareersPage({ params }: CareersPageProps) {
  const { slug } = await params;
  const data = await getEmployerCareers(slug);
  if (!data) notFound();

  const { employer, jobs, gated } = data;
  const hero = careersHeroForSlug(slug);

  return (
    <main className="min-h-screen bg-paper">
      <div data-hero className="relative -mt-[65px] h-72 md:h-80">
        <Image src={hero} alt="" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        <div className="absolute inset-0 flex items-end p-8 pt-28 md:p-12 md:pt-28">
          <div className="mx-auto w-full max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Careers at
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-white md:text-4xl">
              {employer.company_name}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {gated ? (
          <p className="border border-amber-200 bg-amber-50 p-6 text-amber-900">
            This branded careers page is available on Growth and Scale plans.
          </p>
        ) : (
          <>
            <p className="text-ink/60">
              Join {employer.company_name}. All roles show salary upfront. Apply in under 5 minutes.
            </p>
            <h2 className="mt-8 font-display text-xl font-medium text-ink">Open roles</h2>
            {jobs.length === 0 ? (
              <p className="mt-4 text-ink/45">No open roles right now. Check back soon.</p>
            ) : (
              <div className="mt-4 divide-y divide-ink/8 border-y border-ink/8 bg-white">
                {jobs.map((job) => (
                  <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
                    <div>
                      <p className="font-medium text-ink">{job.title}</p>
                      <p className="text-sm text-ink/50">
                        {job.city} · {formatSalary(job)}
                      </p>
                    </div>
                    <Link
                      href={`/jobs/${job.slug}?src=careers`}
                      className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
                    >
                      Apply
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <p className="mt-10 text-center text-xs text-ink/35">Powered by {SITE_NAME}</p>
      </div>
    </main>
  );
}
