/** SEO blog posts — hiring guides and competitor comparisons */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "hiring" | "healthcare" | "trades" | "tech" | "comparison";
  publishedAt: string;
  readMinutes: number;
  author: string;
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "flat-fee-vs-reed-agency-fees",
    title: "Flat-fee hiring for UK SMEs: what Growth actually covers",
    excerpt:
      "Unlimited posts, AI scoring and zero placement commission — how a predictable monthly fee changes the maths for a £35k hire.",
    category: "comparison",
    publishedAt: "2026-07-10",
    readMinutes: 6,
    author: "Recruitment Site Team",
    content: [
      "When hiring costs sit on a per-listing or placement-fee model, a single £35,000 hire can quietly run into thousands before you’ve counted your team’s time.",
      "Recruitment Site Growth is a predictable monthly subscription — unlimited job posts, AI applicant scoring included, and no placement commission when you hire.",
      "If you hire more than once a year, or post more than two roles at once, flat fee usually wins on total cost. Keep specialised campaigns for one-off brand pushes; use Growth as your default channel.",
      "Salary transparency is another cost saver. Listings with disclosed pay get 25–30% more applications on average, which means fewer boosts and less time chasing candidates.",
    ],
  },
  {
    slug: "nhs-nurse-recruitment-without-agency-fees",
    title: "How care homes hire NHS-band nurses without agency fees",
    excerpt:
      "Band 5 nurses, NMC verification, and DBS checks — a practical guide to direct hiring for UK healthcare employers.",
    category: "healthcare",
    publishedAt: "2026-07-05",
    readMinutes: 8,
    author: "Recruitment Site Team",
    content: [
      "Healthcare remains the UK's tightest hiring market. Care homes and NHS trusts compete with locum agencies charging premium day rates — yet many roles can be filled directly if compliance is handled upfront.",
      "Start with role clarity: Band level, NMC pin requirement, DBS level (enhanced for patient-facing roles), and salary band shown on the listing. Candidates filter heavily on pay — hiding salary wastes everyone's time.",
      "Generic job boards treat a nurse like any other role. Healthcare-specific fields — NMC, HCPC, NHS Band, CQC employer flag — reduce unqualified applications and speed up shortlisting.",
      "AI scoring against your job spec saves hours of CV screening. You review ranked applicants with match summaries — not an unsorted inbox of keyword hits.",
    ],
  },
  {
    slug: "salary-transparency-uk-jobs-google-ranking",
    title: "Why salary transparency boosts Google Jobs rankings",
    excerpt:
      "Google and candidates both reward pay clarity. Here's what UK employers need to disclose and how it affects apply rates.",
    category: "hiring",
    publishedAt: "2026-06-28",
    readMinutes: 5,
    author: "Recruitment Site Team",
    content: [
      "Since 2023, Google Jobs has increasingly favoured listings with structured salary data. UK candidates, meanwhile, overwhelmingly skip roles without pay shown — especially in healthcare and trades.",
      "Recruitment Site requires salary on every employer post. That isn't bureaucracy — it's a conversion and SEO lever. Listings with min/max GBP and period (year, hour, day) syndicate cleanly to Google Jobs JSON-LD.",
      "Vague placeholders like “competitive salary” waste applies. We require a clear range so candidates self-select and employers get serious shortlists.",
      "If you're migrating from another board, audit your live roles. Adding salary typically lifts apply rate within the first fortnight without increasing spend.",
    ],
  },
  {
    slug: "trades-construction-hiring-uk-2026",
    title: "Hiring electricians and site managers in 2026: trades playbook",
    excerpt:
      "CIS awareness, day rates vs permanent, and why Checkatrade isn't enough for volume hiring.",
    category: "trades",
    publishedAt: "2026-06-20",
    readMinutes: 7,
    author: "Recruitment Site Team",
    content: [
      "Trades hiring in the UK splits into two problems: finding skilled workers (electricians, plumbers, gas engineers) and finding site leadership (foremen, site managers, QS).",
      "Checkatrade and Randstad serve parts of this market, but SMEs running multiple sites need a pipeline — not a one-off lead. Job alerts by city and trade keyword keep your bench warm.",
      "Be explicit about employment type: permanent with van + tools, or CIS subcontractor with day rate. Mixing the two in one advert kills trust.",
      "Recruitment Site's trades vertical includes templates for common roles with typical UK salary bands. Flat monthly fee beats per-lead models when you're hiring 3+ people a year.",
    ],
  },
  {
    slug: "indeed-ppc-vs-unlimited-job-posts",
    title: "Unlimited posts vs pay-per-click: when flat fee wins",
    excerpt:
      "Sponsored clicks add up fast for year-round hiring. Here’s when a flat monthly plan with unlimited posts makes more sense for UK SMEs.",
    category: "comparison",
    publishedAt: "2026-06-12",
    readMinutes: 6,
    author: "Recruitment Site Team",
    content: [
      "Pay-per-click can work when you have a strong employer brand and high apply conversion. For most UK SMEs hiring year-round, click costs become a treadmill — especially on competitive roles.",
      "A Growth plan at a flat monthly fee with unlimited posts flips the incentive. You're not penalised for posting another role when a project expands — common in trades and healthcare.",
      "The smart stack: organic reach via Google Jobs syndication plus targeted alerts on Recruitment Site, and reserve paid boosts for hard-to-fill single roles.",
      "Track cost per hire, not cost per click. Placement fees and sponsored campaigns often hide the true number until after you've signed.",
    ],
  },
  {
    slug: "employer-onboarding-checklist-uk",
    title: "Employer onboarding checklist: post your first UK job in 15 minutes",
    excerpt:
      "Company profile, compliance fields, salary bands, and Google Jobs syndication — a step-by-step guide for new Recruitment Site employers.",
    category: "hiring",
    publishedAt: "2026-07-15",
    readMinutes: 4,
    author: "Recruitment Site Team",
    content: [
      "Getting live on Recruitment Site takes three steps: set up your company profile, publish a role with salary disclosed, and turn on job alerts for your sector.",
      "Your company slug powers a branded careers page on Growth — candidates see your roles under your brand, not lost in a generic feed.",
      "Healthcare employers should enable NMC/DBS fields. Trades employers should specify CIS vs PAYE. Tech employers should list stack and remote policy clearly.",
      "After publish, Google Jobs picks up structured data automatically. Review AI-scored applications in your dashboard — shortlist above 80, review 60–79, and auto-archive below 40 if you're volume hiring.",
    ],
  },
  {
    slug: "gp-practice-nurse-jobs-uk-guide",
    title: "GP practice nurse jobs UK: salary, clinics and how to apply",
    excerpt:
      "What Band 5–7 practice nurses earn, which clinics PCNs recruit for, and how to find roles with pay shown upfront.",
    category: "healthcare",
    publishedAt: "2026-07-22",
    readMinutes: 7,
    author: "Recruitment Site Team",
    content: [
      "Practice nurses are central to UK primary care — immunisations, smear clinics, chronic disease management and triage. Demand stays high as PCNs expand services beyond the GP appointment.",
      "Typical pay sits in NHS Band 5–7 territory depending on sessions, prescribing qualifications and leadership responsibility. Always check the listing shows salary or hourly rate before applying.",
      "Employers on Recruitment Site must disclose pay and can flag NMC registration. That filters out vague 'competitive salary' ads common on larger boards.",
      "Browse practice nurse roles by city, set a job alert for 'practice nurse', and apply free in under five minutes with your CV and NMC pin ready.",
    ],
  },
  {
    slug: "occupational-therapist-nhs-jobs-guide",
    title: "Occupational therapist NHS jobs: Band pay and where to look",
    excerpt:
      "HCPC-registered OT roles in acute, community and social care — with Band 5–7 salary context for UK jobseekers.",
    category: "healthcare",
    publishedAt: "2026-07-23",
    readMinutes: 6,
    author: "Recruitment Site Team",
    content: [
      "Occupational therapists support discharge planning, rehabilitation and independent living across NHS trusts, community teams and social care. HCPC registration is non-negotiable for clinical roles.",
      "Band 5 newly qualified OTs through Band 6–7 specialists see structured Agenda for Change pay. Private and locum markets vary — insist on the figure before interview.",
      "Long-tail searches like 'occupational therapist jobs Manchester' convert when landing pages and JobPosting schema are in place. Recruitment Site publishes city and role pages with salary transparency.",
      "Employers hiring OTs avoid agency markups with flat-fee unlimited posts, while candidates apply free against verified listings.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
