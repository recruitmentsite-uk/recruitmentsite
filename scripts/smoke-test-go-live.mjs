#!/usr/bin/env node
/**
 * Go-live smoke test: Resend, Supabase auth, site endpoints, password reset.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = readFileSync(credsPath, "utf8");
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const domain = "recruitmentsite.co.uk";
const siteUrl = `https://${domain}`;
const supabaseUrl = pick("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = pick("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceKey = pick("SUPABASE_SERVICE_ROLE_KEY");
const resendKey = pick("RESEND_API_KEY");
const adminEmail = "admin@recruitmentsite.co.uk";

const results = [];

function ok(label, pass, detail = "") {
  results.push({ label, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("Go-live smoke test\n");

// Resend
try {
  const domains = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${resendKey}` },
  }).then((r) => r.json());
  const d = domains.data?.find((x) => x.name === domain);
  ok("Resend domain verified", d?.status === "verified", d?.status ?? "not found");
} catch (e) {
  ok("Resend domain verified", false, e.message);
}

try {
  const send = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `Recruitment Site <notifications@${domain}>`,
      to: [adminEmail],
      subject: `[Smoke test] Recruitment Site email ${new Date().toISOString()}`,
      html: "<p>Go-live smoke test — Resend transactional send OK.</p>",
    }),
  });
  const body = await send.json();
  ok("Resend send test email", send.ok, send.ok ? body.id : body.message);
} catch (e) {
  ok("Resend send test email", false, e.message);
}

// Supabase admin user
const adminHeaders = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey };
const usersRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`, {
  headers: adminHeaders,
});
if (usersRes.ok) {
  const { users } = await usersRes.json();
  const admin = users?.find((u) => u.email?.toLowerCase() === adminEmail);
  ok("Supabase admin user exists", !!admin, admin?.id ?? "");
} else {
  ok("Supabase admin user exists", false, String(usersRes.status));
}

// Password reset (recover)
const recoverRes = await fetch(`${supabaseUrl}/auth/v1/recover`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: adminEmail,
    redirect_to: `${siteUrl}/auth/callback?next=/dashboard/settings`,
  }),
});
ok(
  "Supabase password reset email triggered",
  recoverRes.ok || recoverRes.status === 200,
  recoverRes.ok ? "check admin inbox" : `${recoverRes.status} ${await recoverRes.text()}`,
);

// Site endpoints
for (const path of ["/", "/login", "/forgot-password", "/signup", "/jobs", "/auth/callback"]) {
  try {
    const res = await fetch(`${siteUrl}${path}`, { redirect: "follow" });
    ok(`Site ${path}`, res.status >= 200 && res.status < 500, `HTTP ${res.status}`);
  } catch (e) {
    ok(`Site ${path}`, false, e.message);
  }
}

// DNS
for (const [type, name] of [
  ["TXT", `resend._domainkey.${domain}`],
  ["MX", `send.${domain}`],
]) {
  try {
    const { execSync } = await import("node:child_process");
    const out = execSync(`nslookup -type=${type} ${name} 1.1.1.1`, { encoding: "utf8" });
    ok(`DNS ${type} ${name}`, !out.includes("Non-existent") && !out.includes("can't find"), "");
  } catch {
    ok(`DNS ${type} ${name}`, false, "missing");
  }
}

console.log("\n── Summary ──");
const failed = results.filter((r) => !r.pass);
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("\nFailed:");
  for (const f of failed) console.log(`  - ${f.label}: ${f.detail}`);
  process.exit(1);
}
