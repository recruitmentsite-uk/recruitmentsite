#!/usr/bin/env node
/**
 * Canva-style "How it works" brand graphic for /pricing.
 * Brand Kit: teal #0c6b63 / #084f49, gold #c4a35a — recreate in Canva as rbee.mehmood@gmail.com if needed.
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "apps", "web", "public", "brand");
mkdirSync(outDir, { recursive: true });

const font = `Fraunces, Georgia, 'Times New Roman', serif`;
const sans = `'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif`;

const steps = [
  { n: "01", title: "Post your role", body: "Self-serve dashboard. Salary required." },
  { n: "02", title: "We syndicate", body: "Google Jobs, SEO pages, alerts." },
  { n: "03", title: "AI screens", body: "Applicants scored 0–100 instantly." },
  { n: "04", title: "You hire", body: "No commission. Unlimited on Growth." },
];

const cards = steps
  .map(
    (s, i) => `
    <div style="flex:1;min-width:0;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);
      padding:36px 28px;position:relative;">
      <div style="font-family:${font};font-size:42px;font-weight:600;color:#c4a35a;letter-spacing:-1px;">${s.n}</div>
      <div style="margin-top:18px;font-family:${font};font-size:28px;font-weight:550;color:#fff;letter-spacing:-0.3px;">${s.title}</div>
      <div style="margin-top:12px;font-size:17px;line-height:1.45;color:rgba(255,255,255,0.72);">${s.body}</div>
      ${i < steps.length - 1 ? `<div style="position:absolute;right:-14px;top:50%;width:28px;height:2px;background:#c4a35a;opacity:.55;z-index:2;"></div>` : ""}
    </div>`,
  )
  .join("");

const html = `
<div style="width:1200px;height:630px;position:relative;overflow:hidden;color:#fff;
  background:linear-gradient(125deg,#084f49 0%,#0c6b63 48%,#0a5c56 100%);
  font-family:${sans};">
  <div style="position:absolute;inset:0;background:
    radial-gradient(ellipse 700px 420px at 92% 8%, rgba(196,163,90,.22), transparent 55%),
    radial-gradient(ellipse 560px 360px at 6% 95%, rgba(26,168,150,.2), transparent 50%);"></div>
  <div style="position:relative;padding:48px 56px 40px;">
    <div style="font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.55);">
      Recruitment Site
    </div>
    <div style="margin-top:14px;font-family:${font};font-size:48px;font-weight:550;letter-spacing:-1px;line-height:1.1;">
      How hiring works
    </div>
    <div style="margin-top:10px;font-size:18px;color:rgba(255,255,255,.7);max-width:640px;">
      Flat fee. Salary upfront. No agency cut.
    </div>
    <div style="margin-top:40px;display:flex;gap:18px;">
      ${cards}
    </div>
    <div style="margin-top:36px;font-size:15px;font-weight:700;color:#f0e2b8;">
      recruitmentsite.co.uk/pricing
    </div>
  </div>
</div>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html><head>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet"/>
</head><body style="margin:0">${html}</body></html>`, { waitUntil: "networkidle" });
const out = join(outDir, "how-it-works.png");
await page.screenshot({ path: out, type: "png" });
await browser.close();
console.log("Wrote", out);
