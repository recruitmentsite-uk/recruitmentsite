#!/usr/bin/env node
/**
 * Push all supabase/migrations/*.sql to your Supabase project.
 * Prefers Supabase CLI (db push --db-url); falls back to manual paste instructions.
 */
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase/migrations");

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const projectRef =
  process.env.SUPABASE_PROJECT_REF ??
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (dbPassword && projectRef) {
  const encoded = encodeURIComponent(dbPassword);
  const dbUrl = `postgresql://postgres:${encoded}@db.${projectRef}.supabase.co:5432/postgres`;
  console.log(`Pushing ${files.length} migrations via Supabase CLI...`);
  const result = spawnSync(
    "npx",
    ["supabase", "db", "push", "--db-url", dbUrl, "--yes"],
    { cwd: root, stdio: "inherit", shell: true },
  );
  process.exit(result.status ?? 1);
}

console.log("⚠  Set SUPABASE_DB_PASSWORD (+ optional SUPABASE_PROJECT_REF) to push via CLI.");
console.log(`   Or paste these files into Supabase SQL editor (${files.length} migrations):`);
files.forEach((f) => console.log(`     - supabase/migrations/${f}`));
process.exit(0);
