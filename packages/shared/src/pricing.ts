import type { PlanTier } from "./types.js";

export interface PricingPlan {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  activeJobLimit: number | "unlimited";
  featuredSlotsPerMonth: number;
  aiMatching: boolean;
  careersSubdomain: boolean;
  atsWebhook: boolean;
  teamSeats: number;
  stripePriceId?: string;
  highlights: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: "starter",
    name: "Starter",
    priceMonthly: 99,
    priceAnnual: 990,
    activeJobLimit: 3,
    featuredSlotsPerMonth: 0,
    aiMatching: false,
    careersSubdomain: false,
    atsWebhook: false,
    teamSeats: 1,
    highlights: [
      "3 active job posts",
      "Applicant inbox",
      "Email notifications",
      "Standard listing rotation",
    ],
  },
  {
    tier: "growth",
    name: "Growth",
    priceMonthly: 249,
    priceAnnual: 2490,
    activeJobLimit: "unlimited",
    featuredSlotsPerMonth: 1,
    aiMatching: true,
    careersSubdomain: true,
    atsWebhook: false,
    teamSeats: 3,
    highlights: [
      "Unlimited job posts",
      "AI match scores on applicants",
      "1 featured slot / month",
      "Branded careers page",
      "Indeed + Google Jobs syndication",
    ],
  },
  {
    tier: "scale",
    name: "Scale",
    priceMonthly: 499,
    priceAnnual: 4990,
    activeJobLimit: "unlimited",
    featuredSlotsPerMonth: 3,
    aiMatching: true,
    careersSubdomain: true,
    atsWebhook: true,
    teamSeats: 5,
    highlights: [
      "Everything in Growth",
      "3 featured slots / month",
      "ATS webhook integration",
      "Priority async support",
      "5 team seats",
    ],
  },
];

export const PAYG_JOB_POST_PRICE = 79;
export const FEATURED_BOOST_PRICE = 49;
export const CV_DATABASE_ADDON_PRICE = 149;
export const FREE_TRIAL_DAYS = 30;

export function getPlanByTier(tier: PlanTier): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.tier === tier);
}

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(amount);
}
