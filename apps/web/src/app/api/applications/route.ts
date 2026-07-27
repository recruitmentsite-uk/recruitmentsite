import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { scoreApplication } from "@/lib/matching";
import { getEmployerAtsWebhook, notifyAtsWebhook } from "@/lib/ats";
import { sendEmail } from "@/lib/email";
import { extractCvText } from "@/lib/cv-text";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { debitScreeningCredit, extractProfileSignals } from "@/lib/screening-credits";
import { getSiteUrl } from "@/lib/site";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!rateLimit(`apply:${ip}`, 8, 60 * 60_000)) {
      return NextResponse.json(
        { error: "Too many applications from this network. Please try again later." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const jobId = formData.get("jobId") as string;
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const coverNote = (formData.get("coverNote") as string) || null;
    const consent = formData.get("consent");
    const sourceRaw = formData.get("source");
    const source =
      typeof sourceRaw === "string" && sourceRaw.trim()
        ? sourceRaw.trim().slice(0, 40)
        : "direct";
    const rightToWork = formData.get("rightToWork") === "on" || formData.get("rightToWork") === "true";
    const talentPool = formData.get("talentPool") === "on" || formData.get("talentPool") === "true";
    const cvFile = formData.get("cv") as File | null;

    if (!jobId || !fullName || !email || !consent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!rateLimit(`apply-email:${email.toLowerCase()}`, 5, 60 * 60_000)) {
      return NextResponse.json(
        { error: "Too many applications for this email. Please try again later." },
        { status: 429 },
      );
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
      .select("id, title, description, employer_id, status, city, vertical, employers(contact_email, company_name)")
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

    const extracted = await extractCvText(cvBuffer, cvFile.name, cvFile.type);
    if (extracted) cvText += "\n" + extracted;
    const signals = extractProfileSignals(cvText);

    // Debit screening credit when available; otherwise save without AI score
    let match = { score: null as number | null, summary: null as string | null };
    const debit = await debitScreeningCredit(supabase, job.employer_id, null, "ai_screen");
    if (debit.ok) {
      const scored = await scoreApplication(job.description, cvText);
      match = { score: scored.score, summary: scored.summary };
    }

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
        right_to_work_uk: rightToWork,
      })
      .select("id, submitted_at")
      .single();

    if (insertError || !application) {
      return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
    }

    await supabase.from("job_events").insert({
      job_id: jobId,
      event_type: "apply",
      source,
    });

    if (talentPool) {
      await supabase.from("talent_profiles").upsert(
        {
          email: email.toLowerCase(),
          full_name: fullName,
          headline:
            signals.headline ||
            coverNote?.slice(0, 160) ||
            `Applicant for ${job.title}`,
          city: job.city ?? null,
          skills: signals.skills,
          verticals: job.vertical ? [job.vertical] : [],
          right_to_work_uk: rightToWork,
          experience_years: signals.experienceYears,
          cv_storage_path: cvPath,
          source_application_id: application.id,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
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
      const employerRel = job.employers as
        | { contact_email?: string | null; company_name?: string | null }
        | { contact_email?: string | null; company_name?: string | null }[]
        | null;
      const employer = Array.isArray(employerRel) ? employerRel[0] : employerRel;
      const notifyTo =
        employer?.contact_email ||
        process.env.EMPLOYER_NOTIFY_EMAIL ||
        "hello@recruitmentsite.co.uk";

      const scoreLabel =
        match.score != null
          ? `AI score: ${match.score}/100\n${match.summary}`
          : "AI screening skipped (no screening credits). Buy credits in Billing.";

      const subject =
        match.score != null && match.score >= 70
          ? `Strong match (${match.score}/100): ${fullName} → ${job.title}`
          : `New application: ${fullName}`;

      const siteUrl = getSiteUrl();
      const dashboardUrl = `${siteUrl}/dashboard/applications`;
      const scoreHtml =
        match.score != null
          ? `<p style="margin:0 0 14px;padding:12px 14px;background:${match.score >= 70 ? "#f0fdfa" : "#f8fafc"};border-radius:10px;color:#0f172a">
              <strong style="color:#0f766e">AI match: ${match.score}/100</strong><br/>
              <span style="color:#475569;font-size:14px">${escapeHtml(match.summary || "")}</span>
            </p>`
          : `<p style="margin:0 0 14px;color:#64748b;font-size:14px">AI screening skipped (no screening credits). Buy credits in Billing.</p>`;

      await sendEmail({
        to: notifyTo,
        subject,
        text: `${fullName} (${email}) applied for ${job.title}.\n\n${scoreLabel}\n\nSource: ${source}\nReview: ${dashboardUrl}`,
        branded: {
          title: subject,
          preheader: `${fullName} applied for ${job.title}`,
          hero: match.score != null && match.score >= 70 ? "growth" : "hiring",
          siteUrl,
          ctaLabel: "Review in dashboard",
          ctaUrl: dashboardUrl,
          bodyHtml: `
            <p style="margin:0 0 14px"><strong>${escapeHtml(fullName)}</strong>
              (<a href="mailto:${escapeHtml(email)}" style="color:#0f766e">${escapeHtml(email)}</a>)
              applied for <strong>${escapeHtml(job.title)}</strong>${employer?.company_name ? ` at ${escapeHtml(employer.company_name)}` : ""}.</p>
            ${scoreHtml}
            <p style="margin:0;font-size:13px;color:#94a3b8">Source: ${escapeHtml(source)}</p>
          `,
        },
      });
    }

    return NextResponse.json({
      success: true,
      matchScore: match.score,
      screened: debit.ok,
      applicationId: application.id,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
