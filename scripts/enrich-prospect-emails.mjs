#!/usr/bin/env node
/**
 * Guess recruitment emails from prospect websites (recruitment@, careers@, hr@, jobs@, info@).
 * Marks emailStatus as "guessed" — verify before high-volume send.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prospectsPath = join(__dirname, "../data/employer-prospects.json");

const PREFIXES = ["recruitment", "careers", "jobs", "hr", "info"];

function domainFromWebsite(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function main() {
  const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));
  let enriched = 0;
  let skipped = 0;

  for (const p of prospects) {
    if (p.email && p.emailStatus === "verified_public") {
      skipped++;
      continue;
    }
    if (p.email && p.emailStatus === "guessed") {
      skipped++;
      continue;
    }

    const domain = p.domain ?? domainFromWebsite(p.website);
    if (!domain) continue;

    p.domain = domain;
    p.emailCandidates = PREFIXES.map((pre) => `${pre}@${domain}`);
    p.email = p.emailCandidates[0];
    p.emailStatus = "guessed";
    enriched++;
  }

  writeFileSync(prospectsPath, JSON.stringify(prospects, null, 2));

  const sendable = prospects.filter(
    (p) => p.email && (p.emailStatus === "verified_public" || p.emailStatus === "guessed"),
  );

  console.log(`✓ Enriched ${enriched.toLocaleString()} prospects with guessed emails`);
  console.log(`  Skipped (already had email): ${skipped.toLocaleString()}`);
  console.log(`  Total sendable (verified + guessed): ${sendable.length.toLocaleString()}`);
  console.log(`  Run: pnpm campaign:employers`);
}

main();
