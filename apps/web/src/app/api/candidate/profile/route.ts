import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeUkPhone } from "@/lib/sms";
import { extractCvText } from "@/lib/cv-text";
import { extractProfileSignals } from "@/lib/screening-credits";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin.from("candidates").select("*").eq("id", user.id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not a candidate" }, { status: 404 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.fullName !== undefined) updates.full_name = body.fullName;
    if (body.city !== undefined) updates.city = body.city || null;
    if (body.headline !== undefined) updates.headline = body.headline || null;
    if (body.bio !== undefined) updates.bio = body.bio || null;
    if (body.linkedinUrl !== undefined) updates.linkedin_url = body.linkedinUrl || null;
    if (body.experienceYears !== undefined) updates.experience_years = body.experienceYears;
    if (body.rightToWorkUk !== undefined) updates.right_to_work_uk = Boolean(body.rightToWorkUk);
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.verticals !== undefined) updates.verticals = body.verticals;
    if (body.phone !== undefined) {
      const phone = body.phone ? normalizeUkPhone(String(body.phone)) : null;
      updates.phone_e164 = phone;
      if (!phone) updates.sms_enabled = false;
    }
    if (body.smsEnabled !== undefined) updates.sms_enabled = Boolean(body.smsEnabled);

    const { error } = await admin.from("candidates").update(updates).eq("id", user.id);
    if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    // Keep talent pool in sync
    const { data: profile } = await admin.from("candidates").select("*").eq("id", user.id).single();
    if (profile) {
      await admin.from("talent_profiles").upsert(
        {
          email: profile.email.toLowerCase(),
          candidate_id: user.id,
          full_name: profile.full_name,
          headline: profile.headline,
          city: profile.city,
          skills: profile.skills ?? [],
          verticals: profile.verticals ?? [],
          right_to_work_uk: profile.right_to_work_uk,
          phone_e164: profile.phone_e164,
          experience_years: profile.experience_years,
          bio: profile.bio,
          cv_storage_path: profile.cv_storage_path,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // CV upload
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const formData = await request.formData();
    const cvFile = formData.get("cv") as File | null;
    if (!cvFile || cvFile.size === 0) {
      return NextResponse.json({ error: "CV required" }, { status: 400 });
    }
    if (cvFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "CV must be under 5MB" }, { status: 400 });
    }

    const cvPath = `candidates/${user.id}/${Date.now()}-${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("cvs")
      .upload(cvPath, buffer, { contentType: cvFile.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const cvText = (await extractCvText(buffer, cvFile.name, cvFile.type)) || "";
    const signals = extractProfileSignals(cvText);

    await admin
      .from("candidates")
      .update({
        cv_storage_path: cvPath,
        cv_text: cvText.slice(0, 20000),
        skills: signals.skills.length ? signals.skills : undefined,
        headline: signals.headline,
        experience_years: signals.experienceYears,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    const { data: profile } = await admin.from("candidates").select("email, full_name, city, skills, verticals, right_to_work_uk, phone_e164, experience_years, bio, headline").eq("id", user.id).single();
    if (profile) {
      await admin.from("talent_profiles").upsert(
        {
          email: profile.email.toLowerCase(),
          candidate_id: user.id,
          full_name: profile.full_name,
          headline: profile.headline || signals.headline,
          city: profile.city,
          skills: signals.skills.length ? signals.skills : profile.skills ?? [],
          verticals: profile.verticals ?? [],
          right_to_work_uk: profile.right_to_work_uk,
          phone_e164: profile.phone_e164,
          experience_years: signals.experienceYears ?? profile.experience_years,
          bio: profile.bio,
          cv_storage_path: cvPath,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
    }

    return NextResponse.json({ success: true, skills: signals.skills });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
