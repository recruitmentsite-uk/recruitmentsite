#!/usr/bin/env node
/** Verify ADMIN_EMAILS on Vercel production matches expected admin. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const expected = "admin@recruitmentsite.co.uk";
const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.vercel.production");

let actual = "";
try {
  const line = readFileSync(envPath, "utf8").match(/^ADMIN_EMAILS=(.+)$/m)?.[1] ?? "";
  actual = line.replace(/^"|"$/g, "").trim();
} catch {
  console.error("Run: vercel env pull .env.vercel.production --environment=production --yes");
  process.exit(1);
}

if (actual === expected) {
  console.log(`✓ ADMIN_EMAILS matches ${expected}`);
  process.exit(0);
}

if (actual === "[SENSITIVE]" || actual === "[ENCRYPTED]") {
  console.log(`✓ ADMIN_EMAILS is set on Vercel production (value masked — confirm in dashboard if needed)`);
  console.log(`  Expected: ${expected} (set during go-live via scripts/vercel-deploy.mjs)`);
  process.exit(0);
}

console.log(`✗ ADMIN_EMAILS is "${actual || "(empty)"}", expected "${expected}"`);
console.log(`Fix: vercel env rm ADMIN_EMAILS production -y && echo ${expected} | vercel env add ADMIN_EMAILS production`);
process.exit(1);
