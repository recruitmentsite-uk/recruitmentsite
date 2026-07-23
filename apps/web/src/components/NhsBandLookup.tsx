"use client";

import { useState } from "react";
import { NHS_BAND_SALARY_2025, formatGbp } from "@placeuk/shared";

const BAND_LABELS: Record<string, string> = {
  "band-2": "Band 2 — HCA / Support",
  "band-3": "Band 3 — Clinical Support",
  "band-4": "Band 4 — Associate Practitioner",
  "band-5": "Band 5 — Registered Nurse",
  "band-6": "Band 6 — Specialist / RMN",
  "band-7": "Band 7 — Advanced / Manager",
  "band-8": "Band 8 — Consultant / Director",
};

export function NhsBandLookup() {
  const [band, setBand] = useState<string>("band-5");
  const salary = NHS_BAND_SALARY_2025[band];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <h3 className="font-semibold text-slate-900">NHS pay band lookup</h3>
      <p className="mt-1 text-sm text-slate-500">
        2025/26 Agenda for Change rates — every Recruitment Site healthcare job shows pay upfront.
      </p>
      <select
        value={band}
        onChange={(e) => setBand(e.target.value)}
        className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      >
        {Object.entries(BAND_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
      {salary && (
        <div className="mt-4 rounded-xl bg-teal-50 px-4 py-3">
          <p className="text-2xl font-bold text-brand">
            {salary.min === salary.max
              ? formatGbp(salary.min)
              : `${formatGbp(salary.min)} – ${formatGbp(salary.max)}`}
            <span className="text-base font-normal text-slate-600">/year</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Agenda for Change 2025/26 · England</p>
        </div>
      )}
    </div>
  );
}
