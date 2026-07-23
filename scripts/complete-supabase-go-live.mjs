#!/usr/bin/env node
/**
 * Finish Supabase go-live: verify auth URLs, create admin user.
 * Reads keys from go-live-credentials.local.txt (no shell env needed).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credsPath = join(__dirname, "..", "go-live-credentials.local.txt");
const creds = readFileSync(credsPath, "utf8");

function pick(key) {
  const m = creds.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m?.[1]?.trim();
}

const url = pick("NEXT_PUBLIC_SUPABASE_URL");
const serviceKey = pick("SUPABASE_SERVICE_ROLE_KEY");
const adminEmail = "admin@recruitmentsite.co.uk";
const adminPassword = creds.match(/admin@recruitmentsite\.co\.uk[\s\S]*?Password: (\S+)/)?.[1];

if (!url || !serviceKey) {
  console.error("Missing Supabase keys in go-live-credentials.local.txt");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  "Content-Type": "application/json",
};

console.log("Supabase go-live completion\n");

const settingsRes = await fetch(`${url}/auth/v1/settings`, { headers });
if (settingsRes.ok) {
  const settings = await settingsRes.json();
  const siteUrl = settings.site_url ?? settings.external?.site_url;
  const redirects = settings.uri_allow_list ?? settings.external?.redirect_urls ?? [];
  console.log(`Site URL: ${siteUrl}`);
  console.log(`Redirect allow list: ${Array.isArray(redirects) ? redirects.join(", ") : redirects}`);
  const siteOk = siteUrl === "https://recruitmentsite.co.uk";
  const callbackOk = String(redirects).includes("/auth/callback");
  console.log(siteOk ? "✓ Site URL OK" : "✗ Update Site URL in Supabase dashboard");
  console.log(callbackOk ? "✓ Auth callback redirect OK" : "✗ Add /auth/callback redirect URL");
} else {
  console.log(`Could not read auth settings (${settingsRes.status})`);
}

if (!adminPassword) {
  console.error("\nAdmin mailbox password not found in credentials file");
  process.exit(1);
}

const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, { headers });
if (!listRes.ok) {
  console.error("Failed to list users:", await listRes.text());
  process.exit(1);
}

const { users } = await listRes.json();
const found = users?.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

if (found) {
  console.log(`\n✓ Admin user exists: ${adminEmail} (${found.id})`);
} else {
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email: adminEmail, password: adminPassword, email_confirm: true }),
  });
  const body = await createRes.json();
  if (!createRes.ok) {
    console.error("\nFailed to create admin:", body.msg ?? body.error ?? createRes.statusText);
    process.exit(1);
  }
  console.log(`\n✓ Created admin user: ${adminEmail} (${body.id})`);
}

console.log("\nEnsure ADMIN_EMAILS=admin@recruitmentsite.co.uk on Vercel production.");
