/** Realistic UK job listing generator — combinatorial variety without repetition. */

const NHS_BAND_5 = { min: 28407, max: 34581, period: "year" };
const NHS_BAND_6 = { min: 35392, max: 42618, period: "year" };
const NHS_BAND_2 = { min: 23195, max: 23195, period: "year" };

export const UK_CITIES = [
  { city: "London", region: "Greater London", areas: ["Canary Wharf", "Croydon", "Hackney", "King's Cross", "Woolwich"] },
  { city: "Manchester", region: "Greater Manchester", areas: ["City Centre", "Salford Quays", "Trafford", "Stockport", "Wythenshawe"] },
  { city: "Birmingham", region: "West Midlands", areas: ["City Centre", "Edgbaston", "Erdington", "Solihull", "Sutton Coldfield"] },
  { city: "Leeds", region: "West Yorkshire", areas: ["City Centre", "Headingley", "Holbeck", "Roundhay", "Morley"] },
  { city: "Glasgow", region: "Scotland", areas: ["City Centre", "West End", "East End", "Clydebank", "Paisley"] },
  { city: "Liverpool", region: "Merseyside", areas: ["City Centre", "Bootle", "Wavertree", "Speke", "Kirkdale"] },
  { city: "Bristol", region: "South West", areas: ["City Centre", "Clifton", "Fishponds", "Hengrove", "Avonmouth"] },
  { city: "Sheffield", region: "South Yorkshire", areas: ["City Centre", "Meadowhall", "Hillsborough", "Dore", "Attercliffe"] },
  { city: "Edinburgh", region: "Scotland", areas: ["Old Town", "Leith", "Morningside", "Corstorphine", "Dalkeith"] },
  { city: "Newcastle", region: "North East", areas: ["City Centre", "Gosforth", "Byker", "Gateshead", "Jesmond"] },
  { city: "Nottingham", region: "East Midlands", areas: ["City Centre", "Beeston", "Mapperley", "Bulwell", "West Bridgford"] },
  { city: "Southampton", region: "Hampshire", areas: ["City Centre", "Bitterne", "Shirley", "Millbrook", "Eastleigh"] },
  { city: "Brighton", region: "East Sussex", areas: ["City Centre", "Hove", "Portslade", "Whitehawk", "Preston Park"] },
  { city: "Leicester", region: "Leicestershire", areas: ["City Centre", "Belgrave", "Oadby", "Beaumont Leys", "Hamilton"] },
  { city: "Coventry", region: "West Midlands", areas: ["City Centre", "Tile Hill", "Foleshill", "Binley", "Canley"] },
  { city: "Bradford", region: "West Yorkshire", areas: ["City Centre", "Shipley", "Keighley", "Manningham", "Bingley"] },
  { city: "Reading", region: "Berkshire", areas: ["Town Centre", "Caversham", "Tilehurst", "Whitley", "Winnersh"] },
  { city: "Northampton", region: "Northamptonshire", areas: ["Town Centre", "Abington", "Kingsthorpe", "Weston Favell", "Moulton"] },
  { city: "Luton", region: "Bedfordshire", areas: ["Town Centre", "Bury Park", "Stopsley", "Leagrave", "Dunstable Road"] },
  { city: "Wolverhampton", region: "West Midlands", areas: ["City Centre", "Bilston", "Wednesfield", "Penn", "Tettenhall"] },
  { city: "Derby", region: "Derbyshire", areas: ["City Centre", "Alvaston", "Mickleover", "Chaddesden", "Sinfin"] },
  { city: "Plymouth", region: "Devon", areas: ["City Centre", "Devonport", "Peverell", "Estover", "Plympton"] },
  { city: "York", region: "North Yorkshire", areas: ["City Centre", "Acomb", "Huntington", "Fulford", "Clifton"] },
  { city: "Cambridge", region: "Cambridgeshire", areas: ["City Centre", "Cherry Hinton", "Arbury", "Chesterton", "Trumpington"] },
  { city: "Oxford", region: "Oxfordshire", areas: ["City Centre", "Headington", "Cowley", "Summertown", "Blackbird Leys"] },
  { city: "Belfast", region: "Northern Ireland", areas: ["City Centre", "Lisburn Road", "Titanic Quarter", "Andersonstown", "Holywood"] },
  { city: "Cardiff", region: "Wales", areas: ["City Centre", "Cardiff Bay", "Canton", "Roath", "Llanrumney"] },
  { city: "Swansea", region: "Wales", areas: ["City Centre", "Uplands", "Morriston", "Gorseinon", "Sketty"] },
  { city: "Aberdeen", region: "Scotland", areas: ["City Centre", "Bridge of Don", "Torry", "Westhill", "Dyce"] },
  { city: "Dundee", region: "Scotland", areas: ["City Centre", "Broughty Ferry", "Lochee", "Stobswell", "Coldside"] },
  { city: "Exeter", region: "Devon", areas: ["City Centre", "Heavitree", "St Thomas", "Topsham", "Pinhoe"] },
  { city: "Bournemouth", region: "Dorset", areas: ["Town Centre", "Boscombe", "Poole", "Winton", "Kinson"] },
  { city: "Ipswich", region: "Suffolk", areas: ["Town Centre", "Chantry", "Rushmere", "Kesgrave", "Whitton"] },
  { city: "Norwich", region: "Norfolk", areas: ["City Centre", "Thorpe St Andrew", "Earlham", "Hellesdon", "Lakenham"] },
  { city: "Hull", region: "East Yorkshire", areas: ["City Centre", "Anlaby", "Beverley Road", "Bransholme", "Hessle"] },
  { city: "Stoke-on-Trent", region: "Staffordshire", areas: ["Hanley", "Longton", "Burslem", "Tunstall", "Fenton"] },
  { city: "Preston", region: "Lancashire", areas: ["City Centre", "Fulwood", "Ashton", "Deepdale", "Penwortham"] },
  { city: "Sunderland", region: "Tyne and Wear", areas: ["City Centre", "Roker", "Hendon", "Washington", "Seaburn"] },
  { city: "Milton Keynes", region: "Buckinghamshire", areas: ["Central MK", "Bletchley", "Wolverton", "Shenley", "Olney"] },
  { city: "Swindon", region: "Wiltshire", areas: ["Town Centre", "Old Town", "Park South", "Penhill", "Wroughton"] },
  { city: "Cheltenham", region: "Gloucestershire", areas: ["Town Centre", "Prestbury", "Hatherley", "Pittville", "Leckhampton"] },
  { city: "Canterbury", region: "Kent", areas: ["City Centre", "Sturry", "Wincheap", "Harbledown", "Whitstable"] },
  { city: "Inverness", region: "Scotland", areas: ["City Centre", "Crown", "Raigmore", "Culloden", "Dalneigh"] },
  { city: "Wrexham", region: "Wales", areas: ["Town Centre", "Gwersyllt", "Rhos", "Acton", "Llay"] },
];

