import Link from "next/link";
import { COMPETITORS, COMPETITOR_FEATURES } from "@placeuk/shared";

function FeatureCell({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-brand">
        ✓
      </span>
    );
  }
  if (value === "no") {
    return <span className="text-xs text-slate-400">—</span>;
  }
  if (value === "partial") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-mist text-xs font-semibold text-ink/50">
        ~
      </span>
    );
  }
  return <span className="text-xs text-slate-500">{value}</span>;
}

/** Feature matrix for dedicated /compare pages only — neutral cells, no trash-talk. */
export function CompetitorComparison({ highlight = "Recruitment Site" }: { highlight?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="w-48 p-4 text-left font-medium text-slate-500">Feature</th>
            {COMPETITORS.map((c) => (
              <th
                key={c.name}
                className={`p-4 text-center ${c.name === highlight ? "bg-teal-50" : ""}`}
              >
                <div
                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                    c.name === highlight
                      ? "bg-brand text-white shadow-md"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.logo}
                </div>
                <p className={`mt-2 font-semibold ${c.name === highlight ? "text-brand" : "text-slate-900"}`}>
                  {c.name}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPETITOR_FEATURES.map((feature, i) => (
            <tr key={feature} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
              <td className="p-4 font-medium text-slate-700">{feature}</td>
              {COMPETITORS.map((c) => (
                <td
                  key={c.name}
                  className={`p-4 text-center ${c.name === highlight ? "bg-teal-50/50" : ""}`}
                >
                  <FeatureCell value={c.features[feature] ?? "no"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EMPLOYER_FEATURES = [
  {
    title: "Salary on every listing",
    body: "Candidates see pay before they apply — clearer shortlists and fewer wasted conversations.",
  },
  {
    title: "AI match scores",
    body: "Every applicant is scored 0–100 against your role so you review the best fits first.",
  },
  {
    title: "Flat monthly pricing",
    body: "Unlimited posts on Growth. No placement commission. Predictable hiring cost for UK teams.",
  },
  {
    title: "Google Jobs included",
    body: "Structured JobPosting syndication goes out with every live role — no extra setup.",
  },
  {
    title: "Healthcare-ready fields",
    body: "NMC, DBS and NHS Band fields built in when you hire regulated clinical roles.",
  },
  {
    title: "Branded careers page",
    body: "Candidates apply under your brand on Growth — not lost in a generic feed.",
  },
] as const;

/** Feature-led employer sell — use on marketing pages instead of competitor trash-talk. */
export function EmployerFeatureGrid({
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className={`font-display text-2xl font-medium tracking-tight sm:text-3xl ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          Built for serious UK hiring
        </h2>
        <p className={`mt-3 text-sm leading-relaxed sm:text-base ${dark ? "text-white/60" : "text-ink/55"}`}>
          Flat monthly fee. Salary required on every job. AI match scores included. No agency commission.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EMPLOYER_FEATURES.map((f) => (
          <div
            key={f.title}
            className={`rounded-2xl border p-6 ${
              dark
                ? "border-white/10 bg-white/5"
                : "border-ink/8 bg-white shadow-sm"
            }`}
          >
            <p className={`font-semibold ${dark ? "text-white" : "text-ink"}`}>{f.title}</p>
            <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-white/55" : "text-ink/55"}`}>
              {f.body}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/onboarding"
          className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${
            dark
              ? "bg-white text-ink hover:bg-mist"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          Start hiring
        </Link>
      </div>
    </div>
  );
}

/** @deprecated Use EmployerFeatureGrid — kept as alias so existing imports keep working. */
export function CompetitorCards() {
  return <EmployerFeatureGrid tone="dark" />;
}
