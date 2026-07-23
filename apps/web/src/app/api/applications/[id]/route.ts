import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getEmployerContext } from "@/lib/employer";

const VALID_STATUSES = ["submitted", "reviewing", "shortlisted", "rejected", "hired"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ctx = await getEmployerContext();
    const supabase = getSupabaseAdmin();

    if (!supabase || !ctx) {
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const { data: app } = await supabase
      .from("applications")
      .select("id, job_id, jobs(employer_id)")
      .eq("id", id)
      .single();

    const job = app?.jobs as { employer_id: string } | { employer_id: string }[] | null;
    const employerId = Array.isArray(job) ? job[0]?.employer_id : job?.employer_id;

    if (!app || employerId !== ctx.employerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
