import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getEmployerContext } from "@/lib/employer";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";

export async function GET() {
  const ctx = await getEmployerContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data } = await supabase
    .from("video_screenings")
    .select("id, candidate_email, candidate_name, status, invited_at, submitted_at, job_id, application_id, prompt")
    .eq("employer_id", ctx.employerId)
    .order("invited_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ screenings: data ?? [] });
}

export async function POST(request: Request) {
  const ctx = await getEmployerContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = await request.json();
  const { applicationId, jobId, candidateEmail, candidateName, prompt } = body;

  if (!candidateEmail) {
    return NextResponse.json({ error: "Candidate email required" }, { status: 400 });
  }

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("video_screenings")
    .insert({
      employer_id: ctx.employerId,
      job_id: jobId || null,
      application_id: applicationId || null,
      candidate_email: candidateEmail,
      candidate_name: candidateName || null,
      invite_token: token,
      prompt:
        prompt ||
        "Please introduce yourself and explain why you are a good fit for this role (2–3 minutes).",
      status: "invited",
    })
    .select("id, invite_token")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  const link = `${getSiteUrl()}/screen/${token}`;
  await sendEmail({
    to: candidateEmail,
    subject: `Video interview invite from ${ctx.companyName}`,
    text: `Hi${candidateName ? ` ${candidateName}` : ""},\n\n${ctx.companyName} has invited you to complete a short video screening.\n\nOpen this link (valid 14 days):\n${link}\n\nRecord a short video answering their prompt and submit it.`,
  });

  return NextResponse.json({ success: true, id: data.id, link });
}
