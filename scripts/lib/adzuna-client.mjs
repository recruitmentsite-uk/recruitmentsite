/**
 * Adzuna GB jobs API — https://developer.adzuna.com/
 */

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

/** Multiple queries per vertical for broader coverage. */
export const ADZUNA_QUERIES = {
  healthcare: ["nurse", "care assistant", "healthcare assistant", "support worker"],
  trades: ["electrician", "plumber", "site manager", "carpenter"],
  tech: ["software developer", "devops", "data analyst", "product manager"],
  education: ["teacher", "teaching assistant", "sendco"],
  hospitality: ["chef", "restaurant manager", "barista"],
  logistics: ["warehouse operative", "hgv driver", "forklift"],
  finance: ["accountant", "bookkeeper", "financial analyst"],
  retail: ["retail assistant", "store manager", "customer service"],
  legal: ["solicitor", "paralegal", "compliance"],
  marketing: ["marketing executive", "content manager", "graphic designer"],
  engineering: ["mechanical engineer", "cnc machinist", "quality engineer"],
};

export function isAdzunaConfigured() {
  return Boolean(APP_ID && APP_KEY);
}

export async function searchAdzunaJobs({ what, where = "uk", page = 1, resultsPerPage = 50 } = {}) {
  if (!isAdzunaConfigured()) return null;
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/gb/search/${page}`);
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", String(resultsPerPage));
  url.searchParams.set("what", what);
  url.searchParams.set("where", where);
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Adzuna ${res.status}: ${body.slice(0, 160)}`);
  }
  return res.json();
}

export function normalizeAdzunaJob(ad, vertical = "general") {
  const id = ad.id ? String(ad.id) : null;
  return {
    slug: id ? `adzuna-${id}` : `adzuna-${Date.now()}`,
    title: ad.title || "Untitled role",
    description: (ad.description || ad.title || "").slice(0, 4000),
    location: ad.location?.display_name ?? "UK",
    city: ad.location?.area?.[ad.location.area.length - 1] ?? ad.location?.area?.[0] ?? "UK",
    region: ad.location?.area?.[0] ?? "UK",
    vertical,
    job_type: ad.contract_type?.toLowerCase()?.includes("contract") ? "contract" : "permanent",
    remote: /remote/i.test(ad.title || "") ? "remote" : "onsite",
    salary_min: ad.salary_min ?? null,
    salary_max: ad.salary_max ?? null,
    salary_disclosed: !!(ad.salary_min || ad.salary_max),
    status: "active",
    published_at: ad.created ?? new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    external_source: "adzuna",
    external_id: id,
    compliance: { source: "adzuna", redirect_url: ad.redirect_url ?? null, company: ad.company?.display_name ?? null },
  };
}
