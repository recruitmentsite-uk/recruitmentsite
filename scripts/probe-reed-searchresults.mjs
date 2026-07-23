#!/usr/bin/env node
const html = await fetch("https://www.reed.co.uk/jobs/care-assistant-jobs", {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
}).then((r) => r.text());
const data = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)[1]);
const sr = data.props.pageProps.searchResults;
console.log("searchResults keys", Object.keys(sr));
console.log("jobs count", sr.jobs?.length ?? sr.results?.length);
const jobs = sr.jobs ?? sr.results ?? [];
console.log(JSON.stringify(jobs[0], null, 2).slice(0, 800));
