#!/usr/bin/env node
import { setTimeout as sleep } from "node:timers/promises";

const url = "https://www.reed.co.uk/jobs/care-assistant-jobs";
const html = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
}).then((r) => r.text());
const data = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)[1]);
console.log("pageProps keys", Object.keys(data.props.pageProps));
console.log("jobResults keys", Object.keys(data.props.pageProps.jobResults ?? {}));
console.log("count", data.props.pageProps.jobResults?.results?.length);

await sleep(2000);
const url2 = "https://www.reed.co.uk/jobs/care-assistant-jobs?pageno=2";
const html2 = await fetch(url2, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
}).then((r) => r.text());
const data2 = JSON.parse(html2.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)[1]);
console.log("page2 count", data2.props.pageProps.jobResults?.results?.length);
