import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getEmployerContext } from "@/lib/employer";
import type { Vertical } from "@placeuk/shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getEmployerContext();
    const supabase = getSupabaseAdmin();

    if (!supabase || !ctx) {
      return NextResponse.json({ error: "Not available in demo mode" }, { status: 503 });
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("employer_id", ctx.employerId)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const ctx = await getEmployerContext();
    const supabase = getSupabaseAdmin();

    if (!supabase || !ctx) {
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("id, employer_id")
      .eq("id", id)
      .single();

    if (!job || job.employer_id !== ctx.employerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.title) updates.title = body.title;
    if (body.description) updates.description = body.description;
    if (body.city) {
      updates.city = body.city;
      updates.location = body.city;
    }
    if (body.vertical) updates.vertical = body.vertical as Vertical;
    if (body.salaryMin != null) updates.salary_min = Number(body.salaryMin);
    if (body.salaryMax != null) updates.salary_max = Number(body.salaryMax);
    if (body.salaryPeriod) updates.salary_period = body.salaryPeriod;
    if (body.status && ["active", "paused", "expired", "filled", "pending_review"].includes(body.status)) {
      updates.status = body.status;
      if (body.status === "active") {
        updates.published_at = new Date().toISOString();
      }
    }

    const { error } = await supabase.from("jobs").update(updates).eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ctx = await getEmployerContext();
    const supabase = getSupabaseAdmin();

    if (!supabase || !ctx) {
      return NextResponse.json({ success: true, mode: "demo" });
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("id, employer_id")
      .eq("id", id)
      .single();

    if (!job || job.employer_id !== ctx.employerId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("jobs")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
