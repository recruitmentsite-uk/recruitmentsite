import Link from "next/link";
import { UNSPLASH, POPULAR_CITIES, cityToSlug, VERTICAL_LABELS } from "@placeuk/shared";
import { Hero } from "@/components/Hero";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Free Job Alerts UK — Daily Email Notifications",
  description:
    "Set up free UK job alerts by email. Get daily notifications for healthcare, trades and tech roles in your city. No account required.",
  path: "/job-alerts",
});

export default function JobAlertsPage() {
  return (
    <>
      <Hero
        image={UNSPLASH.sections.laptop}
        badge="Free · No account required"
        title="Never miss a role that matches you"
        subtitle="Daily email alerts for healthcare, trades and tech jobs in your city. Salary shown on every listing."
        align="left"
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">How job alerts work</h2>
            <ol className="mt-6 space-y-4">
              {[
                "Enter your email and choose your sector (healthcare, trades, tech or all)",
                "Select your city or region for local matches",
                "Receive a daily digest of new roles with salary shown upfront",
                "Apply free in under 5 minutes — unsubscribe anytime",
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-slate-600 pt-1">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <h3 className="font-semibold text-slate-900">Alerts by sector</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["healthcare", "trades", "tech"] as const).map((v) => (
                  <Link
                    key={v}
                    href={`/jobs?vertical=${v}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-700 hover:border-brand hover:text-brand"
                  >
                    {VERTICAL_LABELS[v]} alerts
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-slate-900">Alerts by city</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR_CITIES.map((city) => (
                  <Link
                    key={city}
                    href={`/jobs/${cityToSlug(city)}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-brand hover:text-brand"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Create your alert</h2>
            <p className="mt-2 text-sm text-slate-500">Free forever. Unsubscribe with one click.</p>
            <div className="mt-6">
              <JobAlertSignup />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
