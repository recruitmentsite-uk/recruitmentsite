#!/usr/bin/env node
const html = await fetch("https://www.reed.co.uk/jobs/care-assistant-jobs-in-manchester", {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
}).then((r) => r.text());
const data = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)[1]);
const sr = data.props.pageProps.searchResults;
console.log("total count", sr.count, "page jobs", sr.jobs.length);
