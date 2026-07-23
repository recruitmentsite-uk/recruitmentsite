#!/usr/bin/env node
/**
 * Create Recruitment Site mailboxes via cPanel UAPI.
 *
 * Requires env:
 *   CPANEL_HOST=recruitmentsite.co.uk
 *   CPANEL_USER=your_cpanel_username   (from hosting welcome email, max ~8 chars)
 *   CPANEL_PASS=your_cpanel_password
 *
 * Run: node scripts/cpanel-create-emails.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const domain = "recruitmentsite.co.uk";
const host = process.env.CPANEL_HOST ?? domain;
const user = process.env.CPANEL_USER;
const pass = process.env.CPANEL_PASS;

const MAILBOXES = ["hello", "notifications", "admin", "privacy", "legal", "billing"];

function parseCredentialsFile() {
  try {
    const text = readFileSync(join(root, "go-live-credentials.local.txt"), "utf8");
    const map = {};
    for (const local of MAILBOXES) {
      const re = new RegExp(`${local}@${domain.replace(".", "\\.")}[\\s\\S]*?Password: (\\S+)`, "m");
      const m = text.match(re);
      if (m) map[local] = m[1];
    }
    return map;
  } catch {
    return {};
  }
}

async function login() {
  const url = `https://${host}:2083/login/?login_only=1`;
  const body = new URLSearchParams({ user, pass });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const json = await res.json().catch(() => ({}));
  if (json.status !== 1) {
    throw new Error(`cPanel login failed: ${json.message ?? res.status} — check CPANEL_USER (not email)`);
  }
  const sessionCookie = setCookie.find((c) => c.startsWith("cpsession="))?.split(";")[0];
  if (!sessionCookie) throw new Error("No cpsession cookie returned");
  const sessionId = (json.security_token ?? "").replace(/^\//, "");
  if (!sessionId) throw new Error("No security_token returned");
  return { sessionCookie, sessionId };
}

async function createMailbox({ sessionCookie, sessionId }, local, password) {
  const params = new URLSearchParams({
    email: local,
    domain,
    password,
    quota: "1024",
  });
  const url = `https://${host}:2083/${sessionId}/execute/Email/add_pop?${params}`;
  const res = await fetch(url, { headers: { Cookie: sessionCookie } });
  const data = await res.json();
  if (data.status === 1) {
    console.log(`✓ ${local}@${domain}`);
    return true;
  }
  const reason = data.errors?.[0] ?? JSON.stringify(data).slice(0, 200);
  if (/already exists/i.test(String(reason))) {
    console.log(`• ${local}@${domain} (already exists)`);
    return true;
  }
  console.error(`✗ ${local}@${domain}: ${reason}`);
  return false;
}

async function main() {
  if (!user || !pass) {
    console.error("Set CPANEL_USER and CPANEL_PASS env vars.");
    console.error("Username is in your hosting welcome email (often 8 chars, NOT recruitadmin).");
    process.exit(1);
  }

  console.log(`Logging into cPanel at ${host} as ${user}...`);
  const session = await login();
  const passwords = parseCredentialsFile();
  let ok = 0;
  for (const local of MAILBOXES) {
    const pw = passwords[local];
    if (!pw) {
      console.error(`✗ ${local}@${domain}: no password in go-live-credentials.local.txt`);
      continue;
    }
    if (await createMailbox(session, local, pw)) ok++;
  }
  console.log(`\n${ok}/${MAILBOXES.length} mailboxes ready`);
  process.exit(ok === MAILBOXES.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
