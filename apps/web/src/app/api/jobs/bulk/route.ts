import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getEmployerContext } from "@/lib/employer";
import type { Vertical } from "@placeuk/shared";

const SYSTEM_EMPLOYER_ID = "00000000-0000-0000-0000-000000000001";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "CSV file required" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows found in CSV" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const ctx = await getEmployerContext();

    if (!supabase || !ctx) {
      return NextResponse.json({ success: true, mode: "demo", imported: rows.length });
    }

    const needsReview = ctx.employerId !== SYSTEM_EMPLOYER_ID;
    const jobStatus = needsReview ? "pending_review" : "active";
    let imported = 0;

    for (const row of rows.slice(0, 50)) {
      const title = row.title;
      const description = row.description ?? title;
      const city = row.city ?? "London";
      const salaryMin = Number(row.salary_min ?? row.salarymin ?? 0);
      const salaryMax = Number(row.salary_max ?? row.salarymax ?? salaryMin);

      if (!title || !salaryMin) continue;

      const slug = `${slugify(title)}-${slugify(city)}-${Date.now().toString(36)}-${imported}`;

      const { error } = await supabase.from("jobs").insert({
        employer_id: ctx.employerId,
        slug,
        title,
        description,
        location: city,
        city,
        region: row.region ?? "England",
        vertical: (row.vertical as Vertical) ?? "general",
        salary_min: salaryMin,
        salary_max: salaryMax || salaryMin,
        salary_period: row.salary_period ?? "year",
        salary_disclosed: true,
        status: jobStatus,
        published_at: jobStatus === "active" ? new Date().toISOString() : null,
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      if (!error) imported++;
    }

    return NextResponse.json({ success: true, imported, pendingReview: needsReview });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
