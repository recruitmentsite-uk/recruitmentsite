import type Stripe from "stripe";

export async function getStripe(): Promise<Stripe | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const StripeSdk = (await import("stripe")).default;
  return new StripeSdk(key);
}

type CheckoutMode = "payment" | "subscription";

export function checkoutCustomerParams(
  mode: CheckoutMode,
  stripeCustomerId?: string | null,
  email?: string | null,
): Pick<Stripe.Checkout.SessionCreateParams, "customer" | "customer_email" | "customer_creation"> {
  if (stripeCustomerId) {
    return { customer: stripeCustomerId };
  }
  if (email) {
    // customer_creation is only valid for one-time payment checkout sessions.
    return mode === "payment"
      ? { customer_email: email, customer_creation: "always" }
      : { customer_email: email };
  }
  return mode === "payment" ? { customer_creation: "always" } : {};
}
