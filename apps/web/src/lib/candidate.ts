import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface CandidateContext {
  id: string;
  email: string;
  fullName: string | null;
  city: string | null;
  headline: string | null;
  skills: string[];
  verticals: string[];
  phoneE164: string | null;
  smsEnabled: boolean;
  bio: string | null;
  experienceYears: number | null;
  linkedinUrl: string | null;
  cvStoragePath: string | null;
  rightToWorkUk: boolean;
}

export async function getCandidateContext(): Promise<CandidateContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("candidates")
    .select(
      "id, email, full_name, city, headline, skills, verticals, phone_e164, sms_enabled, bio, experience_years, linkedin_url, cv_storage_path, right_to_work_uk",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    city: data.city,
    headline: data.headline,
    skills: data.skills ?? [],
    verticals: data.verticals ?? [],
    phoneE164: data.phone_e164,
    smsEnabled: data.sms_enabled ?? false,
    bio: data.bio,
    experienceYears: data.experience_years,
    linkedinUrl: data.linkedin_url,
    cvStoragePath: data.cv_storage_path,
    rightToWorkUk: data.right_to_work_uk ?? false,
  };
}
