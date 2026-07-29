import type { SupabaseClient } from "@supabase/supabase-js";

export async function getScreeningBalance(
  supabase: SupabaseClient,
  employerId: string,
): Promise<number> {
  const { data } = await supabase
    .from("employers")
    .select("screening_credits")
    .eq("id", employerId)
    .maybeSingle();
  return data?.screening_credits ?? 0;
}

/** Debit 1 credit for AI screening. Returns false if balance insufficient. */
export async function debitScreeningCredit(
  supabase: SupabaseClient,
  employerId: string,
  applicationId: string | null,
  reason = "ai_screen",
): Promise<{ ok: boolean; balance: number }> {
  const { data: employer } = await supabase
    .from("employers")
    .select("screening_credits")
    .eq("id", employerId)
    .single();

  const balance = employer?.screening_credits ?? 0;
  if (balance < 1) {
    return { ok: false, balance };
  }

  const next = balance - 1;
  const { error } = await supabase
    .from("employers")
    .update({ screening_credits: next })
    .eq("id", employerId)
    .eq("screening_credits", balance);

  if (error) {
    return { ok: false, balance };
  }

  await supabase.from("screening_credit_ledger").insert({
    employer_id: employerId,
    delta: -1,
    balance_after: next,
    reason,
    application_id: applicationId,
  });

  return { ok: true, balance: next };
}

export async function grantScreeningCredits(
  supabase: SupabaseClient,
  employerId: string,
  credits: number,
  reason: string,
  stripeSessionId?: string,
): Promise<number> {
  const { data: employer } = await supabase
    .from("employers")
    .select("screening_credits")
    .eq("id", employerId)
    .single();

  const balance = employer?.screening_credits ?? 0;
  const next = balance + credits;

  await supabase.from("employers").update({ screening_credits: next }).eq("id", employerId);
  await supabase.from("screening_credit_ledger").insert({
    employer_id: employerId,
    delta: credits,
    balance_after: next,
    reason,
    stripe_session_id: stripeSessionId ?? null,
  });

  return next;
}

/** Extract rough skills/headline signals from CV text for talent enrichment */
export function extractProfileSignals(cvText: string): {
  skills: string[];
  headline: string | null;
  experienceYears: number | null;
} {
  const text = cvText.toLowerCase();
  const skillBank = [
    "nursing", "care", "hca", "nvq", "first aid", "medication",
    "javascript", "typescript", "react", "python", "sql", "aws",
    "plumbing", "electrical", "cscs", "welding", "carpentry",
    "recruitment", "sales", "customer service", "admin", "excel",
    "safeguarding", "manual handling", "dementia", "palliative",
  ];
  const skills = skillBank.filter((s) => text.includes(s)).slice(0, 12);

  const yearsMatch = text.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/);
  const experienceYears = yearsMatch ? Math.min(40, Number(yearsMatch[1])) : null;

  const firstLine = cvText.split(/\n/).map((l) => l.trim()).find((l) => l.length > 8 && l.length < 120);
  return {
    skills,
    headline: firstLine ?? null,
    experienceYears,
  };
}
