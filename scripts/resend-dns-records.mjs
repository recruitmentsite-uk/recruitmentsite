#!/usr/bin/env node
/** Print Resend DNS records for manual Cloudflare entry. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const key = process.env.RESEND_API_KEY ?? readFileSync(credsPath, "utf8").match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();

if (!key) {
  console.error("RESEND_API_KEY not found");
  process.exit(1);
}

const listed = await fetch("https://api.resend.com/domains", {
  headers: { Authorization: `Bearer ${key}` },
}).then((r) => r.json());

const domain = listed.data?.find((d) => d.name === "recruitmentsite.co.uk");
if (!domain) {
  console.error("Domain not found in Resend");
  process.exit(1);
}

const detail = await fetch(`https://api.resend.com/domains/${domain.id}`, {
  headers: { Authorization: `Bearer ${key}` },
}).then((r) => r.json());

console.log(`Domain status: ${detail.status}\n`);
for (const r of detail.records ?? []) {
  if (r.record === "Tracking") continue;
  console.log(`${r.type}\t${r.name}\t${r.value}${r.priority != null ? `\tpriority=${r.priority}` : ""}`);
}
