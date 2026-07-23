import Link from "next/link";
import { UNSPLASH, CV_RETENTION_DAYS, COMPANY_LEGAL_NOTICE } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { buildPageMetadata, faqJsonLd } from "@/lib/seo";

const FAQ = [
  {
    q: "Is Recruitment Site GDPR compliant for recruitment?",
    a: "Yes. We process candidate data under UK GDPR with clear consent at apply time, defined retention periods, and documented subprocessors in our privacy policy.",
  },
  {
    q: "How long are CVs retained?",
    a: `CVs are retained for ${CV_RETENTION_DAYS} days by default. Candidates can request deletion at any time under their right to erasure.`,
  },
  {
    q: "What right-to-work checks do employers need?",
    a: "UK employers must verify right to work before employment starts. Recruitment Site collects right-to-work status at apply time; employers verify documents at interview.",
  },
  {
    q: "What DBS level is required for healthcare roles?",
    a: "Regulated activity roles require Enhanced DBS with barred list checks. Recruitment Site includes DBS level fields on healthcare job posts.",
  },
  {
    q: "Do you share candidate data with third parties?",
    a: "Candidate data is shared only with the employer for roles applied to, and documented subprocessors (hosting, email). We never sell CV data.",
  },
] as const;

export const metadata = buildPageMetadata({
  title: "Employer Compliance — GDPR, DBS & Right to Work",
  description:
    "UK recruitment compliance guide for employers. GDPR, CV retention, DBS checks, right to work and NMC verification on Recruitment Site.",
  path: "/employer-compliance",
});

export default function EmployerCompliancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }}
      />
      <Hero
        image={UNSPLASH.hero.office}
        badge="Trust & compliance"
        title="Recruitment compliance for UK employers"
        subtitle="GDPR, DBS, right to work and professional registration — built into every healthcare job post."
        primaryCta={{ label: "View privacy policy", href: "/privacy" }}
        secondaryCta={{ label: "Healthcare hiring", href: "/healthcare" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "UK GDPR",
              body: "Lawful basis documented at apply time. CV retention of 365 days with erasure on request. Subprocessors listed in privacy policy.",
              link: "/privacy",
            },
            {
              title: "DBS & safeguarding",
              body: "Enhanced DBS fields on healthcare posts. Employers specify required level — basic, standard or enhanced with barred list.",
              link: "/healthcare",
            },
            {
              title: "Professional registration",
              body: "NMC for nurses, HCPC for allied health. Verification fields prompt candidates and filter unqualified applicants.",
              link: "/healthcare/nurse-jobs",
            },
            {
              title: "Right to work",
              body: "Right-to-work UK status collected at application. Employers complete document checks before start date per Home Office guidance.",
              link: "/terms",
            },
            {
              title: "CQC & regulated activity",
              body: "Care home employers can flag CQC registration. Job posts capture setting type for safeguarding compliance.",
              link: "/hire/care-assistants",
            },
            {
              title: "Data processing agreement",
              body: "Scale plan includes DPA for employers processing candidate data. Standard contractual clauses with EU subprocessors where applicable.",
              link: "/pricing",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.body}</p>
              <Link href={item.link} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-bold text-slate-900">Compliance FAQ</h2>
          <dl className="mt-6 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-slate-900">{item.q}</dt>
                <dd className="mt-2 text-slate-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center text-xs text-slate-500">
        <p>{COMPANY_LEGAL_NOTICE}</p>
      </section>
    </>
  );
}
