import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getPlanByTier,
  type PlanTier,
  COMPANY_LEGAL_NAME,
  COMPANY_NUMBER,
  COMPANY_VAT_NUMBER,
  STRIPE_INVOICE_FOOTER,
} from "@placeuk/shared";
import { getStripe } from "@/lib/stripe";
import { grantScreeningCredits } from "@/lib/screening-credits";

async function updateEmployerByIdOrEmail(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  employerId: string | undefined,
  email: string | undefined,
  payload: Record<string, unknown>,
) {
  if (employerId) {
    await supabase.from("employers").update(payload).eq("id", employerId);
    return;
  }
  if (email) {
    await supabase.from("employers").update(payload).eq("contact_email", email);
  }
}

export async function POST(request: Request) {
  const stripe = await getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata ?? {};
    const customerId = typeof session.customer === "string" ? session.customer : null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

    if (customerId) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          footer: STRIPE_INVOICE_FOOTER,
          custom_fields: [
            { name: "Legal entity", value: COMPANY_LEGAL_NAME },
            { name: "Company No.", value: COMPANY_NUMBER },
            { name: "VAT No.", value: COMPANY_VAT_NUMBER },
          ],
        },
      }).catch(() => null);
    }

    if (metadata.type === "cv_database" && supabase && subscriptionId) {
      await updateEmployerByIdOrEmail(supabase, metadata.employerId, session.customer_email ?? undefined, {
        cv_database_enabled: true,
        cv_database_stripe_sub_id: subscriptionId,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      });
    } else if (metadata.type === "screening_credits" && supabase && metadata.employerId) {
      const credits = Number(metadata.credits || 0);
      if (credits > 0) {
        await grantScreeningCredits(
          supabase,
          metadata.employerId,
          credits,
          "stripe_purchase",
          session.id,
        );
        if (customerId) {
          await supabase
            .from("employers")
            .update({ stripe_customer_id: customerId })
            .eq("id", metadata.employerId);
        }
      }
    } else if (metadata.type === "boost" && supabase && metadata.jobId) {
      const featuredUntil = new Date(Date.now() + 7 * 86400000).toISOString();
      await supabase
        .from("jobs")
        .update({ featured: true, expires_at: featuredUntil })
        .eq("id", metadata.jobId);

      if (metadata.employerId) {
        const { data: employer } = await supabase
          .from("employers")
          .select("featured_slots_remaining")
          .eq("id", metadata.employerId)
          .single();
        if (employer && employer.featured_slots_remaining > 0) {
          await supabase
            .from("employers")
            .update({ featured_slots_remaining: employer.featured_slots_remaining - 1 })
            .eq("id", metadata.employerId);
        }
      }
    } else if (metadata.type === "payg" && supabase) {
      const paygPayload = {
        plan: "payg" as PlanTier,
        active_job_limit: 1,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      };

      if (metadata.employerId) {
        await supabase.from("employers").update(paygPayload).eq("id", metadata.employerId);
      } else if (session.customer_email) {
        const slug = session.customer_email.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase();
        const employerPayload = {
          company_name: session.customer_details?.name ?? "New Employer",
          slug: `${slug}-${Date.now().toString(36)}`,
          contact_email: session.customer_email,
          ...paygPayload,
        };

        const { data: existing } = await supabase
          .from("employers")
          .select("id")
          .eq("contact_email", session.customer_email)
          .maybeSingle();

        if (existing) {
          await supabase.from("employers").update(paygPayload).eq("id", existing.id);
        } else {
          await supabase.from("employers").insert(employerPayload);
        }
      }
    } else if (supabase && session.customer_email && subscriptionId) {
      const tier = (metadata.tier ?? "starter") as PlanTier;
      const plan = getPlanByTier(tier);
      const slug = session.customer_email.split("@")[0].replace(/[^a-z0-9]/gi, "-").toLowerCase();

      const employerPayload = {
        company_name: session.customer_details?.name ?? "New Employer",
        slug: `${slug}-${Date.now().toString(36)}`,
        plan: tier,
        contact_email: session.customer_email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        active_job_limit: plan?.activeJobLimit === "unlimited" ? 9999 : (plan?.activeJobLimit ?? 3),
        featured_slots_remaining: plan?.featuredSlotsPerMonth ?? 0,
      };

      if (metadata.employerId) {
        await supabase.from("employers").update(employerPayload).eq("id", metadata.employerId);
      } else {
        const { data: existing } = await supabase
          .from("employers")
          .select("id")
          .eq("contact_email", session.customer_email)
          .maybeSingle();

        if (existing) {
          await supabase.from("employers").update(employerPayload).eq("id", existing.id);
        } else {
          await supabase.from("employers").insert(employerPayload);
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated" && supabase) {
    const sub = event.data.object;
    const tier = (sub.metadata?.tier ?? null) as PlanTier | null;
    const plan = tier ? getPlanByTier(tier) : null;

    if (plan && sub.status === "active") {
      await supabase
        .from("employers")
        .update({
          plan: tier,
          active_job_limit: plan.activeJobLimit === "unlimited" ? 9999 : plan.activeJobLimit,
          featured_slots_remaining: plan.featuredSlotsPerMonth,
        })
        .eq("stripe_subscription_id", sub.id);
    }

    if (sub.metadata?.type === "cv_database" && sub.status === "active") {
      await supabase
        .from("employers")
        .update({ cv_database_enabled: true })
        .eq("cv_database_stripe_sub_id", sub.id);
    }
  }

  if (event.type === "customer.subscription.deleted" && supabase) {
    const sub = event.data.object;

    if (sub.metadata?.type === "cv_database") {
      await supabase
        .from("employers")
        .update({ cv_database_enabled: false, cv_database_stripe_sub_id: null })
        .eq("cv_database_stripe_sub_id", sub.id);
    } else {
      await supabase
        .from("employers")
        .update({ plan: "starter", active_job_limit: 0, stripe_subscription_id: null })
        .eq("stripe_subscription_id", sub.id);
    }
  }

  return NextResponse.json({ received: true });
}
