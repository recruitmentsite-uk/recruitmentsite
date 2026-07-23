import { COMPETITORS, COMPETITOR_FEATURES } from "@placeuk/shared";

function FeatureCell({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-brand text-sm font-bold">
        ✓
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 text-sm">
        ✕
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">
        ~
      </span>
    );
  }
  return <span className="text-xs text-slate-500">{value}</span>;
}

export function CompetitorComparison({ highlight = "Recruitment Site" }: { highlight?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="p-4 text-left font-medium text-slate-500 w-48">Feature</th>
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
                <p className="mt-0.5 text-xs text-slate-400">{c.priceExample}</p>
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

export function CompetitorCards() {
  const ours = COMPETITORS[0];
  const others = COMPETITORS.slice(1, 3);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-2xl border-2 border-brand bg-gradient-to-br from-teal-50 to-white p-6 shadow-lg md:col-span-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white text-lg font-bold">
          {ours.logo}
        </div>
        <h3 className="mt-4 text-xl font-bold text-brand">{ours.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{ours.tagline}</p>
        <p className="mt-4 text-2xl font-bold text-slate-900">{ours.priceExample}</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span className="text-brand">✓</span> AI match scores on every applicant</li>
          <li className="flex gap-2"><span className="text-brand">✓</span> Unlimited posts on Growth</li>
          <li className="flex gap-2"><span className="text-brand">✓</span> Zero placement commission</li>
        </ul>
      </div>
      {others.map((c) => (
        <div key={c.name} className="rounded-2xl border border-slate-200 bg-white p-6 opacity-90">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 text-lg font-bold">
            {c.logo}
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-700">{c.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{c.tagline}</p>
          <p className="mt-4 text-lg font-semibold text-slate-600">{c.priceExample}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>✕ No AI scoring included</li>
            <li>✕ Per-listing or PPC costs</li>
            <li>✕ Generic, not vertical-focused</li>
          </ul>
        </div>
      ))}
    </div>
  );
}
