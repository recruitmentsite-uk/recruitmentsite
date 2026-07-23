import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getEmployerContext } from "@/lib/employer";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_SECRET_KEY in .env.local" },
      { status: 503 },
    );
  }

  const ctx = await getEmployerContext();
  if (!ctx?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account linked yet. Subscribe to a plan first." },
      { status: 400 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: ctx.stripeCustomerId,
    return_url: `${getSiteUrl()}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
