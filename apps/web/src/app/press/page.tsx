import Link from "next/link";
import { SITE_NAME, SITE_DOMAIN, EMPLOYER_TAGLINE, liveSocialLinks } from "@placeuk/shared";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Press kit — Recruitment Site",
  description: `Boilerplate, brand assets, and contact for ${SITE_NAME}. Flat-fee UK hiring for employers.`,
  path: "/press",
});

export default function PressPage() {
  const social = liveSocialLinks();
  const siteUrl = `https://${SITE_DOMAIN}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Press & partners</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Recruitment Site press kit</h1>
      <p className="mt-4 text-lg text-slate-600 leading-relaxed">{EMPLOYER_TAGLINE}</p>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Boilerplate</h2>
        <p className="text-slate-700 leading-relaxed">
          {SITE_NAME} is a UK job board for employers who want predictable hiring costs. Businesses post
          unlimited roles on a flat monthly fee, get AI match scores on applicants, and reach candidates via
          Google Jobs syndication — with no agency placement commission. Candidates apply free.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Website:{" "}
          <a className="font-semibold text-brand underline-offset-2 hover:underline" href={siteUrl}>
            {SITE_DOMAIN}
          </a>
        </p>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Key facts</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          <li>Flat-fee employer plans from £99/mo; Growth unlimited posts at £249/mo</li>
          <li>30-day free trial for new employers</li>
          <li>AI applicant match scores (0–100) included</li>
          <li>Google Jobs syndication; Indeed / LinkedIn partner feeds in progress</li>
          <li>Focus sectors: care, hospitality, logistics, SME hiring across the UK</li>
        </ul>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Brand assets</h2>
        <ul className="space-y-2 text-slate-700">
          <li>
            <a className="text-brand underline-offset-2 hover:underline" href="/brand/rs-logo.svg">
              Logo (SVG)
            </a>
          </li>
          <li>
            <a className="text-brand underline-offset-2 hover:underline" href="/brand/social/avatar-800.png">
              Avatar 800×800
            </a>
          </li>
          <li>
            <a
              className="text-brand underline-offset-2 hover:underline"
              href="/brand/social/facebook-cover-1640x859.png"
            >
              Cover / social banner
            </a>
          </li>
          <li>
            <a className="text-brand underline-offset-2 hover:underline" href="/brand/bio.txt">
              Bios & handles
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Contact</h2>
        <p className="text-slate-700">
          Press / partnerships:{" "}
          <a className="font-semibold text-brand underline-offset-2 hover:underline" href="mailto:hello@recruitmentsite.co.uk">
            hello@recruitmentsite.co.uk
          </a>
        </p>
        {social.length > 0 && (
          <ul className="flex flex-wrap gap-4 text-sm">
            {social.map((s) => (
              <li key={s.key}>
                <a className="text-brand underline-offset-2 hover:underline" href={s.href} rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-900">For employers</h2>
        <p className="mt-2 text-slate-600">Ready to hire without agency fees?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            View pricing
          </Link>
          <Link
            href="/for-employers"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-brand"
          >
            Why Recruitment Site
          </Link>
        </div>
      </section>
    </main>
  );
}
