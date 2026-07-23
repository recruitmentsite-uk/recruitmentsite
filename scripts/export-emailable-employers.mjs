#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prospectsPath = join(__dirname, "../data/employer-prospects.json");
const prospects = JSON.parse(readFileSync(prospectsPath, "utf8"));

const HEADERS = [
  "companyName",
  "email",
  "emailStatus",
  "city",
  "region",
  "vertical",
  "priority",
  "tier",
  "competitorBoard",
  "competitorVerified",
  "website",
  "phone",
];

function esc(v) {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows) {
  return [
    HEADERS.join(","),
    ...rows.map((r) => HEADERS.map((h) => esc(r[h])).join(",")),
  ].join("\n");
}

function sortSendable(a, b) {
  const rank = (p) =>
    p.emailStatus === "verified_public" || p.emailStatus === "scraped" ? 0 : 1;
  const dr = rank(a) - rank(b);
  if (dr !== 0) return dr;
  return (a.priority ?? 9) - (b.priority ?? 9);
}

const verified = prospects
  .filter(
    (p) =>
      p.email &&
      (p.emailStatus === "verified_public" || p.emailStatus === "scraped"),
  )
  .sort(sortSendable);

const sendable = prospects
  .filter(
    (p) =>
      p.email &&
      (p.emailStatus === "verified_public" ||
        p.emailStatus === "scraped" ||
        p.emailStatus === "guessed"),
  )
  .sort(sortSendable);

const verifiedPath = join(__dirname, "../data/employers-emailable-verified.csv");
const allPath = join(__dirname, "../data/employers-emailable-all.csv");

writeFileSync(verifiedPath, toCsv(verified));
writeFileSync(allPath, toCsv(sendable));

const byRegion = {};
const byCity = {};
for (const p of sendable) {
  byRegion[p.region ?? "Unknown"] = (byRegion[p.region ?? "Unknown"] ?? 0) + 1;
  byCity[p.city ?? "Unknown"] = (byCity[p.city ?? "Unknown"] ?? 0) + 1;
}

console.log(`Verified CSV: ${verified.length} rows -> data/employers-emailable-verified.csv`);
console.log(`All sendable CSV: ${sendable.length} rows -> data/employers-emailable-all.csv`);
console.log("\nTop 15 regions (verified + guessed):");
for (const [r, c] of Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${c}  ${r}`);
}
console.log("\nTop 15 cities:");
for (const [city, c] of Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${c}  ${city}`);
}
console.log("\nBy priority:");
for (const pri of [1, 2, 3]) {
  console.log(`  P${pri}: ${sendable.filter((p) => p.priority === pri).length}`);
}
