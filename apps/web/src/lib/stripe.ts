import type Stripe from "stripe";

export async function getStripe(): Promise<Stripe | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const StripeSdk = (await import("stripe")).default;
  return new StripeSdk(key);
}

export function checkoutCustomerParams(
  stripeCustomerId?: string | null,
  email?: string | null,
): Pick<Stripe.Checkout.SessionCreateParams, "customer" | "customer_email" | "customer_creation"> {
  if (stripeCustomerId) {
    return { customer: stripeCustomerId };
  }
  if (email) {
    return { customer_email: email, customer_creation: "always" };
  }
  return { customer_creation: "always" };
}
