#!/usr/bin/env node
/**
 * Print remaining go-live steps with current status checks.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const domain = "recruitmentsite.co.uk";
const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const resendKey = pick("RESEND_API_KEY");
const cfToken = pick("CLOUDFLARE_API_TOKEN");

function dnsLookup(type, host) {
  try {
    const out = execSync(`nslookup -type=${type} ${host} 1.1.1.1 2>&1`, { encoding: "utf8", timeout: 15000 });
    if (/can't find|Non-existent domain|NXDOMAIN/i.test(out)) return null;
    if (type === "TXT" && !/text\s*=|descriptive text/i.test(out)) return null;
    if (type === "MX" && !/mail exchanger/i.test(out)) return null;
    if (type === "NS" && !/nameserver\s*=/i.test(out)) return null;
    return out.trim();
  } catch {
    return null;
  }
}

console.log("Recruitment Site — go-live status\n");

const ns = dnsLookup("NS", domain);
console.log(ns?.includes("cloudflare") ? "✓ Nameservers on Cloudflare" : "✗ Nameservers not on Cloudflare yet");

const dkim = dnsLookup("TXT", `resend._domainkey.${domain}`);
const sendMx = dnsLookup("MX", `send.${domain}`);
console.log(dkim ? "✓ resend._domainkey TXT present" : "✗ resend._domainkey TXT missing — add in Cloudflare");
console.log(sendMx ? "✓ send MX present" : "✗ send MX missing — add in Cloudflare");

console.log(resendKey ? "✓ RESEND_API_KEY in credentials" : "✗ RESEND_API_KEY missing");
console.log(cfToken ? "✓ CLOUDFLARE_API_TOKEN in credentials" : "✗ CLOUDFLARE_API_TOKEN missing (optional if DNS added manually)");

if (resendKey) {
  try {
    const listed = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
    }).then((r) => r.json());
    const d = listed.data?.find((x) => x.name === domain);
    console.log(d ? `Resend domain: ${d.status}` : "✗ Resend domain not found");
  } catch (e) {
    console.log("Could not reach Resend API:", e.message);
  }
}

console.log("\n── If DNS missing ──");
console.log("1. Cloudflare → recruitmentsite.co.uk → DNS → Add record");
console.log("2. Use values in docs/RESEND-DNS-PASTE-READY.txt (grey cloud / DNS only)");
console.log("3. node scripts/verify-resend-domain.mjs");
console.log("\n── Supabase (Glass browser tab open) ──");
console.log("URL config: https://supabase.com/dashboard/project/wvwhxnokuisxcgwbwqlo/auth/url-configuration");
console.log("SMTP: Authentication → Emails → Enable custom SMTP (smtp.resend.com, user: resend)");
console.log("Run: node scripts/complete-supabase-smtp.mjs");
