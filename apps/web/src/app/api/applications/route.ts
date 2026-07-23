import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SAMPLE_JOBS } from "@placeuk/shared";
import { scoreApplication } from "@/lib/matching";
import { getEmployerAtsWebhook, notifyAtsWebhook } from "@/lib/ats";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const coverNote = (formData.get("coverNote") as string) || null;
    const consent = formData.get("consent");
    const cvFile = formData.get("cv") as File | null;

    if (!jobId || !fullName || !email || !consent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!cvFile || cvFile.size === 0) {
      return NextResponse.json({ error: "CV is required" }, { status: 400 });
    }

    if (cvFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "CV must be under 5MB" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      const job = SAMPLE_JOBS.find((j) => j.id === jobId);
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      console.log(`[demo] Application: ${fullName} <${email}> for ${job.title}`);
      return NextResponse.json({ success: true, mode: "demo", matchScore: 72 });
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, description, employer_id, status")
      .eq("id", jobId)
      .single();

    if (!job || job.status !== "active") {
      return NextResponse.json({ error: "Job not found or not accepting applications" }, { status: 404 });
    }

    const cvPath = `applications/${jobId}/${Date.now()}-${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
    let cvText = coverNote ?? "";

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(cvPath, cvBuffer, { contentType: cvFile.type, upsert: false });

    if (uploadError) {
      console.error("CV upload failed:", uploadError);
      return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
    }

    if (cvFile.type === "text/plain" || cvFile.name.endsWith(".txt")) {
      cvText += "\n" + cvBuffer.toString("utf8").slice(0, 5000);
    }

    const match = await scoreApplication(job.description, cvText);

    const { data: application, error: insertError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        guest_name: fullName,
        guest_email: email,
        guest_cv_path: cvPath,
        cover_note: coverNote,
        status: "submitted",
        match_score: match.score,
        match_summary: match.summary,
      })
      .select("id, submitted_at")
      .single();

    if (insertError || !application) {
      return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
    }

    const atsUrl = await getEmployerAtsWebhook(supabase, job.employer_id);
    if (atsUrl) {
      await notifyAtsWebhook(atsUrl, {
        applicationId: application.id,
        jobId: job.id,
        jobTitle: job.title,
        candidateName: fullName,
        candidateEmail: email,
        matchScore: match.score,
        matchSummary: match.summary,
        coverNote,
        cvPath,
        appliedAt: application.submitted_at,
      });
    }

    if (process.env.RESEND_API_KEY) {
      const subject =
        match.score >= 70
          ? `Strong match (${match.score}/100): ${fullName} → ${job.title}`
          : `New application: ${fullName}`;

      await sendEmail({
        to: process.env.EMPLOYER_NOTIFY_EMAIL ?? "hello@recruitmentsite.co.uk",
        subject,
        text: `${fullName} (${email}) applied for ${job.title}.\n\nAI score: ${match.score}/100\n${match.summary}\n\nReview in your dashboard.`,
      });
    }

    return NextResponse.json({ success: true, matchScore: match.score });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
