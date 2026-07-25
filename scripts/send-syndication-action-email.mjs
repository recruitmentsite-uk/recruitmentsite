#!/usr/bin/env node
/** HTML action email for GOV.UK + Indeed syndication (Stripe intentionally excluded). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EMAIL_FROM_HELLO, buildBrandedEmailHtml, appendEmailLegalFooter } from "@placeuk/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credsPath = join(__dirname, "..", "go-live-credentials.local.txt");
const SITE = "https://recruitmentsite.co.uk";

function loadKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  if (!existsSync(credsPath)) return "";
  return readFileSync(credsPath, "utf8").match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim() ?? "";
}

const key = loadKey();
const html = buildBrandedEmailHtml({
  title: "Action: GOV.UK Find a job + Indeed partners",
  preheader: "Manual portal steps for job board syndication",
  hero: "hiring",
  siteUrl: SITE,
  ctaLabel: "Open Indeed partners",
  ctaUrl: "https://www.indeed.com/partners",
  bodyHtml: `
    <p style="margin:0 0 14px">Stripe is paused (as requested). Complete these syndication steps:</p>
    <h3 style="margin:0 0 8px;color:#0f766e">1. GOV.UK Find a job</h3>
    <ol style="margin:0 0 16px;padding-left:20px">
      <li>Open <a href="https://www.gov.uk/advertise-job" style="color:#0f766e">gov.uk/advertise-job</a></li>
      <li>Sign in with the Recruitment Drive UK Ltd employer account (hello@)</li>
      <li>Post / bulk-upload roles, or call Employer Services 0800 169 0178 for system feeds</li>
    </ol>
    <h3 style="margin:0 0 8px;color:#0f766e">2. Indeed partner XML</h3>
    <ol style="margin:0 0 16px;padding-left:20px">
      <li>Open <a href="https://www.indeed.com/partners" style="color:#0f766e">indeed.com/partners</a> or employers.indeed.com</li>
      <li>Submit source feed: <code>${SITE}/feeds/indeed.xml</code> (live)</li>
    </ol>
    <h3 style="margin:0 0 8px;color:#0f766e">3. LinkedIn</h3>
    <p style="margin:0 0 14px">BD email already sent. Feed live: <a href="${SITE}/feeds/linkedin.xml" style="color:#0f766e">${SITE}/feeds/linkedin.xml</a></p>
    <p style="margin:0;color:#64748b;font-size:14px">Cloud departments now run daily on GitHub Actions without your PC.</p>
  `,
});

if (!key) {
  console.error("RESEND_API_KEY missing");
  process.exit(1);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: EMAIL_FROM_HELLO,
    to: ["hello@recruitmentsite.co.uk"],
    subject: "[Action] GOV.UK Find a job + Indeed partner registration",
    html,
    text: appendEmailLegalFooter(
      "Complete GOV.UK advertise-job and Indeed partners XML registration. Feeds live. Stripe paused.",
    ),
  }),
});
const data = await res.json().catch(() => ({}));
console.log(res.ok ? `✓ ${data.id}` : `✗ ${data.message || res.status}`);
process.exit(res.ok ? 0 : 1);
