#!/usr/bin/env node
const url = "https://www.hays.co.uk/job-search/care-assistant-jobs";
const html = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; PlaceUK-Research/1.0)" },
}).then((r) => r.text());
console.log("len", html.length);
const next = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
console.log("next data", !!next);
const ld = [...html.matchAll(/"employerName":"([^"]+)"/g)].map((m) => m[1]);
console.log("employers", [...new Set(ld)].slice(0, 10));
