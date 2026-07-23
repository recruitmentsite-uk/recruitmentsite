#!/usr/bin/env node
/**
 * Configure Supabase Auth: URL config + custom SMTP (Resend).
 * Uses Supabase Management API when SUPABASE_ACCESS_TOKEN is set,
 * otherwise prints dashboard steps.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const domain = "recruitmentsite.co.uk";
const projectRef = "wvwhxnokuisxcgwbwqlo";
const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const resendKey = process.env.RESEND_API_KEY ?? pick("RESEND_API_KEY");
const accessToken = process.env.SUPABASE_ACCESS_TOKEN ?? pick("SUPABASE_ACCESS_TOKEN");

const siteUrl = `https://${domain}`;
const redirects = [
  `${siteUrl}/auth/callback`,
  `https://www.${domain}/auth/callback`,
];

console.log("Supabase auth + SMTP completion\n");

if (!accessToken) {
  console.log("Dashboard: https://supabase.com/dashboard/project/" + projectRef + "/auth/url-configuration");
  console.log("  Site URL:", siteUrl);
  console.log("  Redirect URLs:");
  for (const u of redirects) console.log("   ", u);
  console.log("\nDashboard: Authentication → Emails → SMTP Settings");
  console.log("  Enable custom SMTP");
  console.log("  Host: smtp.resend.com");
  console.log("  Port: 465 (SSL) or 587 (TLS)");
  console.log("  Username: resend");
  console.log("  Password: [RESEND_API_KEY]");
  console.log("  Sender: notifications@" + domain);
  console.log("  Sender name: Recruitment Site");
  if (!resendKey) console.log("\n⚠ RESEND_API_KEY not in credentials yet");
  process.exit(0);
}

const authConfig = {
  site_url: siteUrl,
  uri_allow_list: redirects.join(","),
  smtp_admin_email: `notifications@${domain}`,
  smtp_sender_name: "Recruitment Site",
  external_email_enabled: true,
  mailer_autoconfirm: false,
  smtp_host: "smtp.resend.com",
  smtp_port: 465,
  smtp_user: "resend",
  smtp_pass: resendKey,
  smtp_max_frequency: 60,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(authConfig),
});

if (!res.ok) {
  console.error("Management API failed:", res.status, await res.text());
  console.log("\nConfigure manually in dashboard (see script output when no token).");
  process.exit(1);
}

console.log("✓ Supabase auth URLs + Resend SMTP configured via Management API");