const ROLE_CATALOG = [
  // Healthcare
  { vertical: "healthcare", title: "Registered Nurse (Band 5) — Medical Ward", jobType: "permanent", remote: "onsite", salary: NHS_BAND_5, skills: ["NMC", "Acute care", "Medication administration"], dept: "Medical Ward" },
  { vertical: "healthcare", title: "Registered Nurse (Band 5) — A&E", jobType: "permanent", remote: "onsite", salary: NHS_BAND_5, skills: ["NMC", "A&E", "Triage"], dept: "Accident & Emergency" },
  { vertical: "healthcare", title: "Registered Nurse (Band 6) — Community", jobType: "permanent", remote: "hybrid", salary: NHS_BAND_6, skills: ["NMC", "Community nursing", "Care planning"], dept: "Community Nursing" },
  { vertical: "healthcare", title: "Healthcare Assistant (Band 2)", jobType: "permanent", remote: "onsite", salary: NHS_BAND_2, skills: ["Vital signs", "Patient hygiene", "Ward support"], dept: "Inpatient Ward" },
  { vertical: "healthcare", title: "Care Assistant — Residential", jobType: "permanent", remote: "onsite", salary: { min: 12.21, max: 13.5, period: "hour" }, skills: ["Personal care", "Manual handling", "Medication support"], dept: "Residential Care" },
  { vertical: "healthcare", title: "Support Worker — Learning Disabilities", jobType: "permanent", remote: "onsite", salary: { min: 12.21, max: 13.8, period: "hour" }, skills: ["Learning disabilities", "Community care", "Person-centred support"], dept: "Community Support" },
  { vertical: "healthcare", title: "Registered Mental Health Nurse (Band 6)", jobType: "permanent", remote: "onsite", salary: NHS_BAND_6, skills: ["NMC", "Mental Health Act", "Risk assessment"], dept: "Acute Mental Health" },
  { vertical: "healthcare", title: "Physiotherapist — MSK Outpatients", jobType: "permanent", remote: "hybrid", salary: NHS_BAND_6, skills: ["HCPC", "MSK", "Rehabilitation"], dept: "Outpatients" },
  { vertical: "healthcare", title: "Occupational Therapist", jobType: "permanent", remote: "hybrid", salary: NHS_BAND_6, skills: ["HCPC", "Functional assessment", "Discharge planning"], dept: "Therapies" },
  { vertical: "healthcare", title: "Midwife — Community & Birth Centre", jobType: "permanent", remote: "onsite", salary: NHS_BAND_6, skills: ["NMC Midwifery", "Antenatal care", "Labour ward"], dept: "Maternity" },
  { vertical: "healthcare", title: "Paramedic — Emergency Response", jobType: "permanent", remote: "onsite", salary: { min: 38000, max: 45000, period: "year" }, skills: ["HCPC", "Emergency care", "Blue light driving"], dept: "Ambulance Service" },
  { vertical: "healthcare", title: "Pharmacy Technician", jobType: "permanent", remote: "onsite", salary: { min: 26000, max: 32000, period: "year" }, skills: ["GPhC", "Dispensing", "Stock control"], dept: "Hospital Pharmacy" },
  { vertical: "healthcare", title: "Dental Nurse — Private Practice", jobType: "permanent", remote: "onsite", salary: { min: 24000, max: 29000, period: "year" }, skills: ["GDC", "Chairside assistance", "Sterilisation"], dept: "Dental Surgery" },
  { vertical: "healthcare", title: "Support Worker — Mental Health", jobType: "permanent", remote: "onsite", salary: { min: 12.21, max: 14.0, period: "hour" }, skills: ["Recovery support", "Risk awareness", "Community outreach"], dept: "Supported Living" },
  { vertical: "healthcare", title: "Registered Nurse — ICU", jobType: "permanent", remote: "onsite", salary: NHS_BAND_6, skills: ["NMC", "Critical care", "Ventilation"], dept: "Intensive Care" },
  // Trades
  { vertical: "trades", title: "Electrician — Commercial Fit-Out", jobType: "contract", remote: "onsite", salary: { min: 220, max: 280, period: "day" }, skills: ["ECS Gold", "18th Edition", "Commercial wiring"], dept: "Electrical" },
  { vertical: "trades", title: "Plumber — Domestic & Commercial", jobType: "permanent", remote: "onsite", salary: { min: 32000, max: 42000, period: "year" }, skills: ["Gas Safe", "Boiler installation", "Reactive maintenance"], dept: "Plumbing" },
  { vertical: "trades", title: "Gas Engineer — Service & Repair", jobType: "permanent", remote: "onsite", salary: { min: 35000, max: 45000, period: "year" }, skills: ["Gas Safe CCN1", "Boiler repair", "CP12"], dept: "Heating" },
  { vertical: "trades", title: "Carpenter / Joiner", jobType: "contract", remote: "onsite", salary: { min: 180, max: 230, period: "day" }, skills: ["CSCS", "First fix", "Second fix"], dept: "Joinery" },
  { vertical: "trades", title: "Site Manager — Residential", jobType: "permanent", remote: "onsite", salary: { min: 48000, max: 58000, period: "year" }, skills: ["SMSTS", "CSCS Black", "NHBC standards"], dept: "Construction" },
  { vertical: "trades", title: "HGV Class 1 Driver", jobType: "permanent", remote: "onsite", salary: { min: 32000, max: 42000, period: "year" }, skills: ["Class 1 licence", "CPC", "Tachograph"], dept: "Logistics" },
  { vertical: "trades", title: "Welder — Fabrication", jobType: "contract", remote: "onsite", salary: { min: 160, max: 210, period: "day" }, skills: ["MIG/TIG", "Blue card", "Structural steel"], dept: "Fabrication" },
  { vertical: "trades", title: "HVAC Engineer", jobType: "permanent", remote: "onsite", salary: { min: 38000, max: 48000, period: "year" }, skills: ["F-Gas", "VRF systems", "Commissioning"], dept: "Building Services" },
  { vertical: "trades", title: "Painter & Decorator", jobType: "contract", remote: "onsite", salary: { min: 150, max: 190, period: "day" }, skills: ["CSCS", "Spray painting", "Heritage finishes"], dept: "Decorating" },
  { vertical: "trades", title: "Bricklayer", jobType: "contract", remote: "onsite", salary: { min: 170, max: 220, period: "day" }, skills: ["CSCS", "Blockwork", "Heritage brickwork"], dept: "Masonry" },
  { vertical: "trades", title: "Roofer — Pitched & Flat", jobType: "contract", remote: "onsite", salary: { min: 160, max: 200, period: "day" }, skills: ["CSCS", "Slating", "GRP flat roofing"], dept: "Roofing" },
  { vertical: "trades", title: "Groundworker — Civils", jobType: "contract", remote: "onsite", salary: { min: 150, max: 185, period: "day" }, skills: ["CSCS", "Excavation", "Duct laying"], dept: "Civil Engineering" },
  // Tech
  { vertical: "tech", title: "Software Engineer (TypeScript)", jobType: "permanent", remote: "hybrid", salary: { min: 50000, max: 70000, period: "year" }, skills: ["TypeScript", "React", "Node.js"], dept: "Engineering" },
  { vertical: "tech", title: "Full Stack Developer", jobType: "permanent", remote: "remote", salary: { min: 55000, max: 75000, period: "year" }, skills: ["JavaScript", "PostgreSQL", "AWS"], dept: "Product Engineering" },
  { vertical: "tech", title: "DevOps Engineer", jobType: "permanent", remote: "hybrid", salary: { min: 60000, max: 80000, period: "year" }, skills: ["AWS", "Terraform", "Kubernetes"], dept: "Platform" },
  { vertical: "tech", title: "Data Analyst", jobType: "permanent", remote: "hybrid", salary: { min: 38000, max: 52000, period: "year" }, skills: ["SQL", "Power BI", "Python"], dept: "Analytics" },
  { vertical: "tech", title: "Product Manager — B2B SaaS", jobType: "permanent", remote: "hybrid", salary: { min: 55000, max: 75000, period: "year" }, skills: ["Roadmapping", "User research", "Agile"], dept: "Product" },
  { vertical: "tech", title: "UX Designer", jobType: "permanent", remote: "hybrid", salary: { min: 42000, max: 58000, period: "year" }, skills: ["Figma", "User testing", "Design systems"], dept: "Design" },
  { vertical: "tech", title: "Cyber Security Analyst", jobType: "permanent", remote: "hybrid", salary: { min: 45000, max: 62000, period: "year" }, skills: ["SIEM", "ISO 27001", "Incident response"], dept: "Security" },
  { vertical: "tech", title: "Cloud Engineer — Azure", jobType: "permanent", remote: "remote", salary: { min: 58000, max: 78000, period: "year" }, skills: ["Azure", "DevOps", "IaC"], dept: "Infrastructure" },
  { vertical: "tech", title: "QA Engineer — Automation", jobType: "permanent", remote: "hybrid", salary: { min: 40000, max: 55000, period: "year" }, skills: ["Playwright", "Cypress", "Test strategy"], dept: "Quality Assurance" },
  { vertical: "tech", title: "IT Support Analyst — 2nd Line", jobType: "permanent", remote: "onsite", salary: { min: 28000, max: 35000, period: "year" }, skills: ["Microsoft 365", "Active Directory", "ITIL"], dept: "IT Service Desk" },
  { vertical: "tech", title: "Machine Learning Engineer", jobType: "permanent", remote: "hybrid", salary: { min: 65000, max: 90000, period: "year" }, skills: ["Python", "PyTorch", "MLOps"], dept: "AI Lab" },
  { vertical: "tech", title: "Frontend Developer — React", jobType: "permanent", remote: "remote", salary: { min: 48000, max: 65000, period: "year" }, skills: ["React", "Next.js", "Accessibility"], dept: "Frontend" },
  // General
  { vertical: "general", title: "Warehouse Operative", jobType: "permanent", remote: "onsite", salary: { min: 12.21, max: 14.5, period: "hour" }, skills: ["Pick and pack", "Manual handling", "FLT"], dept: "Distribution" },
  { vertical: "general", title: "Retail Supervisor", jobType: "permanent", remote: "onsite", salary: { min: 26000, max: 32000, period: "year" }, skills: ["Team leadership", "Stock management", "Customer service"], dept: "Retail" },
  { vertical: "general", title: "Customer Service Advisor", jobType: "permanent", remote: "hybrid", salary: { min: 24000, max: 28000, period: "year" }, skills: ["CRM", "Complaint handling", "Telephony"], dept: "Customer Operations" },
  { vertical: "general", title: "HR Coordinator", jobType: "permanent", remote: "hybrid", salary: { min: 28000, max: 34000, period: "year" }, skills: ["HRIS", "Onboarding", "Employee relations"], dept: "Human Resources" },
  { vertical: "general", title: "Finance Assistant", jobType: "permanent", remote: "hybrid", salary: { min: 26000, max: 32000, period: "year" }, skills: ["Sage", "Purchase ledger", "Reconciliation"], dept: "Finance" },
  { vertical: "general", title: "Marketing Executive", jobType: "permanent", remote: "hybrid", salary: { min: 28000, max: 36000, period: "year" }, skills: ["Social media", "Content", "Google Ads"], dept: "Marketing" },
  { vertical: "general", title: "Delivery Driver — Multi-Drop", jobType: "permanent", remote: "onsite", salary: { min: 12.21, max: 15.0, period: "hour" }, skills: ["Cat B licence", "Route planning", "Customer service"], dept: "Last Mile" },
  { vertical: "general", title: "Chef de Partie", jobType: "permanent", remote: "onsite", salary: { min: 28000, max: 34000, period: "year" }, skills: ["Level 2 Food Hygiene", "Gastro kitchen", "Menu prep"], dept: "Kitchen" },
  { vertical: "general", title: "Administration Assistant", jobType: "temporary", remote: "onsite", salary: { min: 12.21, max: 13.5, period: "hour" }, skills: ["Microsoft Office", "Diary management", "Data entry"], dept: "Administration" },
  { vertical: "general", title: "Receptionist — Corporate", jobType: "permanent", remote: "onsite", salary: { min: 24000, max: 28000, period: "year" }, skills: ["Front of house", "Visitor management", "Switchboard"], dept: "Facilities" },
];

