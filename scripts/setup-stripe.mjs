#!/usr/bin/env node
/**
 * Stripe setup checklist for Recruitment Drive Ltd.
 * Complete signup at dashboard.stripe.com, then run with STRIPE_SECRET_KEY set.
 */
import { COMPANY_LEGAL_NAME, COMPANY_NUMBER, COMPANY_REGISTERED_ADDRESS, SITE_DOMAIN } from "@placeuk/shared";

console.log("Stripe setup for Recruitment Site\n");
console.log("1. Register: https://dashboard.stripe.com/register");
console.log(`   Email: billing@${SITE_DOMAIN}`);
console.log(`   Business: ${COMPANY_LEGAL_NAME}`);
console.log(`   Company number: ${COMPANY_NUMBER}`);
console.log(`   Address: ${COMPANY_REGISTERED_ADDRESS}`);
console.log("   Complete UK identity + bank verification (manual, ~1–3 days)\n");
console.log("2. Developers → API keys → copy to production env:");
console.log("   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...");
console.log("   STRIPE_SECRET_KEY=sk_live_...\n");
console.log(`3. Developers → Webhooks → Add endpoint:`);
console.log(`   URL: https://${SITE_DOMAIN}/api/webhooks/stripe`);
console.log("   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.paid");
console.log("   Copy STRIPE_WEBHOOK_SECRET=whsec_...\n");
console.log("4. Create products:");
console.log("   STRIPE_SECRET_KEY=sk_live_... pnpm stripe:setup\n");

if (process.env.STRIPE_SECRET_KEY) {
  console.log("✓ STRIPE_SECRET_KEY is set in this shell — run: pnpm stripe:setup");
} else {
  console.log("✗ STRIPE_SECRET_KEY not set yet");
}
