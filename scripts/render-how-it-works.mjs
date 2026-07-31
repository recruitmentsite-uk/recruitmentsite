#!/usr/bin/env node
/**
 * Canva-style "How it works" brand graphic for /pricing.
 * Uses Unsplash workplace photo + Brand Kit teal/gold.
 * Recreate in Canva as rbee.mehmood@gmail.com if needed.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "apps", "web", "public", "brand");
mkdirSync(outDir, { recursive: true });

const font = `Fraunces, Georgia, 'Times New Roman', serif`;
const sans = `'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif`;

/** Meeting / hiring atmosphere — Unsplash */
const photoUrl =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80";

const steps = [
  { n: "01", title: "Post your role", body: "Self-serve dashboard. Salary required." },
  { n: "02", title: "We syndicate", body: "Google Jobs, SEO pages, alerts." },
  { n: "03", title: "AI screens", body: "Applicants scored 0–100 instantly." },
  { n: "04", title: "You hire", body: "No commission. Unlimited on Growth." },
];

const cards = steps
  .map(
    (s) => `
    <div style="flex:1;min-width:0;background:rgba(11,18,32,0.55);border:1px solid rgba(255,255,255,0.16);
      backdrop-filter:blur(8px);padding:28px 22px;">
      <div style="font-family:${font};font-size:36px;font-weight:600;color:#c4a35a;letter-spacing:-1px;">${s.n}</div>
      <div style="margin-top:14px;font-family:${font};font-size:24px;font-weight:550;color:#fff;letter-spacing:-0.3px;line-height:1.15;">${s.title}</div>
      <div style="margin-top:10px;font-size:15px;line-height:1.4;color:rgba(255,255,255,0.72);">${s.body}</div>
    </div>`,
  )
  .join("");

const html = `
<div style="width:1200px;height:630px;position:relative;overflow:hidden;color:#fff;font-family:${sans};">
  <img src="${photoUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.06);" />
  <div style="position:absolute;inset:0;background:
    linear-gradient(115deg, rgba(8,79,73,0.92) 0%, rgba(12,107,99,0.78) 45%, rgba(11,18,32,0.72) 100%),
    linear-gradient(to top, rgba(11,18,32,0.55), transparent 50%);"></div>
  <div style="position:absolute;inset:0;background:
    radial-gradient(ellipse 700px 420px at 90% 10%, rgba(196,163,90,.22), transparent 55%);"></div>
  <div style="position:relative;padding:44px 52px 36px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
    <div style="font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.6);">
      Recruitment Site
    </div>
    <div style="margin-top:12px;font-family:${font};font-size:46px;font-weight:550;letter-spacing:-1px;line-height:1.08;">
      How hiring works
    </div>
    <div style="margin-top:10px;font-size:18px;color:rgba(255,255,255,.78);max-width:640px;">
      Flat fee. Thousands of candidates. No agency cut.
    </div>
    <div style="margin-top:auto;display:flex;gap:14px;">
      ${cards}
    </div>
    <div style="margin-top:22px;font-size:15px;font-weight:700;color:#f0e2b8;">
      recruitmentsite.co.uk/pricing
    </div>
  </div>
</div>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  `<!doctype html><html><head>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet"/>
</head><body style="margin:0">${html}</body></html>`,
  { waitUntil: "networkidle" },
);
// Wait for Unsplash photo
await page.waitForTimeout(1200);
const out = join(outDir, "how-it-works.png");
await page.screenshot({ path: out, type: "png" });
await browser.close();

if (!existsSync(out)) {
  console.error("Failed to write", out);
  process.exit(1);
}
console.log("Wrote", out);
