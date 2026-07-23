#!/usr/bin/env node
/**
 * Generates mailbox passwords, service signup checklist, and DNS records
 * for recruitmentsite.co.uk go-live.
 *
 * Run: node scripts/go-live-accounts.mjs
 * Output: go-live-credentials.local.txt (gitignored — store in password manager)
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const domain = "recruitmentsite.co.uk";
const company = "Recruitment Drive Ltd";
const companyNo = "13481215";
const address = "21-25 Burnley Road, Dollis Hill, London NW10 1ED";

/** Mailboxes referenced in code + ops */
const MAILBOXES = [
  { local: "hello", purpose: "General contact, employer application alerts (EMPLOYER_NOTIFY_EMAIL)" },
  { local: "notifications", purpose: "Resend FROM address for transactional email (EMAIL_FROM)" },
  { local: "admin", purpose: "Site moderation queue (ADMIN_EMAILS)" },
  { local: "privacy", purpose: "Privacy policy contact" },
  { local: "legal", purpose: "Terms & legal contact" },
  { local: "billing", purpose: "Stripe / finance correspondence" },
];

function genPassword() {
  return randomBytes(16).toString("base64url");
}

const passwords = Object.fromEntries(MAILBOXES.map((m) => [m.local, genPassword()]));

const credentialsPath = join(root, "go-live-credentials.local.txt");
const credLines = [
  `# Recruitment Site — go-live credentials`,
  `# Generated ${new Date().toISOString()}`,
  `# Store in a password manager; do not commit.`,
  ``,
  `## cPanel (${domain}/cpanel)`,
  `Create each mailbox under Email Accounts → Create:`,
  ``,
  ...MAILBOXES.flatMap((m) => [
    `${m.local}@${domain}`,
    `  Password: ${passwords[m.local]}`,
    `  Purpose: ${m.purpose}`,
    ``,
  ]),
  `## Primary signup email (use for all service registrations)`,
  `hello@${domain}`,
  ``,
  `## Admin login email (set in ADMIN_EMAILS after Supabase auth signup)`,
  `admin@${domain}`,
  ``,
];

writeFileSync(credentialsPath, credLines.join("\n"), "utf8");

const envTemplate = join(root, "apps/web/.env.production.template");
const envLines = [
  `# Production env — copy to hosting provider (Vercel/cPanel Node)`,
  `# Fill API keys after completing service signups below.`,
  ``,
  `NEXT_PUBLIC_SITE_URL=https://${domain}`,
  ``,
  `# Supabase — https://supabase.com/dashboard → New project → Settings → API`,
  `NEXT_PUBLIC_SUPABASE_URL=`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=`,
  `SUPABASE_SERVICE_ROLE_KEY=`,
  ``,
  `# Stripe — https://dashboard.stripe.com → Developers → API keys`,
  `# Webhook: POST https://${domain}/api/webhooks/stripe`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=`,
  `STRIPE_SECRET_KEY=`,
  `STRIPE_WEBHOOK_SECRET=`,
  ``,
  `# Resend — https://resend.com/domains → verify ${domain}`,
  `RESEND_API_KEY=`,
  ``,
  `# OpenAI — https://platform.openai.com/api-keys`,
  `OPENAI_API_KEY=`,
  ``,
  `# Adzuna job feed (optional) — https://developer.adzuna.com`,
  `ADZUNA_APP_ID=`,
  `ADZUNA_APP_KEY=`,
  ``,
  `EMPLOYER_NOTIFY_EMAIL=hello@${domain}`,
  `ADMIN_EMAILS=admin@${domain}`,
  ``,
];
writeFileSync(envTemplate, envLines.join("\n"), "utf8");

console.log("Recruitment Site — go-live account setup\n");
console.log(`✓ Wrote ${credentialsPath}`);
console.log(`✓ Wrote ${envTemplate}\n`);

console.log("── STEP 1: cPanel email accounts ── ✓ DONE");
console.log("Mailboxes: hello, notifications, admin, privacy, legal, billing");
console.log("Passwords: go-live-credentials.local.txt\n");

console.log("── STEP 2: Cloudflare (DNS + CDN) ──");
console.log("1. Sign up: https://dash.cloudflare.com/sign-up (hello@" + domain + ")");
console.log("2. Add site → " + domain + " → Free plan");
console.log("3. Copy the 2 Cloudflare nameservers into docs/BLOSSOM-CLOUDFLARE-HANDOFF.txt");
console.log("4. Run: pnpm ops:cloudflare  (generates handoff for Blossom Technology)");
console.log("5. Send docs/BLOSSOM-CLOUDFLARE-HANDOFF.txt to Blossom to update nameservers");
console.log("6. After NS propagate, add DNS records from the handoff file in Cloudflare\n");

console.log("── STEP 3: Resend (transactional email API) ──");
console.log("Sign up: https://resend.com/signup  (use hello@" + domain + ")");
console.log(`Add domain: ${domain}`);
console.log("Add the DNS records Resend shows (SPF, DKIM TXT/CNAME) in Cloudflare or cPanel Zone Editor.");
console.log("Sending domain must match notifications@" + domain + " (see packages/shared/src/email.ts)\n");

console.log("── STEP 4: Supabase (database + auth) ──");
console.log("Sign up: https://supabase.com/dashboard");
console.log("New project → region: London (eu-west-2) recommended");
console.log(`Auth → URL configuration → Site URL: https://${domain}`);
console.log(`Redirect URLs: https://${domain}/auth/callback`);
console.log("Run schema: pnpm db:push (with SUPABASE_SERVICE_ROLE_KEY set)\n");

console.log("── STEP 5: Stripe (billing) ──");
console.log("Sign up: https://dashboard.stripe.com/register");
console.log(`Business: ${company} (${companyNo})`);
console.log(`Address: ${address}`);
console.log("Complete UK business verification (Companies House details).");
console.log(`Webhook endpoint: https://${domain}/api/webhooks/stripe`);
console.log("Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.paid");
console.log("Then: STRIPE_SECRET_KEY=sk_live_... pnpm stripe:setup\n");

console.log("── STEP 6: OpenAI (AI matching) ──");
console.log("Sign up: https://platform.openai.com/signup");
console.log("Billing → add payment method → API keys → create key\n");

console.log("── STEP 7: Adzuna (optional job feed) ──");
console.log("Sign up: https://developer.adzuna.com/signup");
console.log("Create app → copy App ID and App Key\n");

console.log("── STEP 8: Hosting (Next.js) ──");
console.log("Recommended: Vercel — https://vercel.com/signup");
console.log(`Import repo, set root apps/web, add env from .env.production.template`);
console.log(`Custom domain: ${domain} + *.${domain}`);
console.log("Alternative: cPanel Node.js Selector if staying on current host\n");

console.log("── STEP 9: Post-setup verification ──");
console.log("  pnpm ops:readiness   (with production env vars loaded)");
console.log("  Visit /admin logged in as admin@" + domain);
console.log("  Test checkout on /pricing");
console.log("  Send test email via Resend dashboard\n");

console.log("── Current DNS (for reference) ──");
console.log("  MX: mx1.cloudhosting.uk, mx2.cloudhosting.uk");
console.log("  NS: ns1.blossomsweb.net, ns2.blossomsweb.net");
console.log("  A:  185.199.220.91");
