#!/usr/bin/env node
import tls from "node:tls";

const host = process.env.IMAP_HOST ?? "parnis-lon.cloudhosting.uk";
const accounts = [
  ["hello@recruitmentsite.co.uk", "SGMuwBvS5MlZ4eD9PU1VmQ"],
  ["admin@recruitmentsite.co.uk", "5vS5l3iDlrc6UfvxZBAcFg"],
  ["notifications@recruitmentsite.co.uk", "o0NfZByi6cWIdF_OVF9kTQ"],
  ["billing@recruitmentsite.co.uk", "UGuPaxWfl0jR8YfLHiz2IQ"],
  ["privacy@recruitmentsite.co.uk", "k1GDfeMWED02zld0a3MItg"],
  ["legal@recruitmentsite.co.uk", "0-Zv8bxWlWlDU5HHS5BM1Q"],
];

function imapCmd(sock, tag, cmd) {
  return new Promise((resolve, reject) => {
    let data = "";
    const onData = (chunk) => {
      data += chunk.toString();
      if (data.includes(`${tag} OK`) || data.includes(`${tag} NO`) || data.includes(`${tag} BAD`)) {
        sock.removeListener("data", onData);
        resolve(data);
      }
    };
    sock.on("data", onData);
    sock.write(`${tag} ${cmd}\r\n`);
    setTimeout(() => {
      sock.removeListener("data", onData);
      reject(new Error(`timeout: ${cmd}`));
    }, 15000);
  });
}

async function checkAccount(user, pass) {
  return new Promise((resolve) => {
    const sock = tls.connect(993, host, { servername: host, rejectUnauthorized: false }, async () => {
      try {
        await new Promise((r) => sock.once("data", r));
        await imapCmd(sock, "a", `LOGIN "${user}" "${pass}"`);
        await imapCmd(sock, "a2", "SELECT INBOX");
        const search = await imapCmd(sock, "b", "SEARCH ALL");
        const cfSearch = await imapCmd(sock, "b2", 'SEARCH TEXT "cloudflare"');
        const countMatch = search.match(/\* SEARCH(.*)/);
        const ids = countMatch ? countMatch[1].trim().split(/\s+/).filter(Boolean) : [];
        const cfMatch = cfSearch.match(/\* SEARCH(.*)/);
        const cfIds = cfMatch ? cfMatch[1].trim().split(/\s+/).filter(Boolean) : [];
        const subjects = [];
        const cloudflare = [];

        if (ids.length) {
          const fetch = await imapCmd(
            sock,
            "c",
            `FETCH ${ids.join(",")} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])`,
          );
          for (const block of fetch.split("* FETCH").slice(1)) {
            const subj = block.match(/Subject:([^\n\r]+)/i)?.[1]?.trim() ?? "";
            const from = block.match(/From:([^\n\r]+)/i)?.[1]?.trim() ?? "";
            if (subj || from) subjects.push({ subj, from });
            const hay = `${subj} ${from}`.toLowerCase();
            if (hay.includes("cloudflare")) cloudflare.push({ subj, from });
          }
        }

        await imapCmd(sock, "d", "LOGOUT");
        sock.end();
        resolve({ user, total: ids.length, cfMatches: cfIds.length, subjects, cloudflare });
      } catch (e) {
        sock.end();
        resolve({ user, error: e.message });
      }
    });
    sock.on("error", (e) => resolve({ user, error: e.message }));
  });
}

console.log(`Checking ${accounts.length} mailboxes on ${host}...\n`);
for (const [user, pass] of accounts) {
  const r = await checkAccount(user, pass);
  console.log(`=== ${user} ===`);
  if (r.error) {
    console.log(`  ERROR: ${r.error}`);
  } else {
    console.log(`  Total messages: ${r.total}`);
    console.log(`  Cloudflare TEXT search matches: ${r.cfMatches ?? 0}`);
    if (r.subjects.length) {
      for (const s of r.subjects) console.log(`  - ${s.subj || "(no subject)"} | ${s.from}`);
    } else {
      console.log("  (empty inbox)");
    }
    if (r.cloudflare.length) {
      console.log("  CLOUDFLARE MATCHES:");
      for (const c of r.cloudflare) console.log(`    * ${c.subj} | ${c.from}`);
    }
  }
  console.log("");
}
