#!/usr/bin/env node
/**
 * Apply a SQL file to Supabase.
 * Tries in order:
 * 1) DATABASE_URL / POSTGRES_URL
 * 2) SUPABASE_DB_PASSWORD + project ref from SUPABASE_URL
 * 3) Supabase Management API (SUPABASE_ACCESS_TOKEN)
 * 4) Legacy pg-meta HTTP endpoints
 *
 * Usage: node scripts/apply-sql-file.mjs supabase/migrations/011_super_admin.sql
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

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

const sql = readFileSync(path, "utf8");
const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
  /\/$/,
  "",
);
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function viaPg(connectionString, label) {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`✓ Applied ${file} via ${label}`);
    return true;
  } finally {
    await client.end();
  }
}

async function viaManagementApi() {
  if (!accessToken || !projectRef) return false;
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.warn(`Management API → HTTP ${res.status}: ${text.slice(0, 300)}`);
    return false;
  }
  console.log(`✓ Applied ${file} via Management API`);
  return true;
}

async function viaPgMeta() {
  if (!url || !serviceKey) return false;
  const endpoints = [`${url}/pg/query`, `${url}/pg-meta/default/query`];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      if (res.ok) {
        console.log(`✓ Applied ${file} via ${endpoint}`);
        return true;
      }
      console.warn(`${endpoint} → HTTP ${res.status}: ${text.slice(0, 200)}`);
    } catch (err) {
      console.warn(`${endpoint} → ${err.message}`);
    }
  }
  return false;
}

async function main() {
  if (databaseUrl) {
    try {
      if (await viaPg(databaseUrl, "DATABASE_URL")) return;
    } catch (err) {
      console.warn(`DATABASE_URL failed: ${err.message}`);
    }
  }

  if (dbPassword && projectRef) {
    const enc = encodeURIComponent(dbPassword);
    const candidates = [
      `postgresql://postgres.${projectRef}:${enc}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${projectRef}:${enc}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`,
    ];
    for (const cs of candidates) {
      try {
        if (await viaPg(cs, cs.includes("pooler") ? "pooler" : "direct db")) return;
      } catch (err) {
        console.warn(`pg candidate failed: ${err.message}`);
      }
    }
  }

  if (await viaManagementApi()) return;
  if (await viaPgMeta()) return;

  console.error("Could not apply SQL automatically.");
  console.error("Add SUPABASE_DB_PASSWORD (or SUPABASE_ACCESS_TOKEN) secret, or paste the file in the Supabase SQL editor.");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
