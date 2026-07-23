#!/usr/bin/env node
/**
 * Reproduce checkout session creation (same params as /api/checkout).
 * Usage: node scripts/test-checkout-session.mjs [tier]
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = readFileSync(credsPath, "utf8");
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const key = pick("STRIPE_SECRET_KEY") ?? process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY not set");
  process.exit(1);
}

const tier = process.argv[2] ?? "growth";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://recruitmentsite.co.uk";

const PRICING_PLANS = [
  { tier: "starter", name: "Starter", priceMonthly: 99, highlights: ["3 active job posts", "Applicant inbox"] },
  {
    tier: "growth",
    name: "Growth",
    priceMonthly: 249,
    highlights: [
      "Unlimited job posts",
      "AI match scores on applicants",
      "1 featured slot / month",
      "Branded careers page",
      "Indeed + Google Jobs syndication",
    ],
  },
  { tier: "scale", name: "Scale", priceMonthly: 499, highlights: ["Everything in Growth", "3 featured slots / month"] },
];

const COMPANY_LEGAL_NOTICE =
  "Recruitment Site is a trading name of Recruitment Drive Ltd (Company No. 13481215). Registered office: 21-25 Burnley Road, Dollis Hill, London NW10 1ED.";
const STRIPE_PRODUCT_METADATA = {
  trading_name: "Recruitment Site",
  legal_entity: "Recruitment Drive Ltd",
  company_number: "13481215",
  registered_address: "21-25 Burnley Road, Dollis Hill, London NW10 1ED",
};

const plan = PRICING_PLANS.find((p) => p.tier === tier);
if (!plan) {
  console.error("Invalid tier:", tier);
  process.exit(1);
}

const Stripe = (await import("stripe")).default;
const stripe = new Stripe(key);

const params = {
  mode: "subscription",
  payment_method_types: ["card"],
  custom_text: { submit: { message: COMPANY_LEGAL_NOTICE } },
  line_items: [
    {
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Recruitment Site ${plan.name}`,
          description: plan.highlights.join(" · "),
          metadata: { ...STRIPE_PRODUCT_METADATA },
        },
        unit_amount: plan.priceMonthly * 100,
        recurring: { interval: "month" },
      },
      quantity: 1,
    },
  ],
  subscription_data: {
    trial_period_days: 30,
    metadata: { tier: plan.tier, employerId: "" },
  },
  success_url: `${siteUrl}/onboarding?checkout=success`,
  cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
  metadata: { tier: plan.tier, employerId: "" },
};

console.log("Creating checkout session for", tier, "siteUrl=", siteUrl);
try {
  const session = await stripe.checkout.sessions.create(params);
  console.log("OK", session.url?.slice(0, 80) + "...");
} catch (e) {
  console.error("ERR", e.type ?? e.name, e.message);
  if (e.raw) console.error(JSON.stringify(e.raw, null, 2));
  process.exit(1);
}
