import Link from "next/link";
import {
  NHS_BAND_SALARY_2025,
  formatGbp,
  UNSPLASH,
  HEALTHCARE_ROLE_TEMPLATES,
} from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { NhsBandLookup } from "@/components/NhsBandLookup";
import { buildPageMetadata, faqJsonLd } from "@/lib/seo";

const BAND_LABELS: Record<string, string> = {
  "band-2": "Band 2 — HCA / Support Worker",
  "band-3": "Band 3 — Clinical Support",
  "band-4": "Band 4 — Associate Practitioner",
  "band-5": "Band 5 — Registered Nurse",
  "band-6": "Band 6 — Specialist / RMN / Physio",
  "band-7": "Band 7 — Advanced / Manager",
  "band-8": "Band 8 — Consultant / Director",
};

const FAQ = [
  {
    q: "What are NHS pay bands for 2025/26?",
    a: "NHS Agenda for Change pay bands range from Band 2 (£23,195) for HCAs to Band 8 (£54,265–£75,185) for consultants. Band 5 registered nurses earn £28,407–£34,581.",
  },
  {
    q: "Do all Recruitment Site healthcare jobs show NHS Band pay?",
    a: "Yes. Every healthcare listing requires salary disclosure. NHS Band roles show the relevant Agenda for Change rate.",
  },
  {
    q: "How do care home salaries compare to NHS bands?",
    a: "Care assistants typically earn £22,000–£28,000, similar to Band 2–3. Registered nurses in private care often match or exceed Band 5 NHS rates.",
  },
] as const;

export const metadata = buildPageMetadata({
  title: "NHS Band Salary Guide 2025/26 — Agenda for Change Pay",
  description:
    "Complete NHS pay band salary guide for 2025/26. Band 2–8 rates for nurses, HCAs, RMNs and allied health. Every Recruitment Site job shows pay upfront.",
  path: "/nhs-band-salary-guide",
});

export default function NhsBandSalaryGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }}
      />
      <Hero
        image={UNSPLASH.hero.healthcare}
        badge="2025/26 Agenda for Change"
        title="NHS pay band salary guide"
        subtitle="Band 2–8 rates for nurses, HCAs, RMNs and allied health professionals. Every Recruitment Site healthcare job shows pay upfront."
        primaryCta={{ label: "Browse healthcare jobs", href: "/healthcare" }}
        secondaryCta={{ label: "Nurse jobs", href: "/healthcare/nurse-jobs" }}
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900">NHS pay bands at a glance</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Agenda for Change sets NHS pay in England. Scotland, Wales and Northern Ireland use
              similar banding with regional variations. Use this guide when comparing roles on
              Recruitment Site — every listing shows the salary band.
            </p>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 text-left font-semibold text-slate-900">Band</th>
                    <th className="py-3 text-left font-semibold text-slate-900">Typical roles</th>
                    <th className="py-3 text-right font-semibold text-slate-900">Salary (2025/26)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(NHS_BAND_SALARY_2025).map(([band, salary]) => (
                    <tr key={band} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-brand capitalize">{band.replace("-", " ")}</td>
                      <td className="py-3 text-slate-600">{BAND_LABELS[band]}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {salary.min === salary.max
                          ? formatGbp(salary.min)
                          : `${formatGbp(salary.min)} – ${formatGbp(salary.max)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-12 text-xl font-bold text-slate-900">Healthcare roles by band</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {HEALTHCARE_ROLE_TEMPLATES.map((role) => {
                const band = "nhsBand" in role.compliance ? role.compliance.nhsBand : undefined;
                const salary = band ? NHS_BAND_SALARY_2025[band] : null;
                return (
                  <div key={role.title} className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="font-semibold text-slate-900">{role.title}</h3>
                    {salary && (
                      <p className="mt-1 text-sm font-semibold text-brand">
                        {formatGbp(salary.min)} – {formatGbp(salary.max)}/yr
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <aside className="space-y-6">
            <NhsBandLookup />
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Related pages</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/healthcare/nurse-jobs" className="text-brand hover:underline">Registered nurse jobs</Link></li>
                <li><Link href="/healthcare/hca-jobs" className="text-brand hover:underline">HCA jobs</Link></li>
                <li><Link href="/healthcare/rmn-jobs" className="text-brand hover:underline">RMN jobs</Link></li>
                <li><Link href="/salary-transparency" className="text-brand hover:underline">Salary transparency policy</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-bold text-slate-900">Frequently asked questions</h2>
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
    </>
  );
}
