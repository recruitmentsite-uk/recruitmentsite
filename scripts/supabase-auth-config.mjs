#!/usr/bin/env node
/**
 * Print Supabase auth URL config and verify via Auth settings API when possible.
 * Site URL + redirect URLs must match production for login/signup to work.
 */
const domain = "recruitmentsite.co.uk";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase auth URL configuration\n");
console.log("Dashboard: Authentication → URL configuration");
console.log(`  Site URL: https://${domain}`);
console.log(`  Redirect URLs:`);
console.log(`    https://${domain}/auth/callback`);
console.log(`    https://www.${domain}/auth/callback`);
console.log("");

if (!url || !key) {
  console.log("Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to verify settings.");
  process.exit(0);
}

// Supabase exposes auth config via GoTrue — service role can read settings
const res = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (!res.ok) {
  console.log(`Could not read auth settings (${res.status}). Confirm URLs manually in dashboard.`);
  process.exit(0);
}

const settings = await res.json();
const siteUrl = settings.site_url ?? settings.external?.site_url;
const redirectUrls = settings.uri_allow_list ?? settings.external?.redirect_urls ?? [];

console.log("Current Supabase auth settings:");
console.log(`  site_url: ${siteUrl ?? "(unknown)"}`);
console.log(`  redirect allow list: ${Array.isArray(redirectUrls) ? redirectUrls.join(", ") || "(empty)" : redirectUrls}`);

const expected = [`https://${domain}`, `https://www.${domain}`];
const siteOk = siteUrl === `https://${domain}` || siteUrl === `https://www.${domain}`;
const callbackOk = String(redirectUrls).includes(`/auth/callback`);

console.log("");
console.log(siteOk ? "✓ Site URL looks correct" : "✗ Site URL may need updating");
console.log(callbackOk ? "✓ Auth callback redirect present" : "✗ Add /auth/callback redirect URL");
