#!/usr/bin/env node
const url = "https://www.reed.co.uk/jobs/care-assistant-jobs";
const html = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
}).then((r) => r.text());

const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
const data = JSON.parse(nextData[1]);
const jobs =
  data?.props?.pageProps?.jobResults?.results ??
  data?.props?.pageProps?.searchResults?.jobs ??
  [];
console.log(JSON.stringify(jobs[0], null, 2));