const EMPLOYER_PREFIXES = {
  healthcare: ["NHS Foundation Trust", "Care Group", "Healthcare Services", "Community Health", "Medical Centre", "Care Homes"],
  trades: ["Building Services", "Construction Ltd", "Engineering Solutions", "Maintenance Group", "Contractors", "Property Services"],
  tech: ["Digital Ltd", "Software Ltd", "Tech Solutions", "Labs", "Systems", "Analytics"],
  general: ["Logistics Ltd", "Retail Group", "Business Services", "Operations Ltd", "Facilities Management", "Staffing Solutions"],
};

const EMPLOYER_NAMES = [
  "Meridian", "Apex", "Summit", "Harbour", "Cedar", "Oakwood", "Northgate", "Riverside", "Sterling", "Atlas",
  "Beacon", "Crown", "Delta", "Elm", "Falcon", "Granite", "Horizon", "Ivory", "Juniper", "Kestrel",
  "Lancaster", "Meadow", "Nova", "Orchard", "Pinnacle", "Quartz", "Redwood", "Sapphire", "Thames", "Unity",
  "Vantage", "Willow", "Zenith", "Bridgewater", "Castleford", "Dunelm", "Evergreen", "Fairview", "Greenfield", "Highland",
];

const OPENINGS = [
  (e, c, d) => `${e} is recruiting for its ${d} team in ${c}.`,
  (e, c, d) => `An established ${c} employer, ${e}, has an opening in ${d}.`,
  (e, c, d) => `${e} is expanding operations across ${c} and seeks a new colleague for ${d}.`,
  (e, c, d) => `Join ${e} — a trusted name in ${c} — in this ${d} vacancy.`,
  (e, c, d) => `${e} is hiring locally in ${c} for a role within ${d}.`,
];

