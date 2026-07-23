/** Role templates for trades and tech verticals */

export const TRADES_ROLE_TEMPLATES = [
  {
    title: "Electrician (JIB/NICEIC)",
    salary: { min: 32000, max: 45000 },
    tags: ["18th Edition", "Testing & inspection", "Domestic/commercial"],
  },
  {
    title: "Plumber / Gas Engineer",
    salary: { min: 30000, max: 42000 },
    tags: ["Gas Safe", "Boiler install", "Maintenance"],
  },
  {
    title: "Site Manager (SMSTS)",
    salary: { min: 45000, max: 65000 },
    tags: ["SMSTS", "CSCS Black", "CDM"],
  },
  {
    title: "Labourer / Groundworker",
    salary: { min: 22000, max: 28000 },
    tags: ["CSCS Green", "Groundworks", "Plant awareness"],
  },
  {
    title: "Quantity Surveyor",
    salary: { min: 40000, max: 55000 },
    tags: ["NEC/JCT", "Variations", "Subcontractor mgmt"],
  },
  {
    title: "Carpenter / Joiner",
    salary: { min: 28000, max: 38000 },
    tags: ["First fix", "Second fix", "Heritage"],
  },
] as const;

export const TECH_ROLE_TEMPLATES = [
  {
    title: "Full Stack Developer",
    salary: { min: 45000, max: 75000 },
    tags: ["TypeScript", "React", "Node.js"],
  },
  {
    title: "DevOps / Platform Engineer",
    salary: { min: 55000, max: 85000 },
    tags: ["AWS/GCP", "Terraform", "CI/CD"],
  },
  {
    title: "Product Manager",
    salary: { min: 50000, max: 80000 },
    tags: ["Roadmaps", "Stakeholders", "Agile"],
  },
  {
    title: "Data Analyst",
    salary: { min: 35000, max: 55000 },
    tags: ["SQL", "Python", "Power BI"],
  },
  {
    title: "Cyber Security Analyst",
    salary: { min: 40000, max: 65000 },
    tags: ["SIEM", "ISO 27001", "Incident response"],
  },
  {
    title: "UX Designer",
    salary: { min: 40000, max: 60000 },
    tags: ["Figma", "Research", "Design systems"],
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "How is Recruitment Site different from Reed or Indeed?",
    a: "Recruitment Site charges a flat monthly fee with unlimited job posts on Growth — no per-listing fees and no placement commission. Every applicant is AI-scored, salary is required on all listings, and Google Jobs syndication is included.",
  },
  {
    q: "Is it free for candidates to apply?",
    a: "Yes. Candidates browse jobs, set up alerts, and apply with a CV in under five minutes. No account required for applications.",
  },
  {
    q: "Which sectors do you cover?",
    a: "Healthcare, trades & construction, technology, and general roles across the UK. We launch deepest in healthcare with NMC, DBS, and NHS Band fields built in.",
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
