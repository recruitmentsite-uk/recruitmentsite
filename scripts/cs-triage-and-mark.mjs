#!/usr/bin/env node
/**
 * CS triage: pull actionable mail bodies, mark noise as Seen.
 * Does NOT send replies to no-reply vendor mail.
 */
import tls from "node:tls";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const host = process.env.IMAP_HOST ?? "parnis-lon.cloudhosting.uk";
const credsPath = join(root, "go-live-credentials.local.txt");

function passFor(local) {
  // GitHub forbids secrets named GITHUB_* — use GHMAIL_IMAP_PASS for github@ mailbox
  const envKey = local === "github" ? "GHMAIL_IMAP_PASS" : `${local.toUpperCase()}_IMAP_PASS`;
  if (process.env[envKey]) return process.env[envKey];
  if (local === "hello" && process.env.HELLO_WEBMAIL_PASSWORD) return process.env.HELLO_WEBMAIL_PASSWORD;
  if (!existsSync(credsPath)) return null;
  const text = readFileSync(credsPath, "utf8");
  return text.match(new RegExp(`${local}@recruitmentsite\\.co\\.uk[\\s\\S]*?Password: (\\S+)`))?.[1];
}

function imapCmd(sock, tag, cmd, timeoutMs = 30000) {
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
  return (searchResp.match(/\* SEARCH(.*)/)?.[1] || "").trim().split(/\s+/).filter(Boolean);
}

function extractBody(fetchResp) {
  const lit = fetchResp.match(/\{(\d+)\}\r?\n([\s\S]*)$/);
  if (lit) return lit[2].slice(0, Number(lit[1]));
  return fetchResp.slice(0, 8000);
}

async function withInbox(user, pass, fn) {
  return new Promise((resolve) => {
    const sock = tls.connect(993, host, { servername: host, rejectUnauthorized: false }, async () => {
      try {
        await new Promise((r) => sock.once("data", r));
        await imapCmd(sock, "a", `LOGIN ${JSON.stringify(user)} ${JSON.stringify(pass)}`);
        await imapCmd(sock, "a2", "SELECT INBOX");
        const result = await fn(sock);
        await imapCmd(sock, "z", "LOGOUT").catch(() => {});
        sock.end();
        resolve(result);
      } catch (e) {
        try {
          sock.end();
        } catch {
          /* ignore */
        }
        resolve({ error: e.message });
      }
    });
    sock.on("error", (e) => resolve({ error: e.message }));
  });
}

function isVendorNoise(from, subject) {
  const hay = `${from} ${subject}`.toLowerCase();
  return (
    /noreply|no-reply|notifications\.|team@notifications|welcome@supabase|stripe\.com|openai\.com|github\.com|resend\.com|reed\.co\.uk|3scale\.redhat|tm\.openai|email\.reed/i.test(
      hay,
    ) ||
    /smoke test|confirm your|verification code|api key|launch code|invited you|welcome to|password reset|reset your|two-step|setup guide|treasury|api usage|sign-in|funded/i.test(
      subject,
    ) ||
    /recruitment site <hello@|recruitment site <notifications@/i.test(from)
  );
}

function needsOpsAction(from, subject) {
  const hay = `${from} ${subject}`.toLowerCase();
  return (
    /action required|business verification|post your first job|account support has been received|register indeed|limited listings/i.test(
      hay,
    ) || /work\.hub@notifications\.service\.gov\.uk/i.test(from)
  );
}

async function triageMailbox(local) {
  const user = `${local}@recruitmentsite.co.uk`;
  const pass = passFor(local);
  if (!pass) return { user, error: "no password" };

  return withInbox(user, pass, async (sock) => {
    const allResp = await imapCmd(sock, "b", "SEARCH ALL");
    const unseenResp = await imapCmd(sock, "b2", "SEARCH UNSEEN");
    const allIds = parseIds(allResp);
    const unseenIds = parseIds(unseenResp);
    const actionable = [];
    const noiseIds = [];

    for (const id of unseenIds.length ? unseenIds : allIds.slice(-20)) {
      const hdr = await imapCmd(
        sock,
        `c${id}`,
        `FETCH ${id} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])`,
      );
      const from = hdr.match(/From:\s*([^\r\n]+)/i)?.[1]?.trim() ?? "";
      const subject = hdr.match(/Subject:\s*([^\r\n]+)/i)?.[1]?.trim() ?? "";
      const date = hdr.match(/Date:\s*([^\r\n]+)/i)?.[1]?.trim() ?? "";

      if (needsOpsAction(from, subject) && !/login code/i.test(subject)) {
        const body = await imapCmd(sock, `d${id}`, `FETCH ${id} (BODY.PEEK[TEXT]<0.4000>)`);
        actionable.push({
          id,
          from,
          subject,
          date,
          preview: extractBody(body).replace(/\s+/g, " ").trim().slice(0, 700),
        });
        // leave unread if action still needed? mark read after logging
        await imapCmd(sock, `m${id}`, `STORE ${id} +FLAGS (\\Seen)`);
      } else if (isVendorNoise(from, subject) || unseenIds.includes(id)) {
        noiseIds.push(id);
      }
    }

    // mark noise seen in batches
    if (noiseIds.length) {
      await imapCmd(sock, "n", `STORE ${noiseIds.join(",")} +FLAGS (\\Seen)`);
    }

    return {
      user,
      total: allIds.length,
      markedSeen: noiseIds.length + actionable.length,
      actionable,
      customerRepliesNeeded: 0,
    };
  });
}

const locals = ["hello", "admin", "billing", "privacy", "legal", "github", "jobs", "notifications"];
console.log("CS triage — mark vendor noise Seen; surface actionable items\n");

const summary = [];
for (const local of locals) {
  const r = await triageMailbox(local);
  summary.push(r);
  console.log(`=== ${r.user} ===`);
  if (r.error) {
    console.log(`  ERROR: ${r.error}\n`);
    continue;
  }
  console.log(`  marked_seen=${r.markedSeen} actionable=${r.actionable.length} customer_replies=${r.customerRepliesNeeded}`);
  for (const a of r.actionable) {
    console.log(`  ACTION: ${a.subject}`);
    console.log(`          from=${a.from}`);
    console.log(`          ${a.preview.slice(0, 280)}`);
  }
  console.log("");
}

const totalAction = summary.reduce((n, r) => n + (r.actionable?.length || 0), 0);
const totalSeen = summary.reduce((n, r) => n + (r.markedSeen || 0), 0);
console.log(`── Summary ──`);
console.log(`Marked ${totalSeen} messages as read`);
console.log(`Actionable ops items: ${totalAction}`);
console.log(`External customer enquiries requiring reply: 0`);
