#!/usr/bin/env node
/**
 * Create admin@recruitmentsite.co.uk in Supabase Auth (email confirmed).
 * Run: node scripts/create-admin-user.mjs
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL ?? "admin@recruitmentsite.co.uk";
const password = process.env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!password) {
  console.error("Set ADMIN_PASSWORD (e.g. from go-live-credentials.local.txt)");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${key}`,
  apikey: key,
  "Content-Type": "application/json",
};

const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, { headers });
if (!listRes.ok) {
  console.error("Failed to list users:", await listRes.text());
  process.exit(1);
}

const { users } = await listRes.json();
const found = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (found) {
  console.log(`✓ Admin user already exists: ${email} (${found.id})`);
  process.exit(0);
}

const createRes = await fetch(`${url}/auth/v1/admin/users`, {
  method: "POST",
  headers,
  body: JSON.stringify({ email, password, email_confirm: true }),
});

const body = await createRes.json();
if (!createRes.ok) {
  console.error("Failed:", body.msg ?? body.error ?? createRes.statusText);
  process.exit(1);
}

console.log(`✓ Created admin user: ${email} (${body.id})`);
console.log("Ensure ADMIN_EMAILS=admin@recruitmentsite.co.uk on Vercel production.");
