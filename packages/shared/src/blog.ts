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
    title: "Flat-fee hiring vs Reed: what UK SMEs actually pay",
    excerpt:
      "Reed charges per listing and agencies take 15–25%. Here's how flat-fee platforms change the maths for a £35k hire.",
    category: "comparison",
    publishedAt: "2026-07-10",
    readMinutes: 6,
    author: "Recruitment Site Team",
    content: [
      "UK SMEs posting on Reed often pay £100+ per listing, with featured placement costing extra. Add agency fees of 15–25% on salary and a single £35,000 hire can cost £6,000 or more before you've counted your time.",
      "Flat-fee platforms like Recruitment Site charge a predictable monthly subscription — unlimited job posts on Growth, AI applicant scoring included, and no placement commission when you hire.",
      "The break-even is simple: if you hire more than once a year, or post more than two roles simultaneously, flat fee wins. Reed and Indeed still make sense for one-off brand campaigns, but they're expensive as your default channel.",
      "Salary transparency is another hidden cost saver. Listings with disclosed pay get 25–30% more applications on average, which means fewer paid boosts and less time chasing candidates.",
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
      "AI scoring against your job spec saves hours of CV screening. Instead of keyword searches (Reed's model) or PPC volume (Indeed's model), you review ranked applicants with match summaries.",
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
      "Competitors like Indeed partially enforce salary in some markets but allow 'competitive' placeholders. Reed often lets employers omit pay entirely. The result: ghost listings and wasted applies.",
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
    title: "Indeed PPC vs unlimited posts: when pay-per-click stops making sense",
    excerpt:
      "At £1.50–£3 per click, sponsored Indeed campaigns add up fast. Compare the economics for SMEs hiring year-round.",
    category: "comparison",
    publishedAt: "2026-06-12",
    readMinutes: 6,
    author: "Recruitment Site Team",
    content: [
      "Indeed's model works for employers with strong employer brand and high conversion on apply. For most UK SMEs, PPC becomes a treadmill: pay for clicks, fight ghost applicants, repeat.",
      "A Growth plan at flat monthly fee with unlimited posts flips the incentive. You're not penalised for posting another role when a project expands — common in trades and healthcare.",
      "Indeed still delivers volume. The smart approach: organic listings via Google Jobs syndication plus targeted alerts, and reserve PPC for hard-to-fill single roles.",
      "Track cost per hire, not cost per click. Agency fees and PPC often hide the true number until after you've signed.",
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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
