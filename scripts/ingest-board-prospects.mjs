#!/usr/bin/env node
/**
 * Upsert employers discovered on Reed/Adzuna boards into employer-prospects.json.
 * Grows the list beyond CQC England care into UK multi-sector hiring.
 *
 * Reads: data/competitor-employers.json (+ optional progress.employers)
 * Writes: data/employer-prospects.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { inferVerticalFromRole } from "./lib/job-board-scraper.mjs";
import { buildProspectIndex, matchProspect, normalizeName } from "./lib/prospect-match.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../data");
const prospectsPath = join(dataDir, "employer-prospects.json");
const employersPath = join(dataDir, "competitor-employers.json");
const progressPath = join(dataDir, "competitor-search-progress.json");

const AGENCY_RE =
  /\b(reed|hays|indeed|adecco|manpower|randstad|michael page|page personnel|robert half|brook street|office angels|totaljobs|cv-library|reed specialist|nursing agency)\b/i;

function cityFromLocations(locations) {
  const raw = (locations?.[0] ?? "").split(",")[0]?.trim();
  if (!raw) return "United Kingdom";
  return raw.replace(/\s+/g, " ").slice(0, 80);
}

function regionHint(location) {
  const loc = (location ?? "").toLowerCase();
  if (/scotland|glasgow|edinburgh|aberdeen|dundee|inverness/.test(loc)) return "Scotland";
  if (/wales|cardiff|swansea|newport|wrexham/.test(loc)) return "Wales";
  if (/northern ireland|belfast|derry|lisburn|newry/.test(loc)) return "Northern Ireland";
  return "England";
}

function primaryBoard(boards) {
  if (!boards || typeof boards !== "object") return "Reed";
  return Object.entries(boards).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Reed";
}

function loadBoardEmployers() {
  /** @type {Map<string, object>} */
  const byKey = new Map();

  if (existsSync(employersPath)) {
    const list = JSON.parse(readFileSync(employersPath, "utf8"));
    for (const e of list) {
      const key = (e.employer ?? "").toLowerCase();
      if (key) byKey.set(key, e);
    }
  }

  if (existsSync(progressPath)) {
    const progress = JSON.parse(readFileSync(progressPath, "utf8"));
    for (const e of Object.values(progress.employers ?? {})) {
      const key = (e.employer ?? "").toLowerCase();
      if (!key) continue;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, {
          employer: e.employer,
          primaryBoard: primaryBoard(e.boards),
          boards: e.boards,
          roles: e.roles ?? [],
          locations: e.locations ?? [],
        });
      }
    }
  }

  return [...byKey.values()];
}

function main() {
  if (!existsSync(prospectsPath)) {
    console.error("Missing data/employer-prospects.json — run pnpm prospects:build first");
    process.exit(1);
  }

  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  const index = buildProspectIndex(prospects);
  const boardEmployers = loadBoardEmployers();

  let added = 0;
  let skippedAgency = 0;
  let alreadyMatched = 0;
  const now = new Date().toISOString();

  for (const e of boardEmployers) {
    const name = (e.employer ?? "").trim();
    if (!name || name.length < 3) continue;
    if (AGENCY_RE.test(name)) {
      skippedAgency++;
      continue;
    }
    if (normalizeName(name).length < 3) continue;

    const loc = e.locations?.[0];
    if (matchProspect(name, index, loc) != null) {
      alreadyMatched++;
      continue;
    }

    const city = cityFromLocations(e.locations);
    const role = e.roles?.[0] ?? "Hiring";
    const vertical = inferVerticalFromRole(role);
    const board = e.primaryBoard ?? primaryBoard(e.boards);
    const key = `board:${name.toLowerCase()}|${city.toLowerCase()}`;

    if (prospects.some((p) => (p.boardDiscoveryId ?? p.cqcLocationId) === key)) {
      alreadyMatched++;
      continue;
    }

    const prospect = {
      companyName: name,
      providerName: name,
      email: undefined,
      website: undefined,
      phone: undefined,
      city,
      region: regionHint(loc ?? city),
      vertical,
      employeeCount: "10-50",
      tier: "independent",
      priority: 2,
      competitorBoard: board,
      hiringSignal: `${role} on ${board}`,
      outreachHook: `Actively hiring on ${board} (${vertical}) — UK SME / operator`,
      competitorVerified: true,
      competitorCheckedAt: now,
      boardDiscoveryId: key,
      source: "board_discovery",
      emailStatus: "needs_enrichment",
      status: "prospect",
      addedAt: now,
    };

    prospects.push(prospect);
    index.push({
      index: prospects.length - 1,
      key,
      names: [name],
      city: city.toLowerCase(),
    });
    added++;
  }

  if (added > 0) {
    writeFileSync(prospectsPath, JSON.stringify(prospects, null, 2));
  }

  const byVertical = {};
  for (const p of prospects.filter((x) => x.source === "board_discovery")) {
    byVertical[p.vertical ?? "sme"] = (byVertical[p.vertical ?? "sme"] ?? 0) + 1;
  }

  console.log(`\n✓ Board discovery ingest`);
  console.log(`  Board employers scanned: ${boardEmployers.length.toLocaleString()}`);
  console.log(`  New prospects added: ${added.toLocaleString()}`);
  console.log(`  Already in list / matched: ${alreadyMatched.toLocaleString()}`);
  console.log(`  Skipped agencies: ${skippedAgency.toLocaleString()}`);
  console.log(`  Total prospects now: ${prospects.length.toLocaleString()}`);
  if (Object.keys(byVertical).length) {
    console.log(
      `  Board-discovery by vertical: ${Object.entries(byVertical)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`,
    );
  }
}

main();
