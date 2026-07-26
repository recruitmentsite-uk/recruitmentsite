#!/usr/bin/env node
/**
 * Serve IndexNow ownership key via Cloudflare Worker until Vercel ships public/{key}.txt.
 * Run: node scripts/serve-indexnow-key-cloudflare.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credsPath = join(root, "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const domain = "recruitmentsite.co.uk";
const cfToken = process.env.CLOUDFLARE_API_TOKEN ?? pick("CLOUDFLARE_API_TOKEN");
const KEY = (
  process.env.INDEXNOW_KEY ||
  (existsSync(join(root, "apps/web/public/indexnow-key.txt"))
    ? readFileSync(join(root, "apps/web/public/indexnow-key.txt"), "utf8").trim()
    : "")
).trim();
const scriptName = "indexnow-key";

if (!cfToken) {
  console.error("Need CLOUDFLARE_API_TOKEN in go-live-credentials.local.txt");
  process.exit(1);
}
if (!KEY) {
  console.error("Missing IndexNow key");
  process.exit(1);
}

async function cf(path, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${cfToken}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(`Cloudflare ${path}: ${JSON.stringify(json.errors ?? json)}`);
  return json.result;
}

const zones = await cf(`/zones?name=${domain}`);
const zoneId = zones[0]?.id;
const accountId = zones[0]?.account?.id;
if (!zoneId || !accountId) throw new Error("Zone/account not found");

const workerScript = `
addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});
async function handle(request) {
  const url = new URL(request.url);
  if (url.pathname === '/${KEY}.txt' || url.pathname === '/indexnow-key.txt') {
    return new Response('${KEY}', {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  }
  return fetch(request);
}
`;

await cf(`/accounts/${accountId}/workers/scripts/${scriptName}`, {
  method: "PUT",
  headers: { "Content-Type": "application/javascript" },
  body: workerScript,
});

const routes = await cf(`/zones/${zoneId}/workers/routes`);
const pattern = `${domain}/${KEY}.txt`;
const existing = (routes || []).find((r) => r.pattern === pattern);
if (existing) {
  await cf(`/zones/${zoneId}/workers/routes/${existing.id}`, {
    method: "PUT",
    body: JSON.stringify({ pattern, script: scriptName }),
  });
} else {
  await cf(`/zones/${zoneId}/workers/routes`, {
    method: "POST",
    body: JSON.stringify({ pattern, script: scriptName }),
  });
}

console.log(`✓ Worker ${scriptName} serving https://${domain}/${KEY}.txt`);
console.log("Next: pnpm ops:indexnow");
