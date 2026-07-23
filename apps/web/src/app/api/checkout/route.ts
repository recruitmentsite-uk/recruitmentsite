import { NextResponse } from "next/server";
import {
  FEATURED_BOOST_PRICE,
  CV_DATABASE_ADDON_PRICE,
  PRICING_PLANS,
  PAYG_JOB_POST_PRICE,
  FREE_TRIAL_DAYS,
} from "@placeuk/shared";
import { getSiteUrl } from "@/lib/site";
import { getEmployerContext } from "@/lib/employer";
import { checkoutCustomerParams, getStripe } from "@/lib/stripe";
import { stripeCheckoutCustomText, stripeProductData } from "@/lib/stripe-checkout";

export async function POST(request: Request) {
  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env.local" },
      { status: 503 },
    );
  }

  const siteUrl = getSiteUrl();
  const { tier, interval = "month", type, jobId } = await request.json();
  const ctx = await getEmployerContext();
  const customerParams = checkoutCustomerParams(ctx?.stripeCustomerId, ctx?.email);

  if (type === "boost") {
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required for boost" }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      ...customerParams,
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
      ...customerParams,
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

  if (type === "cv_database") {
    if (ctx?.cvDatabaseEnabled) {
      return NextResponse.json({ error: "CV database already active" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...customerParams,
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

  const amount = interval === "year" ? plan.priceAnnual : plan.priceMonthly;
  const intervalType = interval === "year" ? "year" : "month";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    ...customerParams,
    custom_text: stripeCheckoutCustomText,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: stripeProductData(
            `Recruitment Site ${plan.name}`,
            plan.highlights.join(" · "),
          ),
          unit_amount: amount * 100,
          recurring: { interval: intervalType as "month" | "year" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: FREE_TRIAL_DAYS,
      metadata: { tier: plan.tier, employerId: ctx?.employerId ?? "" },
    },
    success_url: `${siteUrl}/onboarding?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    metadata: { tier: plan.tier, employerId: ctx?.employerId ?? "" },
  });

  return NextResponse.json({ url: session.url });
}