const RESPONSIBILITIES = {
  healthcare: [
    "Deliver safe, compassionate care aligned with CQC and NHS standards.",
    "Maintain accurate patient records and handover documentation.",
    "Work collaboratively with MDT colleagues including doctors and therapists.",
    "Support infection prevention and safeguarding procedures.",
    "Participate in clinical audits and quality improvement initiatives.",
    "Mentor junior staff and students on placement where applicable.",
  ],
  trades: [
    "Complete work to specification, on programme, and to safe working practices.",
    "Conduct site inspections and risk assessments before starting tasks.",
    "Liaise with project managers, clients, and other trades on site.",
    "Maintain tools, plant, and PPE in good working order.",
    "Ensure compliance with CDM regulations and method statements.",
    "Complete snagging and quality checks before sign-off.",
  ],
  tech: [
    "Build and maintain production-grade software with clear code review standards.",
    "Collaborate with product and design on user stories and acceptance criteria.",
    "Monitor system performance, incidents, and post-mortems.",
    "Contribute to technical documentation and engineering best practices.",
    "Participate in agile ceremonies and cross-functional planning.",
    "Support production releases and on-call rotation as required.",
  ],
  general: [
    "Deliver day-to-day operations to agreed KPIs and service standards.",
    "Handle customer or stakeholder enquiries professionally.",
    "Maintain accurate records and report issues to line management.",
    "Support team targets during peak periods and cover where needed.",
    "Follow company policies including health & safety and GDPR.",
    "Identify process improvements and share feedback with supervisors.",
  ],
};

