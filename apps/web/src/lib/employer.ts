import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { getPlanByTier, type PlanTier } from "@placeuk/shared";

export interface EmployerContext {
  userId: string;
  email: string;
  employerId: string;
  companyName: string;
  slug: string;
  plan: PlanTier;
  role: "owner" | "admin" | "recruiter";
  cvDatabaseEnabled: boolean;
  stripeCustomerId: string | null;
  teamSeats: number;
  demo: boolean;
}

export async function getEmployerContext(): Promise<EmployerContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data: membership } = await admin
    .from("employer_users")
    .select("role, employer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership?.employer_id) {
    const { data: employerRow } = await admin
      .from("employers")
      .select("id, company_name, slug, plan, cv_database_enabled, contact_email, stripe_customer_id")
      .eq("id", membership.employer_id)
      .single();

    if (employerRow) {
      const plan = getPlanByTier(employerRow.plan as PlanTier);
      return {
        userId: user.id,
        email: user.email,
        employerId: employerRow.id,
        companyName: employerRow.company_name,
        slug: employerRow.slug,
        plan: employerRow.plan as PlanTier,
        role: membership.role as EmployerContext["role"],
        cvDatabaseEnabled: employerRow.cv_database_enabled,
        stripeCustomerId: employerRow.stripe_customer_id,
        teamSeats: plan?.teamSeats ?? 1,
        demo: false,
      };
    }
  }

  const { data: employerByEmail } = await admin
    .from("employers")
    .select("id, company_name, slug, plan, cv_database_enabled, stripe_customer_id")
    .eq("contact_email", user.email)
    .maybeSingle();

  if (employerByEmail) {
    await admin.from("employer_users").upsert(
      {
        employer_id: employerByEmail.id,
        user_id: user.id,
        role: "owner",
        accepted_at: new Date().toISOString(),
      },
      { onConflict: "employer_id,user_id" },
    );

    const plan = getPlanByTier(employerByEmail.plan as PlanTier);
    return {
      userId: user.id,
      email: user.email,
      employerId: employerByEmail.id,
      companyName: employerByEmail.company_name,
      slug: employerByEmail.slug,
      plan: employerByEmail.plan as PlanTier,
      role: "owner",
      cvDatabaseEnabled: employerByEmail.cv_database_enabled,
      stripeCustomerId: employerByEmail.stripe_customer_id,
      teamSeats: plan?.teamSeats ?? 1,
      demo: false,
    };
  }

  return null;
}

export async function requireEmployerContext(): Promise<EmployerContext> {
  const ctx = await getEmployerContext();
  if (ctx) return ctx;

  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    throw new Error("Unauthorized");
  }

  throw new Error("No employer account linked");
}
