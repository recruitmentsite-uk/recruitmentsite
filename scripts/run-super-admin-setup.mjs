#!/usr/bin/env node
/**
 * One-shot: apply 011 schema (via pg if DB password set) + import stock + smoke counts.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const fileEnv = {
  ...loadEnvFile(join(root, ".env.local")),
  ...loadEnvFile(join(root, "apps/web/.env.local")),
  ...loadEnvFile(join(root, ".env.vercel.production")),
  ...loadEnvFile(join(root, "apps/web/.env.vercel.production")),
};

for (const [k, v] of Object.entries(fileEnv)) {
  if (!process.env[k]) process.env[k] = v;
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
console.log(`Project: ${projectRef || "unknown"}`);

async function applySqlWithPg() {
  const sqlPath = join(root, "supabase/migrations/011_super_admin.sql");
  const sql = readFileSync(sqlPath, "utf8");
  let connectionString = databaseUrl;
  if (!connectionString && dbPassword && projectRef) {
    const enc = encodeURIComponent(dbPassword);
    connectionString = `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`;
  }
  if (!connectionString) {
    console.log("No DATABASE_URL / SUPABASE_DB_PASSWORD — skip direct SQL apply");
    return false;
  }
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ Applied 011_super_admin.sql via Postgres");
    return true;
  } finally {
    await client.end();
  }
}

async function tableStatus() {
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const out = {};
  for (const t of [
    "support_tickets",
    "social_posts",
    "social_accounts",
    "social_post_publishes",
  ]) {
    const { count, error } = await sb
      .from(t)
      .select("*", { count: "exact", head: true });
    out[t] = error ? { ok: false, error: error.message } : { ok: true, count };
  }
  return out;
}

async function main() {
  let applied = false;
  try {
    applied = await applySqlWithPg();
  } catch (err) {
    console.error("SQL apply failed:", err.message);
  }

  let status = await tableStatus();
  console.log("Table status:", JSON.stringify(status, null, 2));

  const missing = Object.entries(status).filter(([, v]) => !v.ok);
  if (missing.length) {
    console.error(
      "\nTables missing. Paste supabase/migrations/011_super_admin.sql in Supabase SQL editor, then re-run:\n  node scripts/run-super-admin-setup.mjs",
    );
    process.exit(1);
  }

  console.log("\nImporting social stock…");
  const imp = spawnSync("node", ["scripts/import-social-stock.mjs"], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    shell: true,
  });
  console.log(imp.stdout || "");
  if (imp.stderr) console.error(imp.stderr);
  if (imp.status !== 0) process.exit(imp.status ?? 1);

  status = await tableStatus();
  console.log("\n✓ Super admin ready");
  console.log(JSON.stringify(status, null, 2));
  console.log("\nOpen: https://recruitmentsite.co.uk/admin");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
