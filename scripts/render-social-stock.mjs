#!/usr/bin/env node
/**
 * Unique Unsplash social stock matching the published 2026-07-30 pack quality:
 * - Real brand avatar mark
 * - IG: full-bleed photo + teal wash + serif headline
 * - LinkedIn: split teal panel + photo + gold URL bar
 *
 * Canva session not required. Optional: re-edit in Canva and overwrite exports.
 * Usage: node scripts/render-social-stock.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const unsplashDir = join(root, "apps", "web", "public", "brand", "social", "unsplash");
const postsDir = join(root, "apps", "web", "public", "brand", "social", "posts", "stock");
const docsDir = join(root, "docs", "social-posts", "stock");
const logoPath = join(root, "apps", "web", "public", "brand", "social", "avatar-800.png");
mkdirSync(unsplashDir, { recursive: true });
mkdirSync(postsDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });

const font = `Fraunces, Georgia, 'Times New Roman', serif`;
const sans = `'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif`;

const PHOTOS = [
  { id: "care-phone", file: "care-phone.jpg", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1576091160550-2173dba999ef" },
  { id: "kitchen-team", file: "kitchen-team.jpg", url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1556910103-1c02745aae4d" },
  { id: "workshop", file: "workshop.jpg", url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1504328345606-18bbc8c9d7d1" },
  { id: "office-team", file: "office-team.jpg", url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1521737711867-e3b97375f902" },
  { id: "interview", file: "interview.jpg", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1560250097-0b93528c311a" },
  { id: "london", file: "city-commute.jpg", url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1513635269975-59663e0ac1ad" },
  { id: "laptop", file: "laptop-apply.jpg", url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1499750310107-5fef28a66643" },
  { id: "handshake", file: "handshake.jpg", url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1521791136064-7986c2920216" },
  { id: "nurses", file: "nurses.jpg", url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1559839734-2b71ea197ec2" },
  { id: "warehouse", file: "warehouse.jpg", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1586528116311-ad8dd3c8310d" },
  { id: "retail", file: "retail.jpg", url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1441986300917-64674bd600d8" },
  { id: "construction", file: "construction.jpg", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1503387762-592deb58ef4e" },
  { id: "cafe", file: "cafe.jpg", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1495474472287-4d71bcdd2085" },
  { id: "remote", file: "remote.jpg", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80", credit: "https://unsplash.com/photos/photo-1522202176988-66273c2fd55f" },
];

const STOCK = [
  { slug: "01-no-placement", photo: "care-phone", igH: "No placement fee.", igS: "Flat-fee UK hiring.", liH: "Predictable hiring cost.", liS: "Flat monthly. No placement fee.", igC: "Agency fees quietly eat hiring budgets.\n\nRecruitment Site is flat-fee UK hiring — post roles, get AI-scored applicants, hire without a placement cut.\n\nrecruitmentsite.co.uk/pricing", liC: "UK employers: stop paying a percentage of salary every time you hire.\n\nRecruitment Site — flat-fee posting, AI match scores, Google Jobs syndication. No agency commission.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "02-apply-free", photo: "laptop", igH: "Apply free.", igS: "Thousands of UK jobs.", liH: "10,000+ UK jobs — apply free", liS: "Browse roles and apply in minutes.", igC: "Looking for work in the UK?\n\nBrowse thousands of roles and apply free — no paywall.\n\nrecruitmentsite.co.uk", liC: "Candidates: apply free to UK roles in minutes.\nEmployers: get applications with AI match scores — flat fee.\n\nrecruitmentsite.co.uk" },
  { slug: "03-ai-match", photo: "interview", igH: "AI match scores.", igS: "See fit before you call.", liH: "Every applicant scored 0–100", liS: "AI screens CVs so you shortlist faster.", igC: "Not every CV deserves a 20-minute screen.\n\nWe score applicants 0–100 so you see fit first.\n\nrecruitmentsite.co.uk/pricing", liC: "Shortlisting shouldn't take all afternoon.\n\nRecruitment Site scores every applicant 0–100 on apply.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "04-google-jobs", photo: "london", igH: "On Google Jobs.", igS: "Your roles, wider reach.", liH: "Your vacancies on Google Jobs", liS: "Candidates find you where they already search.", igC: "Post once. Reach candidates who search on Google Jobs.\n\nFlat-fee UK hiring — recruitmentsite.co.uk/pricing", liC: "Posting on one board isn't enough.\n\nWe syndicate roles (including Google Jobs) without agency fees.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "05-care", photo: "nurses", igH: "Hire care teams.", igS: "Flat fee. No commission.", liH: "Care hiring, simplified", liS: "Post roles. Score applicants. Hire direct.", igC: "Care providers: stop losing budget to agency placement fees.\n\nFlat-fee posts. AI-scored applicants.\n\nrecruitmentsite.co.uk/pricing", liC: "Care & healthcare employers — hiring doesn't need a commission cut.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "06-hospitality", photo: "kitchen-team", igH: "Fill kitchen roles.", igS: "Post today. Hire direct.", liH: "Hospitality hiring without the cut", liS: "Chefs, FOH, kitchen — flat fee.", igC: "Hospitality teams move fast. Your hiring board should too.\n\nPost roles, get applications, hire direct.\n\nrecruitmentsite.co.uk", liC: "Hospitality operators: post chef and FOH roles without an agency cut.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "07-trades", photo: "workshop", igH: "Trades & skilled.", igS: "People who can do the job.", liH: "Skilled trades hiring, flat fee", liS: "Post. Score. Hire — no commission.", igC: "Need skilled people — not another CV pile?\n\nPost the role. AI scores applicants.\n\nrecruitmentsite.co.uk", liC: "Trades & skilled employers: hire without paying a percentage of salary.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "08-sme", photo: "office-team", igH: "Built for SMEs.", igS: "Big-board reach. Flat fee.", liH: "SME hiring that scales", liS: "Unlimited posts on Growth. No placement fee.", igC: "Small teams shouldn't pay agency rates to hire one person.\n\nFlat-fee UK hiring for SMEs.\n\nrecruitmentsite.co.uk/pricing", liC: "If you're an SME hiring in the UK, agency commission is optional.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "09-unlimited", photo: "handshake", igH: "Unlimited posts.", igS: "On Growth. One flat fee.", liH: "Growth = unlimited live roles", liS: "Stop rationing vacancies.", igC: "Need to hire more than one role this month?\n\nGrowth includes unlimited live posts.\n\nrecruitmentsite.co.uk/pricing", liC: "Hiring more than one role? Don't pay per placement.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "10-warehouse", photo: "warehouse", igH: "Ops & logistics.", igS: "Hire the shift you need.", liH: "Warehouse & ops hiring", liS: "Flat fee. Faster shortlists.", igC: "Ops roles shouldn't mean agency maths.\n\nPost. Score applicants. Hire direct.\n\nrecruitmentsite.co.uk", liC: "Logistics & warehouse employers: flat-fee posting + AI screening.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "11-retail", photo: "retail", igH: "Retail teams.", igS: "Store-ready applicants.", liH: "Retail hiring without the cut", liS: "Post store roles. Keep every hire.", igC: "Retail moves fast — hiring should too.\n\nFlat-fee UK posts for store teams.\n\nrecruitmentsite.co.uk", liC: "Retail employers: post roles without a placement fee.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "12-build", photo: "construction", igH: "Build your crew.", igS: "Site roles. Flat fee.", liH: "Construction hiring, flat fee", liS: "Find people for the next job.", igC: "Construction & site roles — post once, hire direct.\n\nrecruitmentsite.co.uk/pricing", liC: "Construction employers: flat-fee UK hiring without agency commission.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "13-cafe", photo: "cafe", igH: "Café & FOH.", igS: "Staff up this week.", liH: "Hospitality FOH hiring", liS: "Post today. Applicants scored.", igC: "Need FOH or café cover?\n\nPost free-to-apply roles. Hire direct.\n\nrecruitmentsite.co.uk", liC: "Cafés and FOH teams: flat-fee posting on Recruitment Site.\n\n→ recruitmentsite.co.uk/pricing" },
  { slug: "14-pricing", photo: "remote", igH: "See pricing.", igS: "Clear. Flat. No surprise cut.", liH: "Transparent flat-fee pricing", liS: "Know the cost before you post.", igC: "No surprise placement fees.\n\nSee flat-fee plans and start posting.\n\nrecruitmentsite.co.uk/pricing", liC: "Pricing you can explain to a finance director.\n\nFlat fee. Unlimited posts on Growth.\n\nrecruitmentsite.co.uk/pricing" },
];

async function ensurePhoto(photo) {
  const dest = join(unsplashDir, photo.file);
  if (existsSync(dest) && readFileSync(dest).length > 10_000) return dest;
  const res = await fetch(photo.url, { headers: { "User-Agent": "RecruitmentSiteStock/1.0" } });
  if (!res.ok) throw new Error(`Unsplash fetch failed ${photo.id}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  console.log("Downloaded", photo.file, buf.length);
  return dest;
}

function igHtml(item, photoDataUrl, logoDataUrl) {
  return `
<div style="width:1080px;height:1080px;position:relative;overflow:hidden;color:#fff;font-family:${sans};">
  <img src="${photoDataUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
  <div style="position:absolute;inset:0;background:
    linear-gradient(165deg, rgba(8,79,73,0.82) 0%, rgba(12,107,99,0.68) 42%, rgba(8,79,73,0.86) 100%);"></div>
  <div style="position:relative;padding:52px 64px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;">
    <img src="${logoDataUrl}" width="64" height="64" alt="" style="border-radius:14px;"/>
    <div style="margin-top:auto;margin-bottom:120px;">
      <div style="font-family:${font};font-size:88px;font-weight:600;letter-spacing:-2px;line-height:1.05;max-width:920px;">
        ${item.igH}
      </div>
      <div style="margin-top:22px;font-family:${font};font-size:40px;font-weight:500;color:rgba(255,255,255,.92);line-height:1.2;">
        ${item.igS}
      </div>
      <div style="margin-top:26px;width:64px;height:3px;background:#c4a35a;"></div>
    </div>
    <div style="font-family:${font};font-size:26px;font-weight:600;color:#c4a35a;">recruitmentsite.co.uk</div>
  </div>
</div>`;
}

function liHtml(item, photoDataUrl, logoDataUrl) {
  return `
<div style="width:1200px;height:627px;position:relative;overflow:hidden;color:#fff;font-family:${sans};display:flex;">
  <div style="width:52%;background:#0c6b63;padding:44px 48px;box-sizing:border-box;display:flex;flex-direction:column;position:relative;">
    <img src="${logoDataUrl}" width="52" height="52" alt="" style="border-radius:12px;"/>
    <div style="margin-top:48px;font-family:${font};font-size:52px;font-weight:600;letter-spacing:-1.2px;line-height:1.08;max-width:480px;">
      ${item.liH}
    </div>
    <div style="margin-top:18px;font-family:${font};font-size:26px;font-weight:500;color:rgba(255,255,255,.9);line-height:1.3;max-width:460px;">
      ${item.liS}
    </div>
    <div style="margin-top:auto;background:#c4a35a;color:#084f49;font-weight:700;font-size:18px;padding:14px 22px;align-self:flex-start;">
      recruitmentsite.co.uk
    </div>
  </div>
  <div style="width:3px;background:#c4a35a;"></div>
  <div style="flex:1;position:relative;">
    <img src="${photoDataUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
  </div>
</div>`;
}

function startDate() {
  return new Date("2026-08-01T09:00:00+01:00");
}
function ymd(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (!existsSync(logoPath)) throw new Error("Missing avatar-800.png");
  const logoDataUrl = `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`;
  const photoById = Object.fromEntries(PHOTOS.map((p) => [p.id, p]));
  for (const p of PHOTOS) await ensurePhoto(p);

  writeFileSync(
    join(unsplashDir, "CREDITS.txt"),
    ["Unsplash sources (stock pack)", ...PHOTOS.map((p) => `${p.file} — ${p.credit}`)].join("\n") + "\n",
  );

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  const start = startDate();
  const rows = [];

  for (let i = 0; i < STOCK.length; i++) {
    const item = STOCK[i];
    const photo = photoById[item.photo];
    const dataUrl = `data:image/jpeg;base64,${readFileSync(join(unsplashDir, photo.file)).toString("base64")}`;
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const date = ymd(day);
    const igPath = join(postsDir, `${date}-ig.png`);
    const liPath = join(postsDir, `${date}-linkedin.png`);

    await page.setViewportSize({ width: 1080, height: 1080 });
    await page.setContent(
      `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet"/>
</head><body style="margin:0">${igHtml(item, dataUrl, logoDataUrl)}</body></html>`,
      { waitUntil: "networkidle" },
    );
    await page.waitForTimeout(350);
    await page.screenshot({ path: igPath, type: "png" });

    await page.setViewportSize({ width: 1200, height: 627 });
    await page.setContent(
      `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@500;700&display=swap" rel="stylesheet"/>
</head><body style="margin:0">${liHtml(item, dataUrl, logoDataUrl)}</body></html>`,
      { waitUntil: "networkidle" },
    );
    await page.waitForTimeout(350);
    await page.screenshot({ path: liPath, type: "png" });

    writeFileSync(
      join(docsDir, `${date}.md`),
      `# Stock pack ${date} — ${item.slug}

**Status:** queued  
**Planned publish:** ${date} ~09:00 Europe/London  
**Goal:** drive traffic to recruitmentsite.co.uk /pricing  
**Photo:** Unsplash \`${photo.file}\` (${photo.credit})

## Assets
- IG: \`apps/web/public/brand/social/posts/stock/${date}-ig.png\`
- LinkedIn / FB: \`apps/web/public/brand/social/posts/stock/${date}-linkedin.png\`

## Instagram
${item.igC}

## LinkedIn / Facebook
${item.liC}
`,
    );

    rows.push({
      date,
      slug: item.slug,
      status: "queued",
      ig: `apps/web/public/brand/social/posts/stock/${date}-ig.png`,
      linkedin: `apps/web/public/brand/social/posts/stock/${date}-linkedin.png`,
      pack: `docs/social-posts/stock/${date}.md`,
    });
    console.log("Wrote", date, item.slug);
  }

  await browser.close();

  writeFileSync(join(docsDir, "queue.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    method: "unsplash-premium-match-published-pack",
    note: "Canva profile was not logged in; posts match published quality with Unsplash variety. Publish when planned.",
    items: rows,
  }, null, 2) + "\n");

  const table = rows
    .map((r) => `| ${r.date} | ${r.slug} | \`${r.ig}\` | \`${r.linkedin}\` | ${r.status} |`)
    .join("\n");

  writeFileSync(
    join(docsDir, "QUEUE.md"),
    `# Social stock queue — traffic pack

Unique Unsplash creatives matching the **published 2026-07-30** layout (real logo, split LinkedIn).  
Saved locally for scheduled publish — no live Canva required.

Rebuild: \`node scripts/render-social-stock.mjs\`

| Date | Pack | Instagram | LinkedIn | Status |
|------|------|-----------|----------|--------|
${table}
`,
  );
  console.log("Stock pack complete:", rows.length, "days");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
