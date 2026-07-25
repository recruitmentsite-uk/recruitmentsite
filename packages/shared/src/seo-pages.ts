import type { Vertical } from "./types.js";
import { POPULAR_CITIES } from "./constants.js";

/** URL-safe city slug, e.g. "London" → "london" */
export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

/** Resolve slug back to display name */
export function slugToCity(slug: string): string {
  const match = POPULAR_CITIES.find((c) => cityToSlug(c) === slug);
  if (match) return match;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** True when slug matches a popular UK city hub page */
export function isCitySlug(slug: string): boolean {
  return POPULAR_CITIES.some((c) => cityToSlug(c) === slug);
}

export interface SeoRolePage {
  slug: string;
  title: string;
  headline: string;
  description: string;
  vertical: Vertical;
  searchQuery: string;
  salaryMin?: number;
  salaryMax?: number;
  tags: readonly string[];
  employerGuide?: string;
}

export const SEO_ROLE_PAGES: readonly SeoRolePage[] = [
  {
    slug: "nurse-jobs",
    title: "Registered Nurse Jobs UK",
    headline: "Registered nurse jobs across the UK",
    description:
      "Find Band 5–7 registered nurse roles with NHS pay shown upfront. NMC verified employers. Apply free in minutes.",
    vertical: "healthcare",
    searchQuery: "nurse",
    salaryMin: 28407,
    salaryMax: 52809,
    tags: ["NMC registration", "NHS Band pay", "DBS enhanced", "Ward & community"],
    employerGuide: "Post nurse roles with NHS Band, NMC and DBS fields built in. Flat fee from £249/mo.",
  },
  {
    slug: "care-assistant-jobs",
    title: "Care Assistant Jobs UK",
    headline: "Care assistant jobs in care homes & domiciliary care",
    description:
      "Browse care assistant roles with hourly pay shown upfront. DBS-checked employers. Free to apply across the UK.",
    vertical: "healthcare",
    searchQuery: "care assistant",
    salaryMin: 22000,
    salaryMax: 28000,
    tags: ["Personal care", "Dementia care", "DBS enhanced", "Manual handling"],
    employerGuide: "Hire care assistants without agency commission. AI-scored applicants from day one.",
  },
  {
    slug: "hca-jobs",
    title: "Healthcare Assistant (HCA) Jobs UK",
    headline: "Healthcare assistant jobs — NHS & private sector",
    description:
      "HCA roles with Band 2–4 pay shown on every listing. Vital signs, ward support, patient hygiene. Apply free.",
    vertical: "healthcare",
    searchQuery: "hca",
    salaryMin: 23195,
    salaryMax: 27389,
    tags: ["NHS Band 2–4", "Ward support", "Vital signs", "DBS enhanced"],
    employerGuide: "Post HCA roles with NHS Band fields. Syndicate to Google Jobs automatically.",
  },
  {
    slug: "support-worker-jobs",
    title: "Support Worker Jobs UK",
    headline: "Support worker jobs — learning disabilities & community care",
    description:
      "Find support worker roles with salary shown upfront. Community, residential and LD settings across the UK.",
    vertical: "healthcare",
    searchQuery: "support worker",
    salaryMin: 22000,
    salaryMax: 30000,
    tags: ["Learning disabilities", "Community care", "Personal care", "DBS enhanced"],
    employerGuide: "Reach support workers with unlimited posts on Growth and AI-scored applicants.",
  },
  {
    slug: "rmn-jobs",
    title: "RMN Mental Health Nurse Jobs UK",
    headline: "RMN jobs — registered mental health nurses",
    description:
      "Mental health nurse roles with Band 6 pay, NMC verification and DBS requirements shown upfront.",
    vertical: "healthcare",
    searchQuery: "rmn",
    salaryMin: 35392,
    salaryMax: 42618,
    tags: ["NMC registration", "Mental Health Act", "Band 6", "Risk assessment"],
    employerGuide: "Target RMNs with NMC, DBS and Band fields built in. Flat monthly fee.",
  },
  {
    slug: "physiotherapist-jobs",
    title: "Physiotherapist Jobs UK",
    headline: "Physiotherapist jobs — NHS, private & MSK",
    description:
      "HCPC-registered physio roles with Band 6–7 salaries shown. MSK, rehab and community settings.",
    vertical: "healthcare",
    searchQuery: "physiotherapist",
    salaryMin: 35392,
    salaryMax: 52809,
    tags: ["HCPC registration", "MSK", "Rehabilitation", "Band 6–7"],
    employerGuide: "Post physio roles with HCPC and NHS Band fields. AI ranks applicants 0–100.",
  },
  {
    slug: "occupational-therapist-jobs",
    title: "Occupational Therapist Jobs UK",
    headline: "Occupational therapist (OT) jobs — NHS & community",
    description:
      "HCPC-registered OT roles with Band 5–7 pay shown upfront. Acute, community and social care settings.",
    vertical: "healthcare",
    searchQuery: "occupational therapist",
    salaryMin: 28407,
    salaryMax: 52809,
    tags: ["HCPC registration", "Band 5–7", "Community OT", "Discharge planning"],
    employerGuide: "Post OT roles with HCPC and NHS Band fields. Flat-fee hiring from £249/mo.",
  },
  {
    slug: "practice-nurse-jobs",
    title: "GP Practice Nurse Jobs UK",
    headline: "Practice nurse jobs in GP surgeries & primary care",
    description:
      "GP practice nurse roles with Band 5–7 salaries, immunisation and chronic disease management. Salary shown upfront.",
    vertical: "healthcare",
    searchQuery: "practice nurse",
    salaryMin: 28407,
    salaryMax: 52809,
    tags: ["NMC registration", "Primary care", "Immunisations", "Chronic disease"],
    employerGuide: "Hire practice nurses for PCNs and GP surgeries without agency fees.",
  },
  {
    slug: "electrician-jobs",
    title: "Electrician Jobs UK",
    headline: "Electrician jobs — JIB, NICEIC & domestic/commercial",
    description:
      "Electrician roles from £32k–£45k with qualifications shown upfront. 18th Edition, testing & inspection.",
    vertical: "trades",
    searchQuery: "electrician",
    salaryMin: 32000,
    salaryMax: 45000,
    tags: ["18th Edition", "JIB/NICEIC", "Testing & inspection", "CSCS"],
    employerGuide: "Hire electricians with unlimited posts from £249/mo and AI-scored applicants.",
  },
  {
    slug: "plumber-jobs",
    title: "Plumber & Gas Engineer Jobs UK",
    headline: "Plumber and gas engineer jobs across the UK",
    description:
      "Gas Safe plumber roles with salary shown upfront. Boiler install, maintenance and commercial work.",
    vertical: "trades",
    searchQuery: "plumber",
    salaryMin: 30000,
    salaryMax: 42000,
    tags: ["Gas Safe", "Boiler install", "Maintenance", "Commercial"],
    employerGuide: "Reach qualified plumbers with flat-fee hiring and salary shown on every ad.",
  },
  {
    slug: "site-manager-jobs",
    title: "Site Manager Jobs UK",
    headline: "Site manager jobs — SMSTS, CDM & construction",
    description:
      "Construction site manager roles £45k–£65k. SMSTS, CSCS Black and CDM experience required.",
    vertical: "trades",
    searchQuery: "site manager",
    salaryMin: 45000,
    salaryMax: 65000,
    tags: ["SMSTS", "CSCS Black", "CDM", "Subcontractor mgmt"],
    employerGuide: "Post site manager roles with skills tags. Branded careers page included.",
  },
  {
    slug: "software-developer-jobs",
    title: "Software Developer Jobs UK",
    headline: "Software developer jobs — remote, hybrid & onsite",
    description:
      "Full stack and backend developer roles £45k–£75k with salary shown upfront. TypeScript, React, Node.js.",
    vertical: "tech",
    searchQuery: "developer",
    salaryMin: 45000,
    salaryMax: 75000,
    tags: ["TypeScript", "React", "Node.js", "Remote/hybrid"],
    employerGuide: "Hire developers without agency commission. AI match scores on every applicant.",
  },
  {
    slug: "devops-jobs",
    title: "DevOps Engineer Jobs UK",
    headline: "DevOps and platform engineer jobs",
    description:
      "DevOps roles £55k–£85k with AWS/GCP, Terraform and CI/CD skills. Salary transparent on every listing.",
    vertical: "tech",
    searchQuery: "devops",
    salaryMin: 55000,
    salaryMax: 85000,
    tags: ["AWS/GCP", "Terraform", "CI/CD", "Kubernetes"],
    employerGuide: "Post DevOps roles with unlimited listings. Google Jobs syndication included.",
  },
  {
    slug: "teacher-jobs",
    title: "Teacher Jobs UK",
    headline: "Teacher jobs across the UK",
    description: "Primary and secondary teacher roles with salary scales shown upfront. QTS roles. Apply free.",
    vertical: "education",
    searchQuery: "teacher",
    salaryMin: 31000,
    salaryMax: 48000,
    tags: ["QTS", "Primary", "Secondary", "Safeguarding"],
  },
  {
    slug: "teaching-assistant-jobs",
    title: "Teaching Assistant Jobs UK",
    headline: "Teaching assistant jobs",
    description: "TA and classroom support roles with pay shown upfront. Term-time and SEND. Apply free.",
    vertical: "education",
    searchQuery: "teaching assistant",
    salaryMin: 20000,
    salaryMax: 28000,
    tags: ["Classroom support", "SEND", "Term-time"],
  },
  {
    slug: "chef-jobs",
    title: "Chef Jobs UK",
    headline: "Chef and kitchen jobs",
    description: "Chef de partie, sous chef and kitchen roles with pay rates shown upfront. Apply free.",
    vertical: "hospitality",
    searchQuery: "chef",
    salaryMin: 26000,
    salaryMax: 40000,
    tags: ["Kitchen", "HACCP", "Hotels & restaurants"],
  },
  {
    slug: "warehouse-jobs",
    title: "Warehouse Jobs UK",
    headline: "Warehouse operative jobs",
    description: "Warehouse and logistics roles with shift pay shown upfront. Apply free.",
    vertical: "logistics",
    searchQuery: "warehouse",
    salaryMin: 23000,
    salaryMax: 30000,
    tags: ["Picking", "Packing", "Shifts"],
  },
  {
    slug: "hgv-driver-jobs",
    title: "HGV Driver Jobs UK",
    headline: "HGV and LGV driver jobs",
    description: "Class 1 and Class 2 driver roles with salary shown upfront. Apply free.",
    vertical: "logistics",
    searchQuery: "hgv",
    salaryMin: 34000,
    salaryMax: 48000,
    tags: ["C+E", "Class 2", "Nights"],
  },
  {
    slug: "accountant-jobs",
    title: "Accountant Jobs UK",
    headline: "Accountant and finance jobs",
    description: "Management accountant and practice roles with salary shown upfront. Apply free.",
    vertical: "finance",
    searchQuery: "accountant",
    salaryMin: 35000,
    salaryMax: 55000,
    tags: ["ACCA", "CIMA", "Practice & industry"],
  },
  {
    slug: "retail-assistant-jobs",
    title: "Retail Assistant Jobs UK",
    headline: "Retail assistant jobs",
    description: "Store and customer service roles with pay shown upfront. Apply free.",
    vertical: "retail",
    searchQuery: "retail assistant",
    salaryMin: 22000,
    salaryMax: 28000,
    tags: ["Customer service", "Till", "Flexible hours"],
  },
  {
    slug: "solicitor-jobs",
    title: "Solicitor Jobs UK",
    headline: "Solicitor jobs across the UK",
    description: "Private practice and in-house solicitor roles with PQE and salary shown. Apply free.",
    vertical: "legal",
    searchQuery: "solicitor",
    salaryMin: 45000,
    salaryMax: 70000,
    tags: ["PQE", "SRA", "Private practice"],
  },
  {
    slug: "marketing-executive-jobs",
    title: "Marketing Executive Jobs UK",
    headline: "Marketing executive jobs",
    description: "Marketing and digital roles with salary shown upfront. Apply free.",
    vertical: "marketing",
    searchQuery: "marketing",
    salaryMin: 28000,
    salaryMax: 45000,
    tags: ["Campaigns", "Digital", "CRM"],
  },
  {
    slug: "mechanical-engineer-jobs",
    title: "Mechanical Engineer Jobs UK",
    headline: "Mechanical engineer jobs",
    description: "Mechanical design and manufacturing engineer roles with salary shown. Apply free.",
    vertical: "engineering",
    searchQuery: "mechanical engineer",
    salaryMin: 35000,
    salaryMax: 50000,
    tags: ["CAD", "SolidWorks", "DFM"],
  },
] as const;

export function getRolePage(slug: string): SeoRolePage | undefined {
  return SEO_ROLE_PAGES.find((p) => p.slug === slug);
}

export function getRolePagesByVertical(vertical: Vertical): SeoRolePage[] {
  return SEO_ROLE_PAGES.filter((p) => p.vertical === vertical);
}

export interface HireGuidePage {
  slug: string;
  role: string;
  title: string;
  headline: string;
  description: string;
  vertical: Vertical;
  steps: readonly string[];
  tips: readonly string[];
  costComparison: string;
}

export const HIRE_GUIDE_PAGES: readonly HireGuidePage[] = [
  {
    slug: "nurses",
    role: "Registered Nurses",
    title: "How to Hire Nurses in the UK",
    headline: "Hire registered nurses without agency fees",
    description:
      "Guide for care homes, NHS trusts and private providers hiring Band 5–7 nurses with flat-fee posting and AI matching.",
    vertical: "healthcare",
    steps: [
      "Define the role — Band, setting (ward, community, RMN), NMC and DBS requirements",
      "Post on Recruitment Site with NHS Band and compliance fields pre-built",
      "Review AI-scored applicants ranked 0–100 against your job description",
      "Shortlist, interview and hire — no placement commission on any hire",
    ],
    tips: [
      "Include NHS Band and actual pay — candidates skip roles without salary",
      "State NMC pin verification requirement upfront to filter unqualified applicants",
      "Use DBS enhanced level field for regulated activity roles",
      "Syndicate to Google Jobs automatically — included on Growth plan",
    ],
    costComparison: "Recruitment Site Growth is £249/mo with unlimited nurse posts, AI scoring and zero placement commission.",
  },
  {
    slug: "care-assistants",
    role: "Care Assistants",
    title: "How to Hire Care Assistants in the UK",
    headline: "Hire care assistants for care homes & domiciliary care",
    description:
      "Recruit care assistants with DBS fields, AI matching and unlimited posts on Growth.",
    vertical: "healthcare",
    steps: [
      "Write a clear job ad with hourly rate, shift pattern and care setting",
      "Post with DBS enhanced requirement and skills tags (dementia, manual handling)",
      "Receive applications with AI match scores — review top candidates first",
      "Onboard with right-to-work and DBS checks per CQC requirements",
    ],
    tips: [
      "Show hourly pay — care assistants compare rates before applying",
      "Highlight training provided and career progression to Band 3/4 HCA",
      "Use job alerts to reach passive candidates in your city",
      "Bulk upload multiple roles if hiring across several homes",
    ],
    costComparison: "Growth covers unlimited care assistant posts for £249/mo — AI scores every applicant.",
  },
  {
    slug: "practice-nurses",
    role: "Practice Nurses",
    title: "How to Hire Practice Nurses in the UK",
    headline: "Hire GP practice nurses without locum agency fees",
    description:
      "Primary care and PCN guide to recruiting Band 5–7 practice nurses with NMC and immunisation skills.",
    vertical: "healthcare",
    steps: [
      "Define clinic mix — immunisations, chronic disease, smear clinics, triage",
      "Post with NMC, Band and sessions-per-week shown on the listing",
      "Review AI-scored applicants with primary care experience highlighted",
      "Interview and hire — no locum agency markup on permanent staff",
    ],
    tips: [
      "State QOF and chronic disease experience if required",
      "Show salary or hourly rate — practice nurses skip vague ads",
      "Mention training budget and study leave to compete with NHS trusts",
      "Use city landing pages to attract nurses relocating into your area",
    ],
    costComparison: "Locum practice nurse cover often costs £30–£45/hour. A permanent hire via Recruitment Site Growth is £249/mo with unlimited posts.",
  },
  {
    slug: "electricians",
    role: "Electricians",
    title: "How to Hire Electricians in the UK",
    headline: "Hire qualified electricians — JIB, NICEIC & 18th Edition",
    description:
      "Construction and facilities firms: hire electricians without recruitment agency commission.",
    vertical: "trades",
    steps: [
      "Specify qualifications — 18th Edition, JIB/NICEIC, testing & inspection",
      "Post with salary range (£32k–£45k typical) and contract type",
      "Filter applicants by AI score and certification tags",
      "Verify CSCS card and qualifications at interview",
    ],
    tips: [
      "Include day rate for contract roles — trades candidates expect clear pay",
      "Mention van, tools and overtime policy to stand out from generic listings",
      "Post in multiple cities if you operate regionally",
      "Use featured boost (£49) for urgent contract starts",
    ],
    costComparison: "Recruitment Site Growth is £249/mo flat — unlimited electrician posts with AI scoring and no placement fees.",
  },
  {
    slug: "software-developers",
    role: "Software Developers",
    title: "How to Hire Software Developers in the UK",
    headline: "Hire developers with AI matching and clear salary bands",
    description:
      "Tech scale-ups and SMEs: hire full stack, backend and DevOps engineers with AI-matched candidates.",
    vertical: "tech",
    steps: [
      "Define stack, seniority and remote/hybrid policy with salary band",
      "Post with skills tags (TypeScript, React, AWS) — salary required",
      "Review AI-scored CVs ranked against your job description",
      "Integrate with your ATS on Scale plan for seamless pipeline",
    ],
    tips: [
      "Show salary — developers ignore roles without pay transparency",
      "State remote policy clearly — hybrid vs remote affects applicant pool significantly",
      "Include equity/benefits if competitive with London market rates",
      "Branded careers page on Growth helps candidates apply under your brand",
    ],
    costComparison: "Scale at £499/mo includes ATS integration, unlimited posts and AI scoring — no placement commission.",
  },
] as const;

export function getHireGuide(slug: string): HireGuidePage | undefined {
  return HIRE_GUIDE_PAGES.find((p) => p.slug === slug);
}

export interface CompetitorSeoPage {
  slug: string;
  name: string;
  title: string;
  headline: string;
  description: string;
  theirPrice: string;
  ourAdvantage: string;
  /** Neutral pricing/model notes — not attack lines */
  theirModel: readonly string[];
}

export const COMPETITOR_SEO_PAGES: readonly CompetitorSeoPage[] = [
  {
    slug: "reed",
    name: "Reed.co.uk",
    title: "Recruitment Site vs Reed — Pricing & Features",
    headline: "Flat-fee hiring with AI scoring built in",
    description:
      "See how Recruitment Site’s flat monthly pricing, AI match scores, salary transparency and healthcare fields compare with Reed.co.uk.",
    theirPrice: "Typically priced per listing; agency services available separately",
    ourAdvantage: "£249/mo unlimited posts with AI scoring, salary required, and Google Jobs included",
    theirModel: [
      "Per-listing and package pricing for job ads",
      "Broad UK job board reach",
      "Agency recruitment services available",
      "CV search on higher tiers",
    ],
  },
  {
    slug: "indeed",
    name: "Indeed",
    title: "Recruitment Site vs Indeed — Pricing & Features",
    headline: "Predictable monthly hiring — not pay-per-click",
    description:
      "Compare Recruitment Site’s flat monthly fee, salary-required listings and AI applicant scoring with Indeed’s marketplace model.",
    theirPrice: "Organic posts available; sponsored visibility often charged per click",
    ourAdvantage: "Predictable £249/mo with unlimited posts on Growth",
    theirModel: [
      "Large global candidate marketplace",
      "Sponsored jobs available to boost visibility",
      "Broad role coverage across industries",
      "Employer tools vary by campaign and market",
    ],
  },
  {
    slug: "hays",
    name: "Hays",
    title: "Recruitment Site vs Hays — Pricing & Features",
    headline: "Hire on a flat fee — keep every placement",
    description:
      "Compare Recruitment Site’s £249/mo Growth plan and AI matching with traditional agency placement fees.",
    theirPrice: "Typically 15–25% of first-year salary per permanent placement",
    ourAdvantage: "£249/mo unlimited posts — zero placement commission",
    theirModel: [
      "Full-service agency recruitment",
      "Consultant-led candidate search",
      "Placement fees on successful hires",
      "Strong brand recognition with employers",
    ],
  },
  {
    slug: "totaljobs",
    name: "Totaljobs",
    title: "Recruitment Site vs Totaljobs — Feature Comparison",
    headline: "Unlimited posts, AI scoring, healthcare-ready fields",
    description:
      "Compare Recruitment Site vs Totaljobs on AI matching, healthcare fields, and flat-fee pricing for UK SMEs.",
    theirPrice: "Package pricing with listing allowances",
    ourAdvantage: "£249/mo Growth with unlimited posts, AI scoring, and healthcare compliance",
    theirModel: [
      "Established UK job board packages",
      "Listing allowances by tier",
      "Broad multi-sector coverage",
      "Employer branding options on higher plans",
    ],
  },
] as const;

export function getCompetitorSeoPage(slug: string): CompetitorSeoPage | undefined {
  return COMPETITOR_SEO_PAGES.find((p) => p.slug === slug);
}

export const VERTICAL_CITY_PATHS = [
  "healthcare",
  "trades",
  "tech",
  "education",
  "hospitality",
  "logistics",
  "finance",
  "retail",
  "legal",
  "marketing",
  "engineering",
] as const;
export type VerticalCityPath = (typeof VERTICAL_CITY_PATHS)[number];

export function getCitySeoTitle(city: string): string {
  return `Jobs in ${city} — Salary Shown Upfront`;
}

export function getCitySeoDescription(city: string): string {
  return `Browse jobs in ${city} with salary shown on every listing. Healthcare, trades, tech, education, logistics and more. Apply free in under 5 minutes.`;
}

const VERTICAL_CITY_SHORT: Record<Vertical, string> = {
  healthcare: "Healthcare",
  trades: "Trades & Construction",
  tech: "Technology",
  education: "Education",
  hospitality: "Hospitality",
  logistics: "Logistics & Driving",
  finance: "Finance",
  retail: "Retail",
  legal: "Legal",
  marketing: "Marketing",
  engineering: "Engineering",
  general: "All",
};

const VERTICAL_CITY_BLURB: Record<Vertical, string> = {
  healthcare: "NHS, care home and clinical roles",
  trades: "Electrician, plumber and construction roles",
  tech: "Developer, DevOps and tech roles",
  education: "Teacher, TA and school support roles",
  hospitality: "Chef, hotel and restaurant roles",
  logistics: "Warehouse, HGV and supply-chain roles",
  finance: "Accounting, bookkeeping and analyst roles",
  retail: "Store and customer service roles",
  legal: "Solicitor, paralegal and compliance roles",
  marketing: "Marketing, content and creative roles",
  engineering: "Mechanical, electrical and manufacturing roles",
  general: "Jobs",
};

export function getVerticalCitySeoTitle(vertical: Vertical, city: string): string {
  return `${VERTICAL_CITY_SHORT[vertical]} Jobs in ${city}`;
}

export function getVerticalCitySeoDescription(vertical: Vertical, city: string): string {
  return `Find ${VERTICAL_CITY_BLURB[vertical].toLowerCase()} in ${city} with salary shown upfront. Verified UK employers. Apply free.`;
}
