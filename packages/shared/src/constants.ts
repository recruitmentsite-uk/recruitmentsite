import type { Vertical } from "./types.js";

export const UK_REGIONS = [
  "London",
  "South East",
  "South West",
  "East of England",
  "West Midlands",
  "East Midlands",
  "Yorkshire",
  "North West",
  "North East",
  "Scotland",
  "Wales",
  "Northern Ireland",
] as const;

export const VERTICAL_LABELS: Record<Vertical, string> = {
  healthcare: "Healthcare & Care",
  trades: "Trades & Construction",
  tech: "Technology",
  general: "All sectors",
};

/** Default CV retention in days (UK GDPR — document in privacy policy) */
export const CV_RETENTION_DAYS = 365;

/** Launch wedge — change when expanding verticals */
export const LAUNCH_VERTICAL: Vertical = "healthcare";

export const SITE_NAME = "Recruitment Site";
export const SITE_DOMAIN = "recruitmentsite.co.uk";
export const SITE_TAGLINE = "Find UK jobs with salary shown upfront. Apply free in minutes.";
export const EMPLOYER_TAGLINE = "Flat-fee hiring for UK employers. AI-matched candidates. No agency commission.";

export const COMPANY_LEGAL_NAME = "Recruitment Drive Ltd";
export const COMPANY_NUMBER = "13481215";
export const COMPANY_REGISTERED_ADDRESS = "21-25 Burnley Road, Dollis Hill, London NW10 1ED";

/** Full legal entity line for footers and policies */
export const COMPANY_LEGAL_NOTICE = `${SITE_NAME} is a trading name of ${COMPANY_LEGAL_NAME} (Company No. ${COMPANY_NUMBER}). Registered office: ${COMPANY_REGISTERED_ADDRESS}.`;

/** Quick-search chips on homepage — mirrors Reed/Indeed trending searches */
export const POPULAR_SEARCHES = [
  { label: "Registered Nurse", query: "nurse" },
  { label: "Care Assistant", query: "care assistant" },
  { label: "Healthcare Assistant", query: "hca" },
  { label: "Support Worker", query: "support worker" },
  { label: "Electrician", query: "electrician" },
  { label: "Software Developer", query: "developer" },
] as const;

/** High-intent UK cities for homepage browse links */
export const POPULAR_CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Bristol",
  "Glasgow",
  "Liverpool",
  "Sheffield",
  "Edinburgh",
  "Newcastle",
  "Nottingham",
  "Cardiff",
] as const;

/** Factual trust signals — no inflated job counts */
export const TRUST_SIGNALS = [
  { stat: "100%", label: "Listings show salary" },
  { stat: "£0", label: "Cost to apply" },
  { stat: "5 min", label: "Average apply time" },
  { stat: "£249/mo", label: "Unlimited posts for employers" },
] as const;
