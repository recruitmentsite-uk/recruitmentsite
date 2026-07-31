import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { scoreApplication } from "@/lib/matching";
import { getEmployerAtsWebhook, notifyAtsWebhook } from "@/lib/ats";
import { sendEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";
import { debitScreeningCredit } from "@/lib/screening-credits";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const coverNote = (formData.get("coverNote") as string) || null;
    const consent = formData.get("consent");
    const cvFile = formData.get("cv") as File | null;
    const sourceRaw = formData.get("source");
    const source =
      typeof sourceRaw === "string" && sourceRaw.trim()
        ? sourceRaw.trim().slice(0, 40)
        : null;

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
      return NextResponse.json(
        { error: "Applications are temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("id, title, description, employer_id, status, employers(contact_email, company_name)")
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
        source,
      })
      .select("id, submitted_at")
      .single();

    if (insertError || !application) {
      return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
    }

    // Consume a screening credit when available; scoring still runs if balance is 0.
    await debitScreeningCredit(supabase, job.employer_id, application.id);

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
      const employerRel = job.employers as
        | { contact_email?: string | null; company_name?: string | null }
        | { contact_email?: string | null; company_name?: string | null }[]
        | null;
      const employer = Array.isArray(employerRel) ? employerRel[0] : employerRel;
      const notifyTo =
        employer?.contact_email ||
        process.env.EMPLOYER_NOTIFY_EMAIL ||
        "hello@recruitmentsite.co.uk";

      const subject =
        match.score >= 70
          ? `Strong match (${match.score}/100): ${fullName} → ${job.title}`
          : `New application: ${fullName}`;

      const siteUrl = getSiteUrl();
      const dashboardUrl = `${siteUrl}/dashboard/applications`;
      const scoreHtml = `<p style="margin:0 0 14px;padding:12px 14px;background:${match.score >= 70 ? "#f0fdfa" : "#f8fafc"};border-radius:10px;color:#0f172a">
          <strong style="color:#0f766e">AI match: ${match.score}/100</strong><br/>
          <span style="color:#475569;font-size:14px">${escapeHtml(match.summary || "")}</span>
        </p>`;

      await sendEmail({
        to: notifyTo,
        subject,
        text: `${fullName} (${email}) applied for ${job.title}.\n\nAI score: ${match.score}/100\n${match.summary}\n\nReview: ${dashboardUrl}`,
        branded: {
          title: subject,
          preheader: `${fullName} applied for ${job.title}`,
          hero: match.score >= 70 ? "growth" : "hiring",
          siteUrl,
          ctaLabel: "Review in dashboard",
          ctaUrl: dashboardUrl,
          bodyHtml: `
            <p style="margin:0 0 14px"><strong>${escapeHtml(fullName)}</strong>
              (<a href="mailto:${escapeHtml(email)}" style="color:#0f766e">${escapeHtml(email)}</a>)
              applied for <strong>${escapeHtml(job.title)}</strong>${employer?.company_name ? ` at ${escapeHtml(employer.company_name)}` : ""}.</p>
            ${scoreHtml}
          `,
        },
      });
    }

    return NextResponse.json({
      success: true,
      matchScore: match.score,
      applicationId: application.id,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
