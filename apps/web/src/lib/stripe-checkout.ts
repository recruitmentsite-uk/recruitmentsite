import { COMPANY_LEGAL_NOTICE, STRIPE_PRODUCT_METADATA } from "@placeuk/shared";
import type Stripe from "stripe";

export function stripeProductData(name: string, description: string): Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData {
  return {
    name,
    description,
    metadata: { ...STRIPE_PRODUCT_METADATA },
  };
}

export const stripeCheckoutCustomText: Stripe.Checkout.SessionCreateParams.CustomText = {
  submit: {
    message: COMPANY_LEGAL_NOTICE,
  },
};
