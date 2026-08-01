#!/usr/bin/env node
/**
 * Apply a SQL file to Supabase via the pg-meta query endpoint (service role).
 * Usage: node scripts/apply-sql-file.mjs supabase/migrations/011_super_admin.sql
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql-file.mjs <path.sql>");
  process.exit(1);
}

const path = resolve(file);
if (!existsSync(path)) {
  console.error(`File not found: ${path}`);
  process.exit(1);
}

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
  /\/$/,
  "",
);
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sql = readFileSync(path, "utf8");
const endpoints = [
  `${url}/pg/query`,
  `${url}/pg-meta/default/query`,
];

let lastErr = "";
for (const endpoint of endpoints) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    const text = await res.text();
    if (res.ok) {
      console.log(`✓ Applied ${file} via ${endpoint}`);
      console.log(text.slice(0, 500));
      process.exit(0);
    }
    lastErr = `${endpoint} → HTTP ${res.status}: ${text.slice(0, 400)}`;
    console.warn(lastErr);
  } catch (err) {
    lastErr = `${endpoint} → ${err.message}`;
    console.warn(lastErr);
  }
}

console.error("Could not apply SQL via pg-meta. Paste the file in Supabase SQL editor instead.");
console.error(lastErr);
process.exit(1);
