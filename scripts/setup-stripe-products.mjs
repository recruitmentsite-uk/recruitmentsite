#!/usr/bin/env node
/**
 * Create Stripe products/prices for Recruitment Site tiers.
 * Requires STRIPE_SECRET_KEY in env.
 *
 * Writes stripe-products.local.json (gitignored) with product/price IDs.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRICING_PLANS,
  PAYG_JOB_POST_PRICE,
  FEATURED_BOOST_PRICE,
  CV_DATABASE_ADDON_PRICE,
  STRIPE_PRODUCT_METADATA,
  SITE_NAME,
} from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outputPath = join(root, "stripe-products.local.json");

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.log("⚠  Set STRIPE_SECRET_KEY to create products.");
  console.log("\nProducts to create:");
  for (const plan of PRICING_PLANS) {
    console.log(`  · ${plan.name}: £${plan.priceMonthly}/mo, £${plan.priceAnnual}/yr`);
  }
  console.log(`  · Pay-as-you-go job: £${PAYG_JOB_POST_PRICE}`);
  console.log(`  · Featured boost: £${FEATURED_BOOST_PRICE}`);
  console.log(`  · CV database add-on: £${CV_DATABASE_ADDON_PRICE}/mo`);
  process.exit(0);
}

const Stripe = (await import("stripe")).default;
const stripe = new Stripe(key);
const catalog = { createdAt: new Date().toISOString(), products: {} };

for (const plan of PRICING_PLANS) {
  const product = await stripe.products.create({
    name: `${SITE_NAME} ${plan.name}`,
    description: plan.highlights.join(" · "),
    metadata: { tier: plan.tier, ...STRIPE_PRODUCT_METADATA },
  });
  const monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.priceMonthly * 100,
    currency: "gbp",
    recurring: { interval: "month" },
    metadata: { tier: plan.tier, interval: "month" },
  });
  const annual = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.priceAnnual * 100,
    currency: "gbp",
    recurring: { interval: "year" },
    metadata: { tier: plan.tier, interval: "year" },
  });
  catalog.products[plan.tier] = {
    productId: product.id,
    monthlyPriceId: monthly.id,
    annualPriceId: annual.id,
  };
  console.log(`✓ ${plan.name}: monthly=${monthly.id}, annual=${annual.id}`);
}

const paygProduct = await stripe.products.create({
  name: `${SITE_NAME} Single Job Post`,
  description: "One active job listing for 30 days",
  metadata: { type: "payg", ...STRIPE_PRODUCT_METADATA },
});
const paygPrice = await stripe.prices.create({
  product: paygProduct.id,
  unit_amount: PAYG_JOB_POST_PRICE * 100,
  currency: "gbp",
});
catalog.products.payg = { productId: paygProduct.id, priceId: paygPrice.id };
console.log(`✓ Pay-as-you-go: ${paygPrice.id}`);

const boostProduct = await stripe.products.create({
  name: `${SITE_NAME} Featured Job Boost`,
  description: "7-day featured placement + Google Jobs priority",
  metadata: { type: "boost", ...STRIPE_PRODUCT_METADATA },
});
const boostPrice = await stripe.prices.create({
  product: boostProduct.id,
  unit_amount: FEATURED_BOOST_PRICE * 100,
  currency: "gbp",
});
catalog.products.boost = { productId: boostProduct.id, priceId: boostPrice.id };
console.log(`✓ Featured boost: ${boostPrice.id}`);

const cvProduct = await stripe.products.create({
  name: `${SITE_NAME} CV Database Access`,
  description: "Search candidate profiles across Recruitment Site",
  metadata: { type: "cv_database", ...STRIPE_PRODUCT_METADATA },
});
const cvPrice = await stripe.prices.create({
  product: cvProduct.id,
  unit_amount: CV_DATABASE_ADDON_PRICE * 100,
  currency: "gbp",
  recurring: { interval: "month" },
});
catalog.products.cv_database = { productId: cvProduct.id, monthlyPriceId: cvPrice.id };
console.log(`✓ CV database: ${cvPrice.id}`);

const subscriptionProducts = await stripe.products.list({ active: true, limit: 100 });
const portalProducts = subscriptionProducts.data
  .filter((p) => p.metadata?.tier)
  .map((p) => ({ product: p.id, prices: [] }));

for (const entry of portalProducts) {
  const prices = await stripe.prices.list({ product: entry.product, active: true, limit: 10 });
  entry.prices = prices.data.map((price) => price.id);
}

const existingConfigs = await stripe.billingPortal.configurations.list({ limit: 1 });
if (existingConfigs.data.length === 0 && portalProducts.length > 0) {
  await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: `Manage your ${SITE_NAME} subscription`,
    },
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        products: portalProducts,
      },
    },
  });
  console.log("✓ Billing portal configuration created");
} else {
  console.log("· Billing portal configuration already exists (skipped)");
}

writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`\n✓ Saved catalog → stripe-products.local.json`);
console.log("Next: add STRIPE keys + webhook secret to Vercel, then test checkout on /pricing");