const REQUIREMENTS = {
  healthcare: [
    "Right to work in the UK and valid enhanced DBS (we can support applications).",
    "Strong communication skills and a person-centred approach.",
    "Ability to work rotating shifts including weekends and bank holidays.",
    "Commitment to mandatory training and revalidation where applicable.",
  ],
  trades: [
    "Relevant trade qualifications and valid CSCS card (or equivalent).",
    "Own transport or reliable commute to sites across the local area.",
    "Strong attention to detail and commitment to safe systems of work.",
    "Right to work in the UK — CIS or PAYE options discussed at interview.",
  ],
  tech: [
    "Right to work in the UK without sponsorship (unless stated otherwise).",
    "Strong problem-solving skills and clear written communication.",
    "Experience working in agile product teams.",
    "Portfolio or GitHub examples welcome for technical roles.",
  ],
  general: [
    "Right to work in the UK.",
    "Reliable attendance and flexible approach to shift patterns.",
    "Good literacy, numeracy, and IT skills.",
    "Previous experience in a similar environment is advantageous.",
  ],
};

const BENEFITS = [
  "Enhanced pension scheme and paid annual leave.",
  "Employee assistance programme and wellbeing support.",
  "Structured induction and ongoing training.",
  "Staff discount or cycle-to-work scheme where applicable.",
  "Clear progression pathways and regular performance reviews.",
  "Free on-site parking or travel allowance for eligible roles.",
  "Refer-a-friend bonus after successful probation.",
  "Flexible benefits platform including dental and optical cover.",
];

