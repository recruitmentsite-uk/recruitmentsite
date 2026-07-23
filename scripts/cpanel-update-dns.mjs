#!/usr/bin/env node
/**
 * Update apex A + www CNAME for Vercel via cPanel UAPI.
 * Run: CPANEL_PASS=... node scripts/cpanel-update-dns.mjs
 */
const domain = "recruitmentsite.co.uk";
const host = process.env.CPANEL_HOST ?? domain;
const user = process.env.CPANEL_USER ?? "recruitadmin";
const pass = process.env.CPANEL_PASS;
const VERCEL_APEX = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com";

async function login() {
  const res = await fetch(`https://${host}:2083/login/?login_only=1`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ user, pass }),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const json = await res.json();
  if (json.status !== 1) throw new Error(`cPanel login failed: ${json.message ?? "unknown"}`);
  return {
    sessionCookie: setCookie.find((c) => c.startsWith("cpsession="))?.split(";")[0],
    sessionId: (json.security_token ?? "").replace(/^\//, ""),
  };
}

async function uapi(session, module, func, params = {}) {
  const qs = new URLSearchParams(params);
  const url = `https://${host}:2083/${session.sessionId}/execute/${module}/${func}?${qs}`;
  const res = await fetch(url, { headers: { Cookie: session.sessionCookie } });
  return res.json();
}

async function editRecord(session, line) {
  const result = await uapi(session, "DNS", "mass_edit_zone", {
    zone: domain,
    serial: String(Math.floor(Date.now() / 1000)),
    edit: JSON.stringify([line]),
  });
  return result;
}

async function main() {
  if (!pass) {
    console.error("Set CPANEL_PASS env var.");
    process.exit(1);
  }

  console.log(`Updating DNS for ${domain} → Vercel\n`);
  const session = await login();
  console.log("✓ Logged into cPanel\n");

  const apexEdit = {
    edit_type: "edit",
    dname: `${domain}.`,
    record_type: "A",
    ttl: 14400,
    data: [VERCEL_APEX],
  };
  const apex = await editRecord(session, apexEdit);
  console.log(
    "Apex A:",
    apex.status === 1 ? `✓ ${domain} → ${VERCEL_APEX}` : `✗ ${JSON.stringify(apex.errors ?? apex)}`,
  );

  const wwwEdit = {
    edit_type: "edit",
    dname: `www.${domain}.`,
    record_type: "CNAME",
    ttl: 14400,
    data: [`${VERCEL_CNAME}.`],
  };
  const www = await editRecord(session, wwwEdit);
  console.log(
    "www CNAME:",
    www.status === 1 ? `✓ www → ${VERCEL_CNAME}` : `✗ ${JSON.stringify(www.errors ?? www)}`,
  );

  console.log("\nMX records unchanged. Propagation: up to 1 hour.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
