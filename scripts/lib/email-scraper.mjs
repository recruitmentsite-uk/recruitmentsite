/**
 * Fetch employer websites and extract contact emails from HTML.
 */

const EMAIL_RE =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const JUNK_EMAIL_RE =
  /^(noreply|no-reply|donotreply|mailer-daemon|postmaster|webmaster|sentry|example|test|admin@wordpress|wordpress@|.*@(sentry\.io|sentry-next\.wixpress\.com|wixpress\.com|example\.com|email\.com|domain\.com|yourdomain\.com|yoursite\.com|test\.com|localhost))/i;

const FREEMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
]);

const JUNK_SUFFIX_RE = /\.(png|jpe?g|gif|svg|webp|css|js)$/i;

const PREFERRED_PREFIXES = [
  "recruitment",
  "careers",
  "jobs",
  "hr",
  "hiring",
  "info",
  "contact",
  "enquiries",
  "enquiry",
  "admin",
  "office",
  "hello",
];

const CONTACT_PATHS = [
  "",
  "/contact",
  "/contact-us",
  "/contactus",
  "/about",
  "/about-us",
  "/careers",
  "/jobs",
  "/recruitment",
  "/work-with-us",
  "/get-in-touch",
];

const FETCH_TIMEOUT_MS = 12_000;
const MAX_PAGES = 6;

/** @param {string | undefined} raw */
export function normalizeWebsite(raw) {
  if (!raw) return undefined;
  let w = raw.trim();
  if (!w || w === "None") return undefined;

  // CQC sometimes lists multiple URLs or corrupted values.
  if (w.includes(" & ")) w = w.split(" & ")[0].trim();
  if (w.includes("javascript:")) w = w.split("javascript:")[0].trim();
  w = w.replace(/[,;].*$/, "").trim();
  if (!w) return undefined;

  if (!/^https?:\/\//i.test(w)) w = `https://${w}`;

  try {
    const url = new URL(w);
    if (!url.hostname || !url.hostname.includes(".")) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

/** @param {string | undefined} website */
export function domainFromWebsite(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/** @param {string} email */
function isJunkEmail(email) {
  const lower = email.toLowerCase();
  if (JUNK_SUFFIX_RE.test(lower)) return true;
  if (JUNK_EMAIL_RE.test(lower)) return true;
  if (lower.length > 80) return true;
  return false;
}

/** @param {string} html */
export function extractEmailsFromHtml(html) {
  const found = new Set();

  for (const match of html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)) {
    found.add(match[1].toLowerCase());
  }

  for (const match of html.matchAll(EMAIL_RE)) {
    found.add(match[0].toLowerCase());
  }

  return [...found].filter((e) => !isJunkEmail(e));
}

/** @param {string} email @param {string | undefined} domain */
function scoreEmail(email, domain) {
  const local = email.split("@")[0];
  const emailDomain = email.split("@")[1] ?? "";
  let score = 0;

  if (FREEMAIL_DOMAINS.has(emailDomain)) score -= 40;

  if (domain && (emailDomain === domain || emailDomain.endsWith(`.${domain}`))) {
    score += 50;
  } else if (domain && emailDomain.includes(domain.split(".")[0])) {
    score += 20;
  }

  for (let i = 0; i < PREFERRED_PREFIXES.length; i++) {
    if (local.startsWith(PREFERRED_PREFIXES[i])) {
      score += 30 - i;
      break;
    }
  }

  if (local === "info" || local === "contact") score += 5;
  if (emailDomain.endsWith(".gov.uk")) score -= 100;
  return score;
}

/** @param {string[]} emails @param {string | undefined} domain */
export function pickBestEmail(emails, domain) {
  const viable = emails.filter((e) => {
    const emailDomain = e.split("@")[1] ?? "";
    if (emailDomain.includes("wixpress") || emailDomain.includes("sentry")) return false;
    if (FREEMAIL_DOMAINS.has(emailDomain) && emails.some((x) => (x.split("@")[1] ?? "") === domain)) {
      return false;
    }
    return true;
  });
  if (!viable.length) return undefined;
  return [...viable].sort((a, b) => scoreEmail(b, domain) - scoreEmail(a, domain))[0];
}

/** @param {string} baseUrl @param {string} path */
function pageUrl(baseUrl, path) {
  if (!path) return baseUrl;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

/** @param {string} url */
async function fetchHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PlaceUK-ProspectBot/1.0; +https://recruitmentsite.co.uk)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return undefined;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html") && !type.includes("text/plain")) return undefined;
    const text = await res.text();
    return text.slice(0, 500_000);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/** @param {string | undefined} website */
export async function scrapeEmailsFromWebsite(website) {
  const baseUrl = normalizeWebsite(website);
  if (!baseUrl) return { emails: [], baseUrl: undefined, pagesFetched: 0 };

  const domain = domainFromWebsite(baseUrl);
  const allEmails = new Set();
  let pagesFetched = 0;

  for (const path of CONTACT_PATHS) {
    if (pagesFetched >= MAX_PAGES) break;
    const url = pageUrl(baseUrl, path);
    const html = await fetchHtml(url);
    if (!html) continue;
    pagesFetched++;
    for (const email of extractEmailsFromHtml(html)) {
      allEmails.add(email);
    }
    if (allEmails.size >= 3) break;
  }

  return {
    emails: [...allEmails],
    baseUrl,
    domain,
    pagesFetched,
    best: pickBestEmail([...allEmails], domain),
  };
}

/** @param {string | undefined} domain */
export function guessEmails(domain) {
  if (!domain) return [];
  return ["recruitment", "careers", "jobs", "hr", "info"].map((pre) => `${pre}@${domain}`);
}