const SHIFTS = [
  "Full-time, 37.5 hours per week.",
  "Permanent days with occasional overtime.",
  "4 on / 4 off shift pattern.",
  "Days, nights, or rotating shifts available.",
  "Part-time hours considered — minimum 24 hours per week.",
  "Monday to Friday with 1 in 4 weekends.",
  "Hybrid working: 2–3 days on site per week.",
  "Fully remote within UK time zones.",
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function pickMany(arr, count, seed) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(arr[(seed + i * 7) % arr.length]);
  return [...new Set(out)];
}

function jitter(value, pct, seed) {
  const delta = value * pct * ((seed % 21) - 10) / 10;
  return Math.round(value + delta);
}

function employerName(vertical, city, seed) {
  const prefix = pick(EMPLOYER_NAMES, seed);
  const suffix = pick(EMPLOYER_PREFIXES[vertical], seed + 3);
  if (vertical === "healthcare" && seed % 4 === 0) {
    return `${city} ${suffix}`;
  }
  return `${prefix} ${suffix}`;
}

function buildDescription(role, cityMeta, area, company, seed) {
  const opening = pick(OPENINGS, seed)(company, cityMeta.city, role.dept);
  const resp = pickMany(RESPONSIBILITIES[role.vertical], 4, seed + 1);
  const reqs = pickMany(REQUIREMENTS[role.vertical], 3, seed + 2);
  const perks = pickMany(BENEFITS, 3, seed + 3);
  const shift = pick(SHIFTS, seed + 4);

  const salaryLine =
    role.salary.period === "hour"
      ? `Pay rate: £${role.salary.min.toFixed(2)}–£${role.salary.max.toFixed(2)} per hour.`
      : role.salary.period === "day"
        ? `Day rate: £${role.salary.min}–£${role.salary.max} (CIS/PAYE).`
        : `Salary: £${role.salary.min.toLocaleString()}–£${role.salary.max.toLocaleString()} per annum.`;

  return [
    opening,
    "",
    `You will be based in ${area}, ${cityMeta.city} (${cityMeta.region}). ${shift}`,
    "",
    "Key responsibilities:",
    ...resp.map((r) => `• ${r}`),
    "",
    "What we need from you:",
    ...reqs.map((r) => `• ${r}`),
    "",
    "What we offer:",
    ...perks.map((b) => `• ${b}`),
    "",
    salaryLine,
    "",
    "Apply now — shortlisting is ongoing and early applications are encouraged.",
  ].join("\n");
}

