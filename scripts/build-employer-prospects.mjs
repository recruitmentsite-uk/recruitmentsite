#!/usr/bin/env node
/**
 * Build employer prospect list from CQC public directory + curated seeds.
 * No cap on list size — all England care homes & homecare agencies (excl. mega groups).
 * Multi-sector UK growth continues via prospects:competitors + prospects:ingest (board discovery).
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../data");
const outPath = join(dataDir, "employer-prospects.json");
const curatedPath = join(dataDir, "curated-employer-prospects.json");
const cqcCsvPath = join(dataDir, "cqc-care-directory.csv");

const CQC_CSV_URL =
  "https://www.cqc.org.uk/sites/default/files/2026-07/15_July_2026_CQC_directory.csv";

/** Mega groups — deprioritise; still listed at priority 3 if included */
const EXCLUDED_PROVIDERS = [
  "care uk care services",
  "barchester healthcare",
  "hc-one",
  "h c one",
  "sanctuary care",
  "anchor hanover",
  "methodist homes",
  "four seasons health care",
  "bupa care",
  "spire healthcare",
  "nuffield health",
];

const CARE_SERVICE_RE =
  /nursing homes|residential homes|homecare agencies|supported living/i;

function isExcluded(providerName) {
  const lower = (providerName ?? "").toLowerCase();
  return EXCLUDED_PROVIDERS.some((p) => lower.includes(p));
}

function prospectKey(p) {
  return p.cqcLocationId ?? `${p.companyName}|${p.city}`.toLowerCase();
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}

function normalizeWebsite(raw) {
  const w = (raw ?? "").trim();
  if (!w || w === "None") return undefined;
  if (/^https?:\/\//i.test(w)) return w;
  return `https://${w}`;
}

function domainFromWebsite(website) {
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    return host || undefined;
  } catch {
    return undefined;
  }
}

function inferPriority(providerName, serviceType) {
  if (isExcluded(providerName)) return 3;
  if (/homecare agencies/i.test(serviceType)) return 2;
  return 1;
}

function normalizeProspect(p) {
  const email = p.email?.endsWith(".example") ? undefined : p.email;
  const website = normalizeWebsite(p.website);
  const domain = p.domain ?? (website ? domainFromWebsite(website) : undefined);

  return {
    ...p,
    email,
    website,
    domain,
    emailStatus: email ? p.emailStatus : p.emailStatus ?? "needs_enrichment",
    status: p.status ?? "prospect",
    addedAt: p.addedAt ?? new Date().toISOString(),
  };
}

function parseCqcCsv(text) {
  const lines = text.split(/\r?\n/);
  let headerIdx = lines.findIndex((l) => l.startsWith("Name,"));
  if (headerIdx === -1) headerIdx = 4;

  const prospects = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    if (cols.length < 12) continue;

    const [
      locationName,
      ,
      address,
      postcode,
      phone,
      websiteRaw,
      serviceType,
      ,
      ,
      providerName,
      localAuthority,
      region,
      ,
      cqcLocationId,
      cqcProviderId,
    ] = cols;

    if (!CARE_SERVICE_RE.test(serviceType ?? "")) continue;
    if (!locationName?.trim() || !providerName?.trim()) continue;

    const provider = providerName.trim();
    const city = (localAuthority ?? "").trim() || extractCityFromAddress(address) || "England";
    const priority = inferPriority(provider, serviceType);
    const isHomecare = /homecare agencies/i.test(serviceType);
    const role = isHomecare ? "Support Worker" : "Care Assistant";
    const board = priority === 3 ? "Reed" : "Indeed";

    prospects.push(
      normalizeProspect({
        companyName: locationName.trim(),
        providerName: provider,
        email: undefined,
        website: websiteRaw,
        phone: phone?.trim() || undefined,
        address: address?.trim() || undefined,
        postcode: postcode?.trim() || undefined,
        city,
        region: region?.trim() || undefined,
        vertical: "healthcare",
        employeeCount: isHomecare ? "10-50" : "10-50",
        tier: priority === 3 ? "national_group" : "independent",
        priority,
        competitorBoard: board,
        hiringSignal: `${role} on ${board}`,
        outreachHook: isHomecare
          ? "CQC homecare agency — high carer turnover, Indeed/Reed spend"
          : "CQC-registered care home — chronic staff shortage sector",
        cqcLocationId: cqcLocationId?.trim(),
        cqcProviderId: cqcProviderId?.trim(),
        serviceType: serviceType.trim(),
        source: "cqc_csv",
      }),
    );
  }
  return prospects;
}

