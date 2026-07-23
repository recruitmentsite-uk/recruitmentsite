#!/usr/bin/env node
/**
 * Generates DNS handoff for Blossom Technology + Cloudflare setup.
 * Run: node scripts/cloudflare-dns-handoff.mjs
 * Output: docs/BLOSSOM-CLOUDFLARE-HANDOFF.txt
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const domain = "recruitmentsite.co.uk";

/** Fill in after adding domain to Cloudflare dashboard */
const CLOUDFLARE_NS = [
  "[REPLACE — e.g. ada.ns.cloudflare.com]",
  "[REPLACE — e.g. bob.ns.cloudflare.com]",
];

const lines = [
  `Recruitment Site — Cloudflare & Nameserver Handoff for Blossom Technology`,
  `Generated: ${new Date().toISOString()}`,
  ``,
  `Domain: ${domain}`,
  `Company: Recruitment Drive Ltd (13481215)`,
  `cPanel: https://${domain}/cpanel (username: recruitadmin)`,
  ``,
  `═══════════════════════════════════════════════════════════════════`,
  `ACTION REQUIRED — Blossom Technology`,
  `═══════════════════════════════════════════════════════════════════`,
  ``,
  `Please change nameservers for ${domain} from:`,
  `  ns1.blossomsweb.net`,
  `  ns2.blossomsweb.net`,
  ``,
  `To Cloudflare nameservers:`,
  ...CLOUDFLARE_NS.map((ns) => `  ${ns}`),
  ``,
  `After the NS change propagates (usually 1–24 hours), DNS is managed`,
  `in Cloudflare — not cPanel Zone Editor.`,
  ``,
  `IMPORTANT: Do NOT remove MX records when migrating DNS. Email stays on`,
  `Blossom/cPanel hosting (mx1/mx2.cloudhosting.uk).`,
  ``,
  `═══════════════════════════════════════════════════════════════════`,
  `DNS RECORDS — add in Cloudflare after NS change`,
  `═══════════════════════════════════════════════════════════════════`,
  ``,
  `--- Website (Vercel) ---`,
  `Type    Name    Value                   Proxy   Notes`,
  `A       @       76.76.21.21             OFF     Apex → Vercel`,
  `CNAME   www     cname.vercel-dns.com    OFF     www subdomain`,
  `CNAME   *       cname.vercel-dns.com    OFF     Employer careers subdomains`,
  ``,
  `--- Email (keep on Blossom/cPanel — DO NOT CHANGE) ---`,
  `Type    Name    Value                   Priority`,
  `MX      @       mx1.cloudhosting.uk     10`,
  `MX      @       mx2.cloudhosting.uk     20`,
  `A       mail    185.199.220.91          —       Webmail`,
  ``,
  `--- Email authentication ---`,
  `Type    Name      Value`,
  `TXT     @         v=spf1 +a +mx +ip4:185.199.220.91 include:relay.k.io ~all`,
  `TXT     _dmarc    v=DMARC1; p=none;`,
  ``,
  `--- Resend (transactional email — verify via Cloudflare) ---`,
  `OPTION A — One-click (recommended after NS change):`,
  `  1. https://resend.com/domains → Add Domain → ${domain}`,
  `  2. Click "Sign in to Cloudflare" → Authorize (Domain Connect adds DNS automatically)`,
  `  3. Wait for Verified (~5–15 min)`,
  ``,
  `OPTION B — Script (needs RESEND_API_KEY + CLOUDFLARE_API_TOKEN):`,
  `  pnpm ops:resend`,
  ``,
  `Resend adds records on the "send" subdomain (MX + TXT + DKIM) — proxy OFF (grey cloud).`,
  `Keep existing MX records for hello@ / cPanel mail unchanged.`,
  ``,
  `--- Supabase auth (no DNS — configure in Supabase dashboard) ---`,
  `Site URL: https://${domain}`,
  `Redirect: https://${domain}/auth/callback`,
  ``,
  `═══════════════════════════════════════════════════════════════════`,
  `MAILBOXES (already created in cPanel)`,
  `═══════════════════════════════════════════════════════════════════`,
  `hello@${domain}          — general contact, service signups`,
  `notifications@${domain}  — transactional email (Resend FROM)`,
  `admin@${domain}          — site moderation`,
  `privacy@${domain}        — privacy policy contact`,
  `legal@${domain}          — terms contact`,
  `billing@${domain}        — Stripe / finance`,
  ``,
  `Passwords: go-live-credentials.local.txt (local only)`,
  ``,
  `═══════════════════════════════════════════════════════════════════`,
  `VERIFICATION CHECKLIST (after NS + DNS propagate)`,
  `═══════════════════════════════════════════════════════════════════`,
  `[ ] https://${domain} loads the job board (not 404)`,
  `[ ] https://www.${domain} loads`,
  `[ ] hello@${domain} receives mail (send test from external address)`,
  `[ ] cPanel webmail still works at /webmail`,
  `[ ] Supabase auth signup/login works`,
  ``,
];

const outDir = join(root, "docs");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "BLOSSOM-CLOUDFLARE-HANDOFF.txt");
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`✓ Wrote ${outPath}`);
console.log("\nNext: add domain to Cloudflare, paste the 2 nameservers into this file,");
console.log("then send docs/BLOSSOM-CLOUDFLARE-HANDOFF.txt to Blossom Technology.");