function postcodeFor(city, seed) {
  const prefixes = {
    London: ["E1", "SW1A", "N7", "SE1", "W1"],
    Manchester: ["M1", "M2", "M14", "M20", "M4"],
    Birmingham: ["B1", "B5", "B15", "B23", "B30"],
    Glasgow: ["G1", "G2", "G11", "G31", "G51"],
    Edinburgh: ["EH1", "EH3", "EH6", "EH10", "EH12"],
    Cardiff: ["CF10", "CF11", "CF14", "CF24", "CF5"],
    Belfast: ["BT1", "BT7", "BT9", "BT12", "BT15"],
  };
  const list = prefixes[city] ?? [`${city.slice(0, 2).toUpperCase()}1`];
  const base = pick(list, seed);
  return `${base} ${1 + (seed % 9)}${String.fromCharCode(65 + (seed % 26))}${String.fromCharCode(65 + ((seed * 3) % 26))}`;
}

/**
 * @param {number} targetCount
 * @param {number} jobsPerCity
 */
export function generateJobListings(targetCount = 220, jobsPerCity = 5) {
  const listings = [];
  let seed = 42;

  for (let ci = 0; ci < UK_CITIES.length && listings.length < targetCount; ci++) {
    const cityMeta = UK_CITIES[ci];
    for (let ji = 0; ji < jobsPerCity && listings.length < targetCount; ji++) {
      const roleIndex = (ci * jobsPerCity + ji) % ROLE_CATALOG.length;
      const role = ROLE_CATALOG[roleIndex];
      const area = pick(cityMeta.areas, seed + ji);
      const company = employerName(role.vertical, cityMeta.city, seed + ci);
      const titleSuffix = ji > 0 && seed % 3 === 0 ? ` — ${area}` : "";
      const title = `${role.title}${titleSuffix}`;
      const roleSlug = slugify(role.title);
      const slug = `${roleSlug}-${slugify(cityMeta.city)}-${ci}-${ji}`;

      const salary = {
        min: jitter(role.salary.min, 0.04, seed),
        max: jitter(role.salary.max, 0.04, seed + 1),
        period: role.salary.period,
      };
      if (salary.min > salary.max) [salary.min, salary.max] = [salary.max, salary.min];

      listings.push({
        slug,
        title,
        description: buildDescription(role, cityMeta, area, company, seed),
        location: `${area}, ${cityMeta.city}`,
        city: cityMeta.city,
        region: cityMeta.region,
        postcode: postcodeFor(cityMeta.city, seed),
        vertical: role.vertical,
        job_type: role.jobType,
        remote: role.remote,
        salary_min: salary.min,
        salary_max: salary.max,
        salary_period: salary.period,
        salary_disclosed: true,
        skills: role.skills,
        featured: seed % 17 === 0,
        company_name: company,
        employer_slug: slugify(`${company}-${cityMeta.city}`),
        compliance: { source: "bulk-seed", employer_display: company },
      });

      seed += 11;
    }
  }

  return listings;
}
