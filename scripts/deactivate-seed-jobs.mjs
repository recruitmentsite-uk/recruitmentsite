#!/usr/bin/env node
/**
 * Expire synthetic demo/bulk-seed jobs so they never look like real ads.
 * Reads go-live-credentials.local.txt — never prints secret values.
 *
 * Usage: node scripts/deactivate-seed-jobs.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credsPath = join(root, "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => process.env[k] ?? creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const url = pick("NEXT_PUBLIC_SUPABASE_URL") ?? pick("SUPABASE_URL");
const serviceKey = pick("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SOURCES = ["demo-seed", "bulk-seed"];
const now = new Date().toISOString();
let total = 0;

for (const source of SOURCES) {
  // Count first
  const { count, error: countErr } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("compliance->>source", source);

  if (countErr) {
    console.error(`Count failed for ${source}:`, countErr.message);
    process.exit(1);
  }

  if (!count) {
    console.log(`✓ No active ${source} jobs`);
    continue;
  }

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "expired",
      featured: false,
      updated_at: now,
    })
    .eq("status", "active")
    .eq("compliance->>source", source)
    .select("id");

  if (error) {
    console.error(`Update failed for ${source}:`, error.message);
    process.exit(1);
  }

  const n = data?.length ?? 0;
  total += n;
  console.log(`✓ Expired ${n} ${source} job(s) (matched ${count})`);
}

// Also unfeature any leftover featured seed rows already expired
for (const source of SOURCES) {
  await supabase
    .from("jobs")
    .update({ featured: false, updated_at: now })
    .eq("featured", true)
    .eq("compliance->>source", source);
}

const { count: activePublic } = await supabase
  .from("jobs")
  .select("*", { count: "exact", head: true })
  .eq("status", "active")
  .not("compliance->>source", "in", "(demo-seed,bulk-seed)");

console.log(`\nDone. Expired ${total} seed job(s).`);
console.log(`Active public jobs remaining: ${activePublic ?? "unknown"}`);
