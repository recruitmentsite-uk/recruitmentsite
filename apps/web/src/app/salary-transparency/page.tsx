import Link from "next/link";
import { UNSPLASH, SITE_NAME } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { buildPageMetadata, faqJsonLd } from "@/lib/seo";

const FAQ = [
  {
    q: "Why does Recruitment Site require salary on every job?",
    a: "Candidates skip roles without pay information. Requiring salary reduces wasted applications, improves candidate trust, and helps employers attract serious applicants.",
  },
  {
    q: "What salary information must employers provide?",
    a: "At minimum, a salary range (min–max) in GBP per year, hour, or day. Healthcare roles should include NHS Band where applicable.",
  },
  {
    q: "What if an employer wants to post without salary?",
    a: "We don’t publish listings without clear pay. Vague phrases like “competitive salary” are rejected so candidates always know the range before they apply.",
  },
  {
    q: "Can employers post 'competitive salary'?",
    a: "No. Vague phrases like 'competitive' or 'DOE' are not accepted. Specific ranges are required before a job goes live.",
  },
] as const;

export const metadata = buildPageMetadata({
  title: "Salary Transparency — Every Job Shows Pay Upfront",
  description:
    "Recruitment Site requires salary on every UK job listing. No 'competitive salary' or missing pay — clear compensation before you apply.",
  path: "/salary-transparency",
});

export default function SalaryTransparencyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }}
      />
      <Hero
        image={UNSPLASH.sections.laptop}
        badge="Our commitment"
        title="Every job shows the salary. No exceptions."
        subtitle={`${SITE_NAME} requires pay transparency on every listing — because candidates deserve to know before they apply.`}
        primaryCta={{ label: "Browse jobs with salary", href: "/jobs" }}
        secondaryCta={{ label: "Post a job", href: "/pricing" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Why salary transparency matters</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Over 60% of UK job seekers say they won&apos;t apply to roles without salary information.
              That&apos;s why we require a clear range on every listing — no &ldquo;competitive salary&rdquo;,
              no &ldquo;DOE&rdquo;, no missing pay.
            </p>
            <ul className="mt-6 space-y-3 text-slate-600">
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> Candidates apply only to roles within their expectations</li>
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> Employers get higher-quality, better-matched applicants</li>
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> Reduces pay gap opacity — especially in healthcare and trades</li>
              <li className="flex gap-2"><span className="text-brand font-bold">✓</span> NHS Band pay shown on every healthcare listing</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="font-bold text-slate-900">What we require</h3>
            <div className="mt-6 space-y-4">
              {[
                { label: "Minimum salary", required: true },
                { label: "Maximum salary", required: true },
                { label: "Pay period (year/hour/day)", required: true },
                { label: "NHS Band (healthcare roles)", required: "where applicable" },
              ].map((field) => (
                <div key={field.label} className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-700">{field.label}</span>
                  <span className="text-sm font-semibold text-brand">
                    {typeof field.required === "boolean" ? "Required" : field.required}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-teal-50 border-y border-teal-100 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">100% of listings show salary</h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Every role on Recruitment Site displays clear compensation before you click apply — no exceptions.
          </p>
          <Link href="/jobs" className="mt-8 inline-block rounded-xl bg-brand px-8 py-3 font-semibold text-white hover:bg-brand-dark">
            Browse transparent jobs
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-xl font-bold text-slate-900">FAQ</h2>
        <dl className="mt-6 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-2 text-slate-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
