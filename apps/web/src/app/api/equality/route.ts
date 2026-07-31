import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const ALLOWED = {
  age_band: ["16-24", "25-34", "35-44", "45-54", "55-64", "65+", "prefer_not_to_say"],
  gender: ["woman", "man", "non_binary", "prefer_not_to_say", "self_describe"],
  ethnicity: [
    "white",
    "mixed",
    "asian",
    "black",
    "other",
    "prefer_not_to_say",
  ],
  disability: ["yes", "no", "prefer_not_to_say"],
  sexual_orientation: ["heterosexual", "gay_lesbian", "bisexual", "other", "prefer_not_to_say"],
  religion_belief: [
    "no_religion",
    "christian",
    "muslim",
    "hindu",
    "sikh",
    "jewish",
    "buddhist",
    "other",
    "prefer_not_to_say",
  ],
} as const;

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit(`equality:${ip}`, 20, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { applicationId, jobId, preferNotToSay, ...fields } = body;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, mode: "demo" });
    }

    let employerId: string | null = null;
    let resolvedJobId: string | null = jobId || null;

    if (applicationId) {
      const { data: app } = await supabase
        .from("applications")
        .select("id, job_id, jobs(employer_id)")
        .eq("id", applicationId)
        .maybeSingle();
      if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
      resolvedJobId = app.job_id;
      const jobsRel = app.jobs as { employer_id?: string } | { employer_id?: string }[] | null;
      const job = Array.isArray(jobsRel) ? jobsRel[0] : jobsRel;
      employerId = job?.employer_id ?? null;
    } else if (jobId) {
      const { data: job } = await supabase.from("jobs").select("employer_id").eq("id", jobId).maybeSingle();
      employerId = job?.employer_id ?? null;
    }

    if (!employerId) {
      return NextResponse.json({ error: "Unable to resolve employer" }, { status: 400 });
    }

    const row: Record<string, unknown> = {
      employer_id: employerId,
      job_id: resolvedJobId,
      application_id: applicationId || null,
      prefer_not_to_say: Boolean(preferNotToSay),
    };

    if (!preferNotToSay) {
      for (const key of Object.keys(ALLOWED) as (keyof typeof ALLOWED)[]) {
        const value = fields[key];
        if (value && (ALLOWED[key] as readonly string[]).includes(value)) {
          row[key] = value;
        }
      }
    }

    const { error } = await supabase.from("equality_monitoring_responses").insert(row);
    if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
