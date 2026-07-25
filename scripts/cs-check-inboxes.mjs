#!/usr/bin/env node
/**
 * Customer service inbox triage: list recent/unread mail across mailboxes.
 * Usage: node scripts/cs-check-inboxes.mjs
 */
import tls from "node:tls";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const host = process.env.IMAP_HOST ?? "parnis-lon.cloudhosting.uk";
const credsPath = join(root, "go-live-credentials.local.txt");

const LOCALS = ["hello", "admin", "notifications", "billing", "privacy", "legal", "github", "jobs"];

function passFor(local) {
  if (!existsSync(credsPath)) return process.env[`${local.toUpperCase()}_PASS`];
  const text = readFileSync(credsPath, "utf8");
  const m = text.match(new RegExp(`${local}@recruitmentsite\\.co\\.uk[\\s\\S]*?Password: (\\S+)`));
  return m?.[1];
}

function imapCmd(sock, tag, cmd, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    let data = "";
    const onData = (chunk) => {
      data += chunk.toString();
      if (data.includes(`${tag} OK`) || data.includes(`${tag} NO`) || data.includes(`${tag} BAD`)) {
        sock.removeListener("data", onData);
        clearTimeout(t);
        resolve(data);
      }
    };
    const t = setTimeout(() => {
      sock.removeListener("data", onData);
      reject(new Error(`timeout: ${cmd}`));
    }, timeoutMs);
    sock.on("data", onData);
    sock.write(`${tag} ${cmd}\r\n`);
  });
}

function parseIds(searchResp) {
  return (searchResp.match(/\* SEARCH(.*)/)?.[1] || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function headerField(block, name) {
  const re = new RegExp(`${name}:\\s*([^\\r\\n]+)`, "i");
  return block.match(re)?.[1]?.trim() ?? "";
}

function extractBodyPeek(fetchResp) {
  const lit = fetchResp.match(/\{(\d+)\}\r?\n([\s\S]*)$/);
  if (lit) return lit[2].slice(0, Number(lit[1]));
  return fetchResp
    .replace(/[\s\S]*BODY\[[^\]]*\][^\n]*\n/, "")
    .replace(/\r?\n\)?\s*[a-z0-9]+ OK[\s\S]*/i, "")
    .slice(0, 3000);
}

async function listInbox(user, pass) {
  return new Promise((resolve) => {
    const sock = tls.connect(993, host, { servername: host, rejectUnauthorized: false }, async () => {
      try {
        await new Promise((r) => sock.once("data", r));
        await imapCmd(sock, "a", `LOGIN ${JSON.stringify(user)} ${JSON.stringify(pass)}`);
        await imapCmd(sock, "a2", "SELECT INBOX");
        const unseenResp = await imapCmd(sock, "b", "SEARCH UNSEEN");
        const allResp = await imapCmd(sock, "b2", "SEARCH ALL");
        const unseenIds = parseIds(unseenResp);
        const allIds = parseIds(allResp);
        const recent = allIds.slice(-40);
        const ids = [...new Set([...unseenIds, ...recent])];
        const messages = [];

        for (const id of ids) {
          const hdr = await imapCmd(
            sock,
            `c${id}`,
            `FETCH ${id} (FLAGS BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID IN-REPLY-TO)])`,
          );
          const body = await imapCmd(sock, `d${id}`, `FETCH ${id} (BODY.PEEK[TEXT]<0.3000>)`, 35000);
          const flags = hdr.match(/FLAGS \(([^)]*)\)/)?.[1] ?? "";
          const preview = extractBodyPeek(body).replace(/\s+/g, " ").trim().slice(0, 500);
          messages.push({
            id,
            unseen: !/\\Seen/i.test(flags) || unseenIds.includes(id),
            from: headerField(hdr, "From"),
            to: headerField(hdr, "To"),
            subject: headerField(hdr, "Subject"),
            date: headerField(hdr, "Date"),
            messageId: headerField(hdr, "Message-ID"),
            inReplyTo: headerField(hdr, "In-Reply-To"),
            preview,
          });
        }

        await imapCmd(sock, "z", "LOGOUT").catch(() => {});
        sock.end();
        resolve({ user, total: allIds.length, unseen: unseenIds.length, messages });
      } catch (e) {
        try {
          sock.end();
        } catch {
          /* ignore */
        }
        resolve({ user, error: e.message });
      }
    });
    sock.on("error", (e) => resolve({ user, error: e.message }));
  });
}

const accounts = LOCALS.map((l) => [`${l}@recruitmentsite.co.uk`, passFor(l)]).filter(([, p]) => p);
console.log(`Customer service inbox check — ${accounts.length} mailboxes on ${host}\n`);

for (const [user, pass] of accounts) {
  const r = await listInbox(user, pass);
  console.log(`=== ${user} ===`);
  if (r.error) {
    console.log(`  ERROR: ${r.error}\n`);
    continue;
  }
  console.log(`  total=${r.total} unseen=${r.unseen}`);
  if (!r.messages.length) {
    console.log("  (empty)\n");
    continue;
  }
  for (const m of r.messages) {
    const flag = m.unseen ? "UNREAD" : "read  ";
    console.log(`  [${flag}] ${m.date} | ${m.from}`);
    console.log(`           ${m.subject || "(no subject)"}`);
    if (m.preview) console.log(`           ${m.preview.slice(0, 220)}`);
  }
  console.log("");
}