function extractCityFromAddress(address) {
  if (!address) return undefined;
  const parts = address.split(",").map((s) => s.trim());
  return parts[parts.length - 1] || undefined;
}

async function ensureCqcCsv() {
  if (existsSync(cqcCsvPath)) {
    const ageMs = Date.now() - statSync(cqcCsvPath).mtimeMs;
    if (ageMs < 7 * 24 * 60 * 60 * 1000) return;
    console.log("  CQC CSV older than 7 days — re-downloading…");
  } else {
    console.log("  Downloading CQC care directory (~18MB)…");
  }

  mkdirSync(dataDir, { recursive: true });
  const res = await fetch(CQC_CSV_URL);
  if (!res.ok) throw new Error(`CQC download failed: ${res.status}`);
  writeFileSync(cqcCsvPath, Buffer.from(await res.arrayBuffer()));
  console.log("  ✓ CQC CSV saved");
}

function loadCurated() {
  if (!existsSync(curatedPath)) return [];
  return JSON.parse(readFileSync(curatedPath, "utf8")).map(normalizeProspect);
}

function mergeProspects(existing, incoming) {
  const merged = [...existing];
  const seen = new Set(existing.map(prospectKey));

  for (const p of incoming) {
    const key = prospectKey(p);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(normalizeProspect(p));
  }
  return merged;
}

function summarize(prospects) {
  const verified = prospects.filter((p) => p.email && p.emailStatus === "verified_public");
  const guessed = prospects.filter((p) => p.email && p.emailStatus === "guessed");
  const needsEnrichment = prospects.filter((p) => !p.email);
  const withWebsite = prospects.filter((p) => p.website);
  const priority1 = prospects.filter((p) => p.priority === 1);

  const byRegion = {};
  for (const p of prospects) {
    const r = p.region ?? "Unknown";
    byRegion[r] = (byRegion[r] ?? 0) + 1;
  }
  const topRegions = Object.entries(byRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([r, n]) => `${r} (${n})`)
    .join(", ");

  return {
    total: prospects.length,
    verified: verified.length,
    guessed: guessed.length,
    needsEnrichment: needsEnrichment.length,
    withWebsite: withWebsite.length,
    priority1: priority1.length,
    topRegions,
  };
}

async function main() {
  await ensureCqcCsv();

  let merged = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : [];

  const curated = loadCurated();
  console.log("  Parsing CQC CSV (all care homes + homecare, no limit)…");
  const fromCqc = parseCqcCsv(readFileSync(cqcCsvPath, "utf8"));

  merged = mergeProspects(merged, curated);
  merged = mergeProspects(merged, fromCqc);

  merged.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.email && !b.email) return -1;
    if (!a.email && b.email) return 1;
    return (a.region ?? "").localeCompare(b.region ?? "") || a.city.localeCompare(b.city);
  });

  writeFileSync(outPath, JSON.stringify(merged, null, 2));

  const stats = summarize(merged);
  console.log(`\n✓ ${stats.total.toLocaleString()} employer prospects → data/employer-prospects.json`);
  console.log(`  Priority 1 (care homes): ${stats.priority1.toLocaleString()}`);
  console.log(`  With website (enrichable): ${stats.withWebsite.toLocaleString()}`);
  console.log(`  Verified emails: ${stats.verified} | Guessed: ${stats.guessed} | Needs enrichment: ${stats.needsEnrichment.toLocaleString()}`);
  console.log(`  Top regions: ${stats.topRegions}`);
  console.log(`\n  Next: pnpm prospects:scrape  (scrape emails from websites)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
