#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const key = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt"), "utf8").match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
const listed = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${key}` } }).then(r => r.json());
const d = listed.data?.find(x => x.name === "recruitmentsite.co.uk");
const detail = await fetch(`https://api.resend.com/domains/${d.id}`, { headers: { Authorization: `Bearer ${key}` } }).then(r => r.json());
console.log(JSON.stringify(detail, null, 2));
