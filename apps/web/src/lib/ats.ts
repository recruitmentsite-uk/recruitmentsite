interface AtsPayload {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  matchScore: number | null;
  matchSummary: string | null;
  coverNote: string | null;
  cvPath: string | null;
  appliedAt: string;
}

export async function notifyAtsWebhook(webhookUrl: string, payload: AtsPayload): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "application.created", data: payload }),
    });
  } catch (err) {
    console.error("ATS webhook failed:", err);
  }
}

export async function getEmployerAtsWebhook(
  supabase: NonNullable<ReturnType<typeof import("@/lib/supabase").getSupabaseAdmin>>,
  employerId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("employers")
    .select("ats_webhook_url")
    .eq("id", employerId)
    .single();
  return data?.ats_webhook_url ?? null;
}
