/** Curated Unsplash images — free to use via images.unsplash.com */
export const UNSPLASH = {
  hero: {
    hiring: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80",
    healthcare: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80",
    ukCity: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80",
    team: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80",
    office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
  },
  vertical: {
    healthcare: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
    trades: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    tech: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    education: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    hospitality: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    logistics: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    finance: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    legal: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    marketing: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    engineering: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    general: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
  },
  sections: {
    interview: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80",
    nurse: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&q=80",
    careHome: "https://images.unsplash.com/photo-1576765608535-39f068a39d82?w=1200&q=80",
    construction: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
    laptop: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    handshake: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
    dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  },
  avatars: [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  ],
} as const;

import type { Vertical } from "./types.js";

export function getVerticalImage(vertical: Vertical): string {
  return UNSPLASH.vertical[vertical] ?? UNSPLASH.vertical.general;
}

export interface CompetitorFeature {
  name: string;
  logo: string;
  tagline: string;
  priceExample: string;
  features: Record<string, "yes" | "no" | "partial" | string>;
}

export const COMPETITOR_FEATURES = [
  "Unlimited job posts",
  "AI applicant scoring",
  "Salary required on all jobs",
  "Google Jobs syndication",
  "Mobile apply (<5 min)",
  "Flat monthly fee",
  "No placement commission",
  "CV database access",
  "Branded careers page",
  "Automated job alerts",
  "Healthcare compliance fields",
  "ATS integration",
] as const;

export type CompetitorFeatureKey = (typeof COMPETITOR_FEATURES)[number];

export const COMPETITORS: CompetitorFeature[] = [
  {
    name: "Recruitment Site",
    logo: "RS",
    tagline: "Flat-fee, AI-powered hiring for UK SMEs",
    priceExample: "£249/mo unlimited",
    features: {
      "Unlimited job posts": "yes",
      "AI applicant scoring": "yes",
      "Salary required on all jobs": "yes",
      "Google Jobs syndication": "yes",
      "Mobile apply (<5 min)": "yes",
      "Flat monthly fee": "yes",
      "No placement commission": "yes",
      "CV database access": "yes",
      "Branded careers page": "yes",
      "Automated job alerts": "yes",
      "Healthcare compliance fields": "yes",
      "ATS integration": "yes",
    },
  },
  {
    name: "Reed.co.uk",
    logo: "R",
    tagline: "UK job board",
    priceExample: "Per listing",
    features: {
      "Unlimited job posts": "no",
      "AI applicant scoring": "no",
      "Salary required on all jobs": "partial",
      "Google Jobs syndication": "yes",
      "Mobile apply (<5 min)": "partial",
      "Flat monthly fee": "no",
      "No placement commission": "no",
      "CV database access": "yes",
      "Branded careers page": "partial",
      "Automated job alerts": "yes",
      "Healthcare compliance fields": "no",
      "ATS integration": "partial",
    },
  },
  {
    name: "Indeed",
    logo: "I",
    tagline: "Job search marketplace",
    priceExample: "Sponsored listings",
    features: {
      "Unlimited job posts": "partial",
      "AI applicant scoring": "partial",
      "Salary required on all jobs": "partial",
      "Google Jobs syndication": "yes",
      "Mobile apply (<5 min)": "yes",
      "Flat monthly fee": "no",
      "No placement commission": "yes",
      "CV database access": "yes",
      "Branded careers page": "no",
      "Automated job alerts": "yes",
      "Healthcare compliance fields": "no",
      "ATS integration": "partial",
    },
  },
  {
    name: "Hays",
    logo: "H",
    tagline: "Traditional recruitment agency",
    priceExample: "15–25% of salary",
    features: {
      "Unlimited job posts": "no",
      "AI applicant scoring": "no",
      "Salary required on all jobs": "yes",
      "Google Jobs syndication": "partial",
      "Mobile apply (<5 min)": "no",
      "Flat monthly fee": "no",
      "No placement commission": "no",
      "CV database access": "yes",
      "Branded careers page": "no",
      "Automated job alerts": "no",
      "Healthcare compliance fields": "partial",
      "ATS integration": "no",
    },
  },
  {
    name: "Totaljobs",
    logo: "T",
    tagline: "Generalist UK board",
    priceExample: "£199+/mo packages",
    features: {
      "Unlimited job posts": "partial",
      "AI applicant scoring": "partial",
      "Salary required on all jobs": "partial",
      "Google Jobs syndication": "yes",
      "Mobile apply (<5 min)": "partial",
      "Flat monthly fee": "no",
      "No placement commission": "yes",
      "CV database access": "yes",
      "Branded careers page": "partial",
      "Automated job alerts": "yes",
      "Healthcare compliance fields": "no",
      "ATS integration": "partial",
    },
  },
];

export const DASHBOARD_MOCK = {
  stats: {
    activeJobs: 4,
    totalApplications: 127,
    newApplications: 18,
    avgMatchScore: 72,
    profileViews: 2840,
    conversionRate: 4.5,
  },
  recentApplications: [
    {
      id: "1",
      name: "Sarah Mitchell",
      role: "Registered Nurse (Band 5)",
      score: 92,
      status: "shortlisted" as const,
      appliedAt: "2 hours ago",
      avatar: 0,
    },
    {
      id: "2",
      name: "James Okonkwo",
      role: "Care Assistant",
      score: 78,
      status: "reviewing" as const,
      appliedAt: "5 hours ago",
      avatar: 1,
    },
    {
      id: "3",
      name: "Emma Richardson",
      role: "HCA",
      score: 65,
      status: "submitted" as const,
      appliedAt: "1 day ago",
      avatar: 2,
    },
    {
      id: "4",
      name: "David Chen",
      role: "Registered Nurse (Band 5)",
      score: 41,
      status: "rejected" as const,
      appliedAt: "1 day ago",
      avatar: 0,
    },
  ],
  activeJobs: [
    { title: "Registered Nurse (Band 5)", applications: 47, views: 892, status: "active" },
    { title: "Care Assistant", applications: 34, views: 654, status: "active" },
    { title: "Healthcare Assistant", applications: 28, views: 521, status: "active" },
    { title: "Support Worker", applications: 18, views: 310, status: "paused" },
  ],
};
