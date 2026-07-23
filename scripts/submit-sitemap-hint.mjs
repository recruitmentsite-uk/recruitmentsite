#!/usr/bin/env node
/** Print Google Search Console sitemap submission steps. */
const site = "https://recruitmentsite.co.uk";
console.log("Google Search Console — submit sitemap\n");
console.log("1. Open https://search.google.com/search-console");
console.log("2. Add property → URL prefix →", site);
console.log("3. Verify via DNS TXT (Cloudflare) or HTML tag");
console.log("4. Sitemaps → Add:", `${site}/sitemap.xml`);
console.log("5. URL inspection → Request indexing for /jobs\n");
console.log("Sitemap is generated at apps/web/src/app/sitemap.ts (dynamic job URLs).");
