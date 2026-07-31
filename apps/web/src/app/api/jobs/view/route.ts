import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit(`view:${ip}`, 60, 60_000)) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();
    const jobId = typeof body.jobId === "string" ? body.jobId : "";
    const source = typeof body.source === "string" ? body.source.slice(0, 40) : null;
    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ ok: true, mode: "demo" });
    }

    const { error } = await supabase.rpc("increment_job_view", {
      p_job_id: jobId,
      p_source: source,
    });

    if (error) {
      const { data } = await supabase
        .from("jobs")
        .select("view_count")
        .eq("id", jobId)
        .maybeSingle();
      await supabase
        .from("jobs")
        .update({ view_count: (data?.view_count ?? 0) + 1 })
        .eq("id", jobId);
      await supabase.from("job_events").insert({
        job_id: jobId,
        event_type: "view",
        source,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
