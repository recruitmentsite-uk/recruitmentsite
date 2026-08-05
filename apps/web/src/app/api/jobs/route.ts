import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getEmployerContext } from "@/lib/employer";
import type { Vertical } from "@placeuk/shared";

const SYSTEM_EMPLOYER_ID = "00000000-0000-0000-0000-000000000001";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, city, vertical, salaryMin, salaryMax, salaryPeriod } = body;

    if (!title || !description || !city || !salaryMin || !salaryMax) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = `${slugify(title)}-${slugify(city)}-${Date.now().toString(36)}`;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.log(`[demo] Job posted: ${title} in ${city}`);
      return NextResponse.json({
        success: true,
        mode: "demo",
        job: { slug, title, city, vertical: vertical ?? "general" },
      });
    }

    const ctx = await getEmployerContext();

    let employerId = ctx?.employerId;
    if (!employerId) {
      const { data: employer } = await supabase.from("employers").select("id").limit(1).single();
      employerId = employer?.id;
    }

    if (!employerId) {
      return NextResponse.json(
        { error: "No employer account found. Sign up or complete onboarding." },
        { status: 400 },
      );
    }

    let paidPlan = false;
    if (ctx) {
      const { count: activeCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("employer_id", employerId)
        .eq("status", "active");

      const { data: employerRow } = await supabase
        .from("employers")
        .select("active_job_limit, plan")
        .eq("id", employerId)
        .single();

      paidPlan =
        employerRow?.plan === "growth" || employerRow?.plan === "scale";

      const limit = employerRow?.active_job_limit ?? 3;
      if (!paidPlan && (activeCount ?? 0) >= limit) {
        return NextResponse.json(
          { error: `Active job limit reached (${limit}). Upgrade your plan.` },
          { status: 400 },
        );
      }
    }

    // Paid/trial plans go live immediately; free Starter stays in moderation.
    const needsReview = employerId !== SYSTEM_EMPLOYER_ID && !paidPlan;
    const jobStatus = needsReview ? "pending_review" : "active";

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        employer_id: employerId,
        slug,
        title,
        description,
        location: city,
        city,
        region: "England",
        vertical: (vertical as Vertical) ?? "general",
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        salary_period: salaryPeriod ?? "year",
        salary_disclosed: true,
        status: jobStatus,
        published_at: jobStatus === "active" ? new Date().toISOString() : null,
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
      .select("slug, title, id, status")
      .single();

    if (error) {
      console.error("Job insert failed:", error);
      return NextResponse.json({ error: "Failed to publish job" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      job,
      pendingReview: needsReview,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
