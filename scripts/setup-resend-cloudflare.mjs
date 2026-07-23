#!/usr/bin/env node
/**
 * Resend domain setup + DNS records on Cloudflare + verify.
 *
 * Prerequisites:
 *   - recruitmentsite.co.uk added to Cloudflare (Free plan)
 *   - Nameservers at registrar → Cloudflare (Blossom must update NS)
 *   - RESEND_API_KEY from https://resend.com/api-keys
 *   - CLOUDFLARE_API_TOKEN with Zone:DNS:Edit for the domain
 *
 * Run:
 *   RESEND_API_KEY=re_... CLOUDFLARE_API_TOKEN=... node scripts/setup-resend-cloudflare.mjs
 *   node scripts/setup-resend-cloudflare.mjs   # reads go-live-credentials.local.txt
 *
 * Faster manual path (Domain Connect):
 *   Resend → Domains → Add → Sign in to Cloudflare → Authorize
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const credsPath = join(__dirname, "..", "go-live-credentials.local.txt");

function readCreds(key) {
  if (!existsSync(credsPath)) return undefined;
  const creds = readFileSync(credsPath, "utf8");
  const m = creds.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m?.[1]?.trim();
}

const domain = process.env.RESEND_DOMAIN ?? "recruitmentsite.co.uk";
const resendKey = process.env.RESEND_API_KEY ?? readCreds("RESEND_API_KEY");
const cfToken = process.env.CLOUDFLARE_API_TOKEN ?? readCreds("CLOUDFLARE_API_TOKEN");
const region = process.env.RESEND_REGION ?? "eu-west-1";

async function resend(path, opts = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${path}: ${body.message ?? res.statusText}`);
  return body;
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
  const body = await res.json();
  if (!body.success) {
    throw new Error(`Cloudflare ${path}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.result;
}

function recordName(fullName) {
  if (!fullName || fullName === domain) return "@";
  const suffix = `.${domain}`;
  if (fullName.endsWith(suffix)) return fullName.slice(0, -suffix.length);
  return fullName;
}

async function upsertCfRecord(zoneId, record) {
  const type = record.type.toUpperCase();
  const name = recordName(record.name);
  const content = record.value?.replace(/^"|"$/g, "") ?? record.value;
  const priority = record.priority ?? undefined;

  const existing = await cf(
    `/zones/${zoneId}/dns_records?type=${type}&name=${encodeURIComponent(name === "@" ? domain : `${name}.${domain}`)}`,
  );

  const payload = {
    type,
    name,
    content,
    ttl: 1,
    proxied: false,
    ...(priority != null ? { priority } : {}),
  };

  if (existing?.length) {
    await cf(`/zones/${zoneId}/dns_records/${existing[0].id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    console.log(`  ✓ Updated ${type} ${name}`);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`  ✓ Created ${type} ${name}`);
  }
}

async function main() {
  console.log("Resend + Cloudflare domain setup\n");
  console.log(`Domain: ${domain}`);
  console.log(`Region: ${region}\n`);

  if (!resendKey || !cfToken) {
    console.log("Missing credentials. Set:");
    console.log("  RESEND_API_KEY       — https://resend.com/api-keys");
    console.log("  CLOUDFLARE_API_TOKEN — Cloudflare → My Profile → API Tokens");
    console.log("                         (Edit zone DNS for recruitmentsite.co.uk)\n");
    console.log("Or use Resend Domain Connect (no script needed):");
    console.log("  1. https://resend.com/domains → Add Domain → recruitmentsite.co.uk");
    console.log("  2. Click Sign in to Cloudflare → Authorize");
    console.log("  3. Wait for Verified status (~5–15 min)\n");
    console.log("IMPORTANT: Nameservers must point to Cloudflare first.");
    console.log("  Current authoritative DNS is still Blossom (ns1/ns2.blossomsweb.net).");
    console.log("  Ask Blossom to switch NS to your Cloudflare nameservers, then verify.");
    process.exit(1);
  }

  const zones = await cf(`/zones?name=${domain}`);
  if (!zones?.length) {
    throw new Error(`Cloudflare zone not found for ${domain}. Add it in Cloudflare dashboard first.`);
  }
  const zoneId = zones[0].id;
  console.log(`✓ Cloudflare zone: ${zoneId}\n`);

  let domainId;
  const listed = await resend("/domains");
  const found = listed.data?.find((d) => d.name === domain);
  if (found) {
    domainId = found.id;
    console.log(`✓ Resend domain already exists (${found.status})`);
  } else {
    const created = await resend("/domains", {
      method: "POST",
      body: JSON.stringify({ name: domain, region }),
    });
    domainId = created.id;
    console.log(`✓ Created Resend domain (${domainId})`);
  }

  const detail = await resend(`/domains/${domainId}`);
  const records = detail.records ?? [];
  if (!records.length) {
    throw new Error("No DNS records returned from Resend — check domain in dashboard.");
  }

  console.log("\nAdding DNS records to Cloudflare (proxy OFF):");
  for (const r of records) {
    if (r.record === "Tracking") continue;
    await upsertCfRecord(zoneId, r);
  }

  console.log("\nTriggering Resend verification...");
  await resend(`/domains/${domainId}/verify`, { method: "POST", body: "{}" });

  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    const check = await resend(`/domains/${domainId}`);
    console.log(`  Status: ${check.status}`);
    if (check.status === "verified") {
      console.log("\n✓ Domain verified on Resend");
      console.log("\nNext:");
      console.log("  1. Add RESEND_API_KEY to Vercel production");
      console.log("  2. cd apps/web && npx vercel env add RESEND_API_KEY production");
      console.log("  3. Redeploy: npx vercel --prod --yes (from repo root)");
      return;
    }
  }

  console.log("\nVerification still pending — DNS may need more time (up to 72h).");
  console.log("Check: https://resend.com/domains");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
