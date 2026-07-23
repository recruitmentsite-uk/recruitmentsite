#!/usr/bin/env node
/**
 * Fetch latest Resend verification/login link from hello@ inbox via IMAP.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tls from "node:tls";

const __dirname = dirname(fileURLToPath(import.meta.url));
const creds = readFileSync(join(__dirname, "..", "go-live-credentials.local.txt"), "utf8");
const password = creds.match(/hello@recruitmentsite\.co\.uk[\s\S]*?Password: (\S+)/)?.[1];
const email = "hello@recruitmentsite.co.uk";
const host = "parnis-lon.cloudhosting.uk";
const port = 993;

if (!password) {
  console.error("hello@ password not found in credentials file");
  process.exit(1);
}

function send(conn, cmd) {
  return new Promise((resolve, reject) => {
    const tag = `A${++tagCounter}`;
    const handler = (line) => {
      if (line.startsWith(tag)) {
        conn.removeListener("data", onData);
        if (line.includes(" OK")) resolve(line);
        else reject(new Error(line));
      }
    };
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\r\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handler(line);
    };
    conn.on("data", onData);
    conn.write(`${tag} ${cmd}\r\n`);
  });
}

let tagCounter = 0;

function fetchLiteral(conn, tag, literalSize) {
  return new Promise((resolve) => {
    let data = "";
    const onData = (chunk) => {
      data += chunk.toString();
      if (data.length >= literalSize) {
        conn.removeListener("data", onData);
        resolve(data.slice(0, literalSize));
      }
    };
    conn.on("data", onData);
  });
}

async function imapCommand(conn, cmd) {
  const tag = `A${++tagCounter}`;
  return new Promise((resolve, reject) => {
    let buffer = "";
    const lines = [];
    const onData = (chunk) => {
      buffer += chunk.toString();
      let idx;
      while ((idx = buffer.indexOf("\r\n")) !== -1) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        lines.push(line);
        if (line.startsWith(tag)) {
          conn.removeListener("data", onData);
          if (line.includes(" OK")) resolve(lines.join("\n"));
          else reject(new Error(lines.join("\n")));
          return;
        }
      }
    };
    conn.on("data", onData);
    conn.write(`${tag} ${cmd}\r\n`);
  });
}

const conn = tls.connect({ host, port, rejectUnauthorized: false }, async () => {
  try {
    await new Promise((resolve, reject) => {
      let greeting = "";
      const onData = (chunk) => {
        greeting += chunk.toString();
        if (greeting.includes("\r\n")) {
          conn.removeListener("data", onData);
          resolve();
        }
      };
      conn.on("data", onData);
    });

    await imapCommand(conn, `LOGIN ${JSON.stringify(email)} ${JSON.stringify(password)}`);
    await imapCommand(conn, "SELECT INBOX");

    const searchResult = await imapCommand(conn, 'SEARCH FROM "resend.com"');
    const ids = searchResult.match(/\* SEARCH (.+)/)?.[1]?.trim().split(" ").filter(Boolean) ?? [];
    if (!ids.length) {
      console.log("No Resend emails found in inbox");
      await imapCommand(conn, "LOGOUT");
      conn.end();
      process.exit(1);
    }

    const latestId = ids[ids.length - 1];
    const fetchResult = await imapCommand(conn, `FETCH ${latestId} (BODY[])`);
    const linkMatch = fetchResult.match(/https:\/\/[^\s"'<>]*resend\.com[^\s"'<>]*/gi);
    const links = [...new Set(linkMatch ?? [])];
    const verify = links.find((l) => /confirm|verify|auth|login|magic/i.test(l)) ?? links[0];

    console.log(`Latest Resend email id: ${latestId}`);
    console.log(`Links found: ${links.length}`);
    if (verify) console.log(`\nVERIFY_LINK=${verify}`);
    else {
      console.log("\nRaw snippet:");
      console.log(fetchResult.slice(0, 2000));
    }

    await imapCommand(conn, "LOGOUT");
    conn.end();
  } catch (err) {
    console.error(err.message);
    conn.end();
    process.exit(1);
  }
});

conn.on("error", (e) => {
  console.error("IMAP error:", e.message);
  process.exit(1);
});
