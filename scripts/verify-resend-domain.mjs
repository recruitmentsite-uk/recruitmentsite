#!/usr/bin/env node
/** Trigger Resend domain verification and poll status. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const key = process.env.RESEND_API_KEY ?? readFileSync(credsPath, "utf8").match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();

const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const listed = await fetch("https://api.resend.com/domains", { headers }).then((r) => r.json());
const domain = listed.data?.find((d) => d.name === "recruitmentsite.co.uk");
if (!domain) throw new Error("Domain not found");

await fetch(`https://api.resend.com/domains/${domain.id}/verify`, { method: "POST", headers, body: "{}" });

for (let i = 0; i < 18; i++) {
  await new Promise((r) => setTimeout(r, 10000));
  const check = await fetch(`https://api.resend.com/domains/${domain.id}`, { headers }).then((r) => r.json());
  console.log(`Status: ${check.status}`);
  if (check.status === "verified") {
    console.log("✓ recruitmentsite.co.uk verified on Resend");
    process.exit(0);
  }
}
console.log("Still pending — check https://resend.com/domains");
