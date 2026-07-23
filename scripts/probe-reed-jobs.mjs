#!/usr/bin/env node
const url = process.argv[2] ?? "https://www.reed.co.uk/jobs/care-assistant-jobs";
const res = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
});
const html = await res.text();

const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
  (m) => m[1],
);
console.log("jsonLd blocks", jsonLd.length);
for (const block of jsonLd.slice(0, 2)) {
  try {
    const data = JSON.parse(block);
    console.log(JSON.stringify(data, null, 2).slice(0, 1200));
  } catch {
    console.log(block.slice(0, 400));
  }
}

const companies = [...html.matchAll(/data-qa="displayJobItem-companyName"[^>]*>([^<]+)/gi)].map(
  (m) => m[1].trim(),
);
console.log("\ncompanies sample", companies.slice(0, 10));

const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
if (nextData) {
  const data = JSON.parse(nextData[1]);
  const jobs =
    data?.props?.pageProps?.jobResults?.results ??
    data?.props?.pageProps?.searchResults?.jobs ??
    [];
  console.log("\nnext jobs", jobs.length);
  for (const job of jobs.slice(0, 5)) {
    console.log("-", job.jobTitle ?? job.title, "|", job.companyName ?? job.employerName);
  }
}

const embedded = [...html.matchAll(/"companyName":"([^"]+)"/g)].map((m) => m[1]);
console.log("\nembedded companyName", [...new Set(embedded)].slice(0, 10));
