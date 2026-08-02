import { NextResponse } from "next/server";
import {
  FEATURED_BOOST_PRICE,
  CV_DATABASE_ADDON_PRICE,
  PRICING_PLANS,
  PAYG_JOB_POST_PRICE,
  FREE_TRIAL_DAYS,
  SCREENING_CREDIT_PACKS,
} from "@placeuk/shared";
import { getSiteUrl } from "@/lib/site";
import { getEmployerContext } from "@/lib/employer";
import { checkoutCustomerParams, getStripe } from "@/lib/stripe";
import { stripeCheckoutCustomText, stripeProductData } from "@/lib/stripe-checkout";

export async function POST(request: Request) {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env.local" },
        { status: 503 },
      );
    }

    const siteUrl = getSiteUrl();
    const {
      tier,
      interval = "month",
      type,
      jobId,
      credits,
      skipTrial = false,
      offer,
    } = await request.json();
    const ctx = await getEmployerContext();
    const warm99 = offer === "warm99";

    if (type === "boost") {
      if (!jobId) {
        return NextResponse.json({ error: "Job ID required for boost" }, { status: 400 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        ...checkoutCustomerParams("payment", ctx?.stripeCustomerId, ctx?.email),
        custom_text: stripeCheckoutCustomText,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: stripeProductData(
                "Recruitment Site Featured Job Boost",
                "7-day featured placement + Google Jobs priority",
              ),
              unit_amount: FEATURED_BOOST_PRICE * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/dashboard/jobs?boost=success`,
        cancel_url: `${siteUrl}/dashboard/jobs?boost=cancelled`,
        metadata: { type: "boost", employerId: ctx?.employerId ?? "", jobId },
      });
      return NextResponse.json({ url: session.url });
    }

    if (type === "payg") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        ...checkoutCustomerParams("payment", ctx?.stripeCustomerId, ctx?.email),
        custom_text: stripeCheckoutCustomText,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: stripeProductData(
                "Recruitment Site Single Job Post",
                "One active job listing for 30 days",
              ),
              unit_amount: PAYG_JOB_POST_PRICE * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/dashboard/jobs/new?checkout=success&type=payg`,
        cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
        metadata: { type: "payg", employerId: ctx?.employerId ?? "" },
      });
      return NextResponse.json({ url: session.url });
    }

    if (type === "screening_credits") {
      if (!ctx?.employerId) {
        return NextResponse.json({ error: "Sign in as an employer first" }, { status: 401 });
      }
      const pack = SCREENING_CREDIT_PACKS.find((p) => p.credits === Number(credits));
      if (!pack) {
        return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        ...checkoutCustomerParams("payment", ctx.stripeCustomerId, ctx.email),
        custom_text: stripeCheckoutCustomText,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: stripeProductData(
                `Recruitment Site AI Screening — ${pack.label}`,
                `${pack.credits} AI applicant screens`,
              ),
              unit_amount: pack.priceGbp * 100,
            },
            quantity: 1,
          },
        ],
        success_url: `${siteUrl}/dashboard/billing?credits=success`,
        cancel_url: `${siteUrl}/dashboard/billing?credits=cancelled`,
        metadata: {
          type: "screening_credits",
          employerId: ctx.employerId,
          credits: String(pack.credits),
        },
      });
      return NextResponse.json({ url: session.url });
    }

    if (type === "cv_database") {
      if (ctx?.cvDatabaseEnabled) {
        return NextResponse.json({ error: "CV database already active" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        ...checkoutCustomerParams("subscription", ctx?.stripeCustomerId, ctx?.email),
        custom_text: stripeCheckoutCustomText,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: stripeProductData(
                "Recruitment Site CV Database Access",
                "Search candidate profiles across Recruitment Site",
              ),
              unit_amount: CV_DATABASE_ADDON_PRICE * 100,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: { type: "cv_database", employerId: ctx?.employerId ?? "" },
        },
        success_url: `${siteUrl}/dashboard/candidates?checkout=success`,
        cancel_url: `${siteUrl}/dashboard/billing?checkout=cancelled`,
        metadata: { type: "cv_database", employerId: ctx?.employerId ?? "" },
      });
      return NextResponse.json({ url: session.url });
    }

    const plan = PRICING_PLANS.find((p) => p.tier === tier);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Warm-lead offer: Growth monthly, skip trial, £99 month 1 (then £249).
    if (warm99 && (plan.tier !== "growth" || interval !== "month")) {
      return NextResponse.json(
        { error: "warm99 offer applies to Growth monthly only" },
        { status: 400 },
      );
    }

    const amount = interval === "year" ? plan.priceAnnual : plan.priceMonthly;
    const intervalType = interval === "year" ? "year" : "month";
    const noTrial = Boolean(skipTrial || warm99);

    let couponId: string | undefined;
    if (warm99) {
      couponId = process.env.STRIPE_WARM_LEAD_COUPON_ID || undefined;
      if (!couponId) {
        try {
          const existing = await stripe.coupons.retrieve("warm99");
          couponId = existing.id;
        } catch {
          const created = await stripe.coupons.create({
            id: "warm99",
            name: "Warm lead — £99 month 1",
            amount_off: (plan.priceMonthly - 99) * 100,
            currency: "gbp",
            duration: "once",
            max_redemptions: 20,
          });
          couponId = created.id;
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...checkoutCustomerParams("subscription", ctx?.stripeCustomerId, ctx?.email),
      custom_text: stripeCheckoutCustomText,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: stripeProductData(
              `Recruitment Site ${plan.name}${warm99 ? " (warm lead £99 mo 1)" : ""}`,
              plan.highlights.join(" · "),
            ),
            unit_amount: amount * 100,
            recurring: { interval: intervalType as "month" | "year" },
          },
          quantity: 1,
        },
      ],
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      subscription_data: {
        ...(noTrial ? {} : { trial_period_days: FREE_TRIAL_DAYS }),
        metadata: {
          tier: plan.tier,
          employerId: ctx?.employerId ?? "",
          offer: warm99 ? "warm99" : "",
        },
      },
      success_url: `${siteUrl}/onboarding?checkout=success${warm99 ? "&offer=warm99" : ""}`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled${warm99 ? "&offer=warm99" : ""}`,
      metadata: {
        tier: plan.tier,
        employerId: ctx?.employerId ?? "",
        offer: warm99 ? "warm99" : "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[checkout]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
