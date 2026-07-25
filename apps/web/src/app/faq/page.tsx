import Link from "next/link";
import { FAQ_ITEMS } from "@placeuk/shared";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about Recruitment Site pricing, AI scoring, GDPR, ATS integration, and employer features.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <h1 className="text-3xl font-bold text-slate-900">Frequently asked questions</h1>
      <p className="mt-3 text-slate-600">
        Everything candidates and employers ask before getting started.
      </p>

      <dl className="mt-10 space-y-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <dt className="font-semibold text-slate-900">{item.q}</dt>
            <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>

      <aside className="mt-12 rounded-2xl bg-teal-50 border border-teal-200 p-6 text-center">
        <p className="font-semibold text-brand">Still have questions?</p>
        <p className="mt-2 text-sm text-slate-600">Read our guides or explore employer features and pricing.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/blog" className="text-sm font-semibold text-brand underline">Hiring guides</Link>
          <Link href="/for-employers" className="text-sm font-semibold text-brand underline">Employer features</Link>
          <Link href="/privacy" className="text-sm font-semibold text-brand underline">Privacy policy</Link>
        </div>
      </aside>
    </div>
  );
}
