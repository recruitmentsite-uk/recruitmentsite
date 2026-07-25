import type { Vertical } from "./types.js";

/** Public sector hubs (excludes `general`). */
export const BROWSE_VERTICALS = [
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
] as const satisfies readonly Vertical[];

export type BrowseVertical = (typeof BROWSE_VERTICALS)[number];

export interface VerticalMeta {
  slug: BrowseVertical;
  label: string;
  shortLabel: string;
  path: `/${BrowseVertical}`;
  blurb: string;
  seoTitle: string;
  seoDescription: string;
  heroSubtitle: string;
  tags: readonly string[];
  syncKeywords: string;
  roleTemplates: readonly { title: string; salary: { min: number; max: number }; tags: readonly string[] }[];
}

export const VERTICAL_META: Record<BrowseVertical, VerticalMeta> = {
  healthcare: {
    slug: "healthcare",
    label: "Healthcare & Care",
    shortLabel: "Healthcare",
    path: "/healthcare",
    blurb: "NHS, care homes, and clinical roles with Band pay and compliance fields.",
    seoTitle: "Healthcare Jobs UK — Nurses, Care Assistants, HCAs",
    seoDescription:
      "Find NHS and care home jobs across the UK. Band 5 nurses, care assistants, HCAs, RMNs. Salary transparent. Apply free.",
    heroSubtitle: "NHS Band pay, CQC-registered employers, NMC/HCPC verified roles.",
    tags: ["NMC verified", "DBS checked", "NHS Band pay", "CQC employers"],
    syncKeywords: "nurse",
    roleTemplates: [],
  },
  trades: {
    slug: "trades",
    label: "Trades & Construction",
    shortLabel: "Trades",
    path: "/trades",
    blurb: "Electricians, plumbers, site managers — CIS/PAYE clear, day rates shown.",
    seoTitle: "Trades & Construction Jobs UK",
    seoDescription:
      "Electricians, plumbers, site managers and labourers across the UK. Salary shown upfront. CIS and PAYE roles. Apply free.",
    heroSubtitle: "Electricians, plumbers, site managers — salary upfront, CIS or PAYE clearly stated.",
    tags: ["CSCS aware", "CIS / PAYE clear", "Day rates shown", "SMSTS roles"],
    syncKeywords: "electrician",
    roleTemplates: [
      { title: "Electrician (JIB/NICEIC)", salary: { min: 32000, max: 45000 }, tags: ["18th Edition", "Testing & inspection", "Domestic/commercial"] },
      { title: "Plumber / Gas Engineer", salary: { min: 30000, max: 42000 }, tags: ["Gas Safe", "Boiler install", "Maintenance"] },
      { title: "Site Manager (SMSTS)", salary: { min: 45000, max: 65000 }, tags: ["SMSTS", "CSCS Black", "CDM"] },
      { title: "Labourer / Groundworker", salary: { min: 22000, max: 28000 }, tags: ["CSCS Green", "Groundworks", "Plant awareness"] },
      { title: "Quantity Surveyor", salary: { min: 40000, max: 55000 }, tags: ["NEC/JCT", "Variations", "Subcontractor mgmt"] },
      { title: "Carpenter / Joiner", salary: { min: 28000, max: 38000 }, tags: ["First fix", "Second fix", "Heritage"] },
    ],
  },
  tech: {
    slug: "tech",
    label: "Technology",
    shortLabel: "Tech",
    path: "/tech",
    blurb: "Developers, DevOps, product and data roles with salary bands upfront.",
    seoTitle: "Technology Jobs UK — Developers, DevOps, Product",
    seoDescription:
      "Software developer, DevOps and tech jobs across the UK. Salary shown upfront. Remote and hybrid roles. Apply free.",
    heroSubtitle: "Developers, platform engineers and product roles — salary and remote policy shown upfront.",
    tags: ["Remote & hybrid", "Salary bands", "Stack tags", "Visa-friendly filters"],
    syncKeywords: "software developer",
    roleTemplates: [
      { title: "Full Stack Developer", salary: { min: 45000, max: 75000 }, tags: ["TypeScript", "React", "Node.js"] },
      { title: "DevOps / Platform Engineer", salary: { min: 55000, max: 85000 }, tags: ["AWS/GCP", "Terraform", "CI/CD"] },
      { title: "Product Manager", salary: { min: 50000, max: 80000 }, tags: ["Roadmaps", "Stakeholders", "Agile"] },
      { title: "Data Analyst", salary: { min: 35000, max: 55000 }, tags: ["SQL", "Python", "Power BI"] },
      { title: "Cyber Security Analyst", salary: { min: 40000, max: 65000 }, tags: ["SIEM", "ISO 27001", "Incident response"] },
      { title: "UX Designer", salary: { min: 40000, max: 60000 }, tags: ["Figma", "Research", "Design systems"] },
    ],
  },
  education: {
    slug: "education",
    label: "Education & Teaching",
    shortLabel: "Education",
    path: "/education",
    blurb: "Teachers, TAs, SEND and school support roles across the UK.",
    seoTitle: "Education & Teaching Jobs UK",
    seoDescription:
      "Teacher, teaching assistant and SEND jobs across the UK. Salary shown upfront. Apply free in minutes.",
    heroSubtitle: "Classroom, SEND and school leadership roles — pay scales shown before you apply.",
    tags: ["QTS roles", "SEND support", "Term-time", "MAT & LA"],
    syncKeywords: "teacher",
    roleTemplates: [
      { title: "Primary Teacher (QTS)", salary: { min: 31000, max: 46000 }, tags: ["QTS", "KS1/KS2", "Safeguarding"] },
      { title: "Secondary Teacher", salary: { min: 32000, max: 48000 }, tags: ["QTS", "Subject specialist", "GCSE"] },
      { title: "Teaching Assistant", salary: { min: 20000, max: 28000 }, tags: ["Classroom support", "SEND", "Term-time"] },
      { title: "SENDCo", salary: { min: 40000, max: 55000 }, tags: ["SEN Code of Practice", "EHCP", "Leadership"] },
    ],
  },
  hospitality: {
    slug: "hospitality",
    label: "Hospitality & Catering",
    shortLabel: "Hospitality",
    path: "/hospitality",
    blurb: "Chefs, front of house, hotel and events roles with pay shown clearly.",
    seoTitle: "Hospitality & Catering Jobs UK",
    seoDescription:
      "Chef, barista, hotel and restaurant jobs across the UK. Hourly and salary rates shown upfront. Apply free.",
    heroSubtitle: "Kitchen, FOH and hotel roles — hourly rates and tips policy shown clearly.",
    tags: ["Kitchen & FOH", "Hotels", "Events", "Live-in options"],
    syncKeywords: "chef",
    roleTemplates: [
      { title: "Chef de Partie", salary: { min: 26000, max: 34000 }, tags: ["Kitchen", "Service", "HACCP"] },
      { title: "Sous Chef", salary: { min: 30000, max: 40000 }, tags: ["Kitchen leadership", "Menu", "Food safety"] },
      { title: "Restaurant Manager", salary: { min: 32000, max: 45000 }, tags: ["FOH", "P&L", "Team lead"] },
      { title: "Hotel Receptionist", salary: { min: 22000, max: 28000 }, tags: ["Front desk", "CRS", "Guest services"] },
    ],
  },
  logistics: {
    slug: "logistics",
    label: "Logistics & Driving",
    shortLabel: "Logistics",
    path: "/logistics",
    blurb: "Warehouse, HGV, courier and supply-chain roles across the UK.",
    seoTitle: "Logistics, Warehouse & Driving Jobs UK",
    seoDescription:
      "HGV driver, warehouse operative and logistics jobs across the UK. Salary and shift pay shown upfront. Apply free.",
    heroSubtitle: "Warehouse, HGV and last-mile roles — shift patterns and pay rates upfront.",
    tags: ["HGV / LGV", "Warehouse", "Nights & shifts", "Forklift"],
    syncKeywords: "warehouse operative",
    roleTemplates: [
      { title: "Warehouse Operative", salary: { min: 23000, max: 30000 }, tags: ["Picking", "Packing", "Shifts"] },
      { title: "HGV Class 1 Driver", salary: { min: 34000, max: 48000 }, tags: ["C+E", "Trunking", "Nights"] },
      { title: "Forklift Driver", salary: { min: 25000, max: 32000 }, tags: ["Counterbalance", "Reach", "FLT"] },
      { title: "Transport Planner", salary: { min: 30000, max: 42000 }, tags: ["Routing", "TMS", "Compliance"] },
    ],
  },
  finance: {
    slug: "finance",
    label: "Finance & Accounting",
    shortLabel: "Finance",
    path: "/finance",
    blurb: "Accountants, bookkeepers, analysts and insurance roles.",
    seoTitle: "Finance & Accounting Jobs UK",
    seoDescription:
      "Accountant, bookkeeper, finance analyst and insurance jobs across the UK. Salary shown upfront. Apply free.",
    heroSubtitle: "Practice, industry and fintech roles — salary bands and hybrid policy clear.",
    tags: ["ACCA / CIMA", "Practice", "Industry", "Hybrid"],
    syncKeywords: "accountant",
    roleTemplates: [
      { title: "Management Accountant", salary: { min: 40000, max: 55000 }, tags: ["CIMA", "Forecasting", "ERP"] },
      { title: "Bookkeeper", salary: { min: 26000, max: 35000 }, tags: ["Xero", "VAT", "Payroll"] },
      { title: "Financial Analyst", salary: { min: 38000, max: 55000 }, tags: ["Excel", "FP&A", "Reporting"] },
      { title: "Credit Controller", salary: { min: 26000, max: 34000 }, tags: ["Collections", "Sage", "B2B"] },
    ],
  },
  retail: {
    slug: "retail",
    label: "Retail & Customer Service",
    shortLabel: "Retail",
    path: "/retail",
    blurb: "Store, contact centre and customer experience roles.",
    seoTitle: "Retail & Customer Service Jobs UK",
    seoDescription:
      "Retail assistant, store manager and customer service jobs across the UK. Pay shown upfront. Apply free.",
    heroSubtitle: "High street, ecommerce and contact centre roles — pay and hours shown upfront.",
    tags: ["Store ops", "Contact centre", "Management", "Flexible hours"],
    syncKeywords: "retail assistant",
    roleTemplates: [
      { title: "Retail Assistant", salary: { min: 22000, max: 26000 }, tags: ["Customer service", "Till", "Stock"] },
      { title: "Store Manager", salary: { min: 30000, max: 42000 }, tags: ["P&L", "Team lead", "KPIs"] },
      { title: "Customer Service Advisor", salary: { min: 23000, max: 30000 }, tags: ["Contact centre", "CRM", "Shifts"] },
      { title: "Visual Merchandiser", salary: { min: 25000, max: 34000 }, tags: ["Displays", "Brand", "Retail"] },
    ],
  },
  legal: {
    slug: "legal",
    label: "Legal & Compliance",
    shortLabel: "Legal",
    path: "/legal",
    blurb: "Solicitors, paralegals, conveyancers and compliance roles.",
    seoTitle: "Legal & Compliance Jobs UK",
    seoDescription:
      "Solicitor, paralegal and compliance jobs across the UK. Salary shown upfront. Apply free.",
    heroSubtitle: "Private practice and in-house roles — PQE and salary bands shown clearly.",
    tags: ["PQE clear", "SRA", "In-house", "Paralegal"],
    syncKeywords: "solicitor",
    roleTemplates: [
      { title: "Solicitor (2+ PQE)", salary: { min: 45000, max: 70000 }, tags: ["PQE", "Private practice", "SRA"] },
      { title: "Paralegal", salary: { min: 25000, max: 35000 }, tags: ["Litigation", "Admin", "Casework"] },
      { title: "Conveyancer", salary: { min: 30000, max: 45000 }, tags: ["Residential", "CLC", "Case load"] },
      { title: "Compliance Officer", salary: { min: 35000, max: 55000 }, tags: ["AML", "FCDO", "Policy"] },
    ],
  },
  marketing: {
    slug: "marketing",
    label: "Marketing & Creative",
    shortLabel: "Marketing",
    path: "/marketing",
    blurb: "Marketing, content, design and media roles across the UK.",
    seoTitle: "Marketing, Media & Creative Jobs UK",
    seoDescription:
      "Marketing executive, content and design jobs across the UK. Salary shown upfront. Apply free.",
    heroSubtitle: "Brand, performance and creative roles — salary and hybrid options upfront.",
    tags: ["Performance", "Content", "Design", "Agency & in-house"],
    syncKeywords: "marketing executive",
    roleTemplates: [
      { title: "Marketing Executive", salary: { min: 28000, max: 38000 }, tags: ["Campaigns", "CRM", "Social"] },
      { title: "Content Manager", salary: { min: 35000, max: 48000 }, tags: ["Editorial", "SEO", "CMS"] },
      { title: "Graphic Designer", salary: { min: 28000, max: 40000 }, tags: ["Adobe", "Brand", "Social"] },
      { title: "Performance Marketer", salary: { min: 35000, max: 50000 }, tags: ["PPC", "Meta Ads", "Analytics"] },
    ],
  },
  engineering: {
    slug: "engineering",
    label: "Engineering & Manufacturing",
    shortLabel: "Engineering",
    path: "/engineering",
    blurb: "Mechanical, electrical, manufacturing and quality roles.",
    seoTitle: "Engineering & Manufacturing Jobs UK",
    seoDescription:
      "Mechanical engineer, CNC and manufacturing jobs across the UK. Salary shown upfront. Apply free.",
    heroSubtitle: "Design, production and quality roles — rates and shift patterns clear.",
    tags: ["Mechanical", "Electrical", "CNC", "Quality"],
    syncKeywords: "mechanical engineer",
    roleTemplates: [
      { title: "Mechanical Design Engineer", salary: { min: 35000, max: 50000 }, tags: ["CAD", "SolidWorks", "DFM"] },
      { title: "Electrical Engineer", salary: { min: 38000, max: 55000 }, tags: ["PLC", "Controls", "17th/18th"] },
      { title: "CNC Machinist", salary: { min: 28000, max: 38000 }, tags: ["Turning", "Milling", "Fanuc"] },
      { title: "Quality Engineer", salary: { min: 35000, max: 48000 }, tags: ["ISO 9001", "APQP", "Inspection"] },
    ],
  },
};

