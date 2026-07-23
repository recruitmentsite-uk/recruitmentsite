#!/usr/bin/env node
const q = process.argv[2] ?? "care assistant";
const l = process.argv[3] ?? "London";
const url = `https://uk.indeed.com/jobs?q=${encodeURIComponent(q)}&l=${encodeURIComponent(l)}`;
const res = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
});
const html = await res.text();
console.log("len", html.length);

const mosaic = html.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]=(\{[\s\S]*?\});/);
if (mosaic) {
  try {
    const data = JSON.parse(mosaic[1]);
    const results = data?.metaData?.mosaicProviderJobCardsModel?.results ?? [];
    console.log("mosaic jobs", results.length);
    for (const job of results.slice(0, 5)) {
      console.log("-", job.title, "|", job.company, "|", job.displayTitle);
    }
  } catch (e) {
    console.log("mosaic parse fail", e.message);
  }
}

const companies = [...html.matchAll(/data-company-name="([^"]+)"/g)].map((m) => m[1]);
console.log("data-company-name", companies.slice(0, 8));
