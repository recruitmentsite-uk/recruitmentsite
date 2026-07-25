#!/usr/bin/env node
/**
 * Google Search Console setup for recruitmentsite.co.uk
 * Owner account: rbee.mehmood@gmail.com
 */
const site = "https://recruitmentsite.co.uk";

console.log("Google Search Console — Recruitment Site\n");
console.log("Account: rbee.mehmood@gmail.com");
console.log("Property (preferred): Domain → recruitmentsite.co.uk");
console.log("Fallback property: URL prefix →", site);
console.log("");
console.log("1. Open https://search.google.com/search-console?utm_source=about-page");
console.log("2. Sign in as rbee.mehmood@gmail.com");
console.log("3. Add property:");
console.log("   • Domain (recommended): recruitmentsite.co.uk");
console.log("     → Copy the google-site-verification TXT record");
console.log("     → Cloudflare → DNS → Add TXT @ (or recruitmentsite.co.uk)");
console.log("   • OR URL prefix:", site);
console.log("     → HTML tag → copy content= value");
console.log("     → Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION on Vercel + redeploy");
console.log("4. After verification → Sitemaps → Add:", `${site}/sitemap.xml`);
console.log("5. URL Inspection → Request indexing for / and /jobs");
console.log("6. Settings → Users → keep rbee.mehmood@gmail.com as Owner");
console.log("");
console.log("Live checks:");
console.log("  robots:", `${site}/robots.txt`);
console.log("  sitemap:", `${site}/sitemap.xml`);
console.log("");
console.log("Sitemap source: apps/web/src/app/sitemap.ts");
