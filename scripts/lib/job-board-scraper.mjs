import { setTimeout as sleep } from "node:timers/promises";

const USER_AGENT = "Mozilla/5.0 (compatible; PlaceUK-Research/1.0; +https://recruitmentsite.co.uk)";

/** @param {string} url */
export function boardFromRedirectUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("reed.co.uk")) return "Reed";
    if (host.includes("indeed.")) return "Indeed";
    if (host.includes("hays.")) return "Hays";
    if (host.includes("totaljobs.")) return "Totaljobs";
    if (host.includes("cv-library.")) return "CV-Library";
    if (host.includes("guardian.")) return "Guardian Jobs";
    return host.split(".")[0];
  } catch {
    return undefined;
  }
}

/** @param {string} slug @param {string} [locationSlug] @param {number} [page] */
export function reedSearchUrl(slug, locationSlug, page = 1) {
  const base = locationSlug
    ? `https://www.reed.co.uk/jobs/${slug}-jobs-in-${locationSlug}`
    : `https://www.reed.co.uk/jobs/${slug}-jobs`;
  return page > 1 ? `${base}?pageno=${page}` : base;
}

/** @param {string} url @param {number} [attempt] */
async function fetchReedSearch(url, attempt = 1) {
  const maxAttempts = 4;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const sr = data?.props?.pageProps?.searchResults;
    if (!sr?.jobs?.length) return { jobs: [], total: 0 };
    return { jobs: sr.jobs, total: sr.count ?? sr.jobs.length };
  } catch (err) {
    if (attempt < maxAttempts) {
      await sleep(2000 * attempt);
      return fetchReedSearch(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** @param {object} job */
export function parseReedJob(job) {
  const d = job.jobDetail ?? job;
  return {
    board: "Reed",
    employer: d.ouName ?? job.profileName,
    role: d.jobTitle,
    location: d.displayLocationName ?? d.countyLocation,
    jobUrl: d.jobId ? `https://www.reed.co.uk/jobs/${d.jobId}` : undefined,
  };
}

/**
 * @param {object} opts
 * @param {string} opts.slug
 * @param {string} [opts.locationSlug]
 * @param {number} [opts.maxPages]
 * @param {number} [opts.delayMs]
 */
export async function scrapeReedSearch({ slug, locationSlug, maxPages = 8, delayMs = 1500 }) {
  const listings = [];
  let pagesFetched = 0;

  for (let page = 1; page <= maxPages; page++) {
    const url = reedSearchUrl(slug, locationSlug, page);
    const data = await fetchReedSearch(url);
    pagesFetched++;
    if (!data?.jobs?.length) break;

    for (const job of data.jobs) {
      const parsed = parseReedJob(job);
      if (parsed.employer && parsed.role) listings.push(parsed);
    }

    const maxPage = Math.ceil((data.total ?? 0) / 25) || maxPages;
    if (page >= maxPage) break;
    await sleep(delayMs);
  }

  return { listings, pagesFetched };
}

/** @param {string} what @param {string} where @param {number} page */
async function fetchAdzunaPage(what, where, page) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return null;

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/gb/search/${page}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("what", what);
  url.searchParams.set("where", where);

  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/**
 * @param {object} opts
 * @param {string} opts.what
 * @param {string} [opts.where]
 * @param {number} [opts.maxPages]
 * @param {number} [opts.delayMs]
 */
export async function scrapeAdzunaSearch({ what, where = "uk", maxPages = 5, delayMs = 500 }) {
  const listings = [];

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchAdzunaPage(what, where, page);
    if (!data?.results?.length) break;

    for (const ad of data.results) {
      listings.push({
        board: boardFromRedirectUrl(ad.redirect_url) ?? "Adzuna",
        employer: ad.company?.display_name ?? ad.company,
        role: ad.title,
        location: ad.location?.display_name,
        jobUrl: ad.redirect_url,
      });
    }

    if (page >= Math.ceil((data.count ?? 0) / 50)) break;
    await sleep(delayMs);
  }

  return { listings };
}

export const CARE_SEARCHES = [
  { slug: "care-assistant", role: "Care Assistant" },
  { slug: "support-worker", role: "Support Worker" },
  { slug: "registered-nurse", role: "Registered Nurse" },
  { slug: "healthcare-assistant", role: "Healthcare Assistant" },
  { slug: "care-worker", role: "Care Worker" },
];

export const LOCATION_SLUGS = [
  "london",
  "manchester",
  "birmingham",
  "leeds",
  "liverpool",
  "bristol",
  "sheffield",
  "newcastle-upon-tyne",
  "nottingham",
  "southampton",
  "brighton",
  "leicester",
  "coventry",
  "bradford",
  "reading",
  "northampton",
  "luton",
  "wolverhampton",
  "derby",
  "plymouth",
  "kent",
  "essex",
  "surrey",
  "hampshire",
  "lancashire",
  "norfolk",
  "devon",
  "cornwall",
  "york",
  "cambridge",
];
