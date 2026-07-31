/**
 * Create private storage bucket `video-screenings` via service role.
 * Reads go-live-credentials.local.txt — never prints secret values.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credsPath = join(root, "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => process.env[k] ?? creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();

const url = pick("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = pick("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
if (listErr) {
  console.error("listBuckets failed:", listErr.message);
  process.exit(1);
}

if ((buckets ?? []).some((b) => b.name === "video-screenings")) {
  console.log("✓ Storage bucket video-screenings already exists");
  process.exit(0);
}

const { error } = await supabase.storage.createBucket("video-screenings", { public: false });
if (error) {
  console.error("createBucket failed:", error.message);
  process.exit(1);
}
console.log("✓ Created private storage bucket video-screenings");

// Verify migration tables while we're here
const { error: probe } = await supabase.from("video_screenings").select("id").limit(1);
if (probe && /does not exist/i.test(probe.message)) {
  console.error("✗ video_screenings table missing — migration not applied?");
  process.exit(1);
}
console.log("✓ video_screenings table reachable");