export const TRADES_ROLE_TEMPLATES = VERTICAL_META.trades.roleTemplates;
export const TECH_ROLE_TEMPLATES = VERTICAL_META.tech.roleTemplates;

export const FAQ_ITEMS = [
  {
    q: "What makes Recruitment Site different?",
    a: "Recruitment Site charges a flat monthly fee with unlimited job posts on Growth — no per-listing fees and no placement commission. Every applicant is AI-scored, salary is required on all listings, and Google Jobs syndication is included.",
  },
  {
    q: "Is it free for candidates to apply?",
    a: "Yes. Candidates browse jobs, set up alerts, and apply with a CV in under five minutes. No account required for applications.",
  },
  {
    q: "Which sectors do you cover?",
    a: "Healthcare, trades & construction, technology, education, hospitality, logistics & driving, finance, retail, legal, marketing & creative, and engineering & manufacturing — plus general UK roles. Healthcare remains our deepest vertical with NMC, DBS and NHS Band fields.",
  },
  {
    q: "Do you integrate with our ATS?",
    a: "ATS webhook integration is included on the Scale plan. Growth includes a branded careers page and CSV export from your application inbox.",
  },
  {
    q: "How does AI applicant scoring work?",
    a: "When a candidate applies, their CV and cover note are scored 0–100 against your job description. You review ranked applicants instead of reading every CV manually.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Subscriptions are monthly with no long-term contract. PAYG single posts are available at £79 for 30 days if you only need one role.",
  },
  {
    q: "Is my data GDPR compliant?",
    a: "Yes. CVs are retained for 365 days by default with clear consent at apply time. See our privacy policy for full details on processors and your rights.",
  },
  {
    q: "What happens after I subscribe?",
    a: "You'll complete a short onboarding wizard to set up your company profile, then post your first job. Roles syndicate to Google Jobs automatically on Growth.",
  },
] as const;
