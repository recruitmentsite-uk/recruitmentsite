import { NextResponse } from "next/server";
import { getEmployerContext } from "@/lib/employer";
import { getSupabaseAdmin } from "@/lib/supabase";

const DIMENSIONS = [
  "age_band",
  "gender",
  "ethnicity",
  "disability",
  "sexual_orientation",
  "religion_belief",
] as const;

const MIN_N = 5; // suppress cells below threshold

export async function GET() {
  const ctx = await getEmployerContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: rows, error } = await supabase
    .from("equality_monitoring_responses")
    .select("*")
    .eq("employer_id", ctx.employerId);

  if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  const total = rows?.length ?? 0;
  const lines = ["dimension,category,count,percent"];

  if (total === 0) {
    lines.push("total,all,0,0");
  } else {
    lines.push(`total,all,${total},100`);
    for (const dim of DIMENSIONS) {
      const counts = new Map<string, number>();
      for (const row of rows ?? []) {
        if (row.prefer_not_to_say) {
          counts.set("prefer_not_to_say", (counts.get("prefer_not_to_say") ?? 0) + 1);
          continue;
        }
        const value = (row[dim] as string) || "not_stated";
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      for (const [category, count] of counts) {
        if (count < MIN_N && category !== "prefer_not_to_say") continue;
        const percent = ((count / total) * 100).toFixed(1);
        lines.push(`${dim},${category},${count},${percent}`);
      }
    }
  }

  const csv = lines.join("\n") + "\n";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="equality-monitoring-${ctx.employerId.slice(0, 8)}.csv"`,
    },
  });
}
