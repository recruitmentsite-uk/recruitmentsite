#!/usr/bin/env node
/**
 * Configure Adzuna API keys on Vercel, GitHub, and local credentials.
 *
 * Usage:
 *   node scripts/setup-adzuna.mjs APP_ID APP_KEY
 * Or set env vars ADZUNA_APP_ID and ADZUNA_APP_KEY
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const credsPath = join(root, "go-live-credentials.local.txt");

const appId = process.argv[2] ?? process.env.ADZUNA_APP_ID;
const appKey = process.argv[3] ?? process.env.ADZUNA_APP_KEY;

if (!appId || !appKey) {
  console.error("Usage: node scripts/setup-adzuna.mjs APP_ID APP_KEY");
  console.error("\nRegister at https://developer.adzuna.com/signup");
  process.exit(1);
}

function upsertCreds() {
  let text = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
  const block = `## Adzuna (hello@recruitmentsite.co.uk)
Login: https://developer.adzuna.com/login
ADZUNA_APP_ID=${appId}
ADZUNA_APP_KEY=${appKey}
`;
  if (/## Adzuna/m.test(text)) {
    text = text.replace(/## Adzuna[\s\S]*?(?=\n## |\n*$)/, block.trimEnd() + "\n");
  } else {
    text = text.trimEnd() + "\n\n" + block;
  }
  writeFileSync(credsPath, text, "utf8");
  console.log("✓ Updated go-live-credentials.local.txt");
}

function vercelEnv(name, value) {
  spawnSync("vercel", ["env", "rm", name, "production", "-y"], {
    cwd: root,
    shell: true,
    stdio: "ignore",
  });
  const add = spawnSync("vercel", ["env", "add", name, "production"], {
    cwd: root,
    input: value,
    encoding: "utf8",
    shell: true,
  });
  if (add.status !== 0) {
    console.warn(`⚠  vercel env add ${name} failed`);
    return false;
  }
  console.log(`✓ Vercel production: ${name}`);
  return true;
}

function githubSecrets() {
  for (const [name, value] of [
    ["ADZUNA_APP_ID", appId],
    ["ADZUNA_APP_KEY", appKey],
  ]) {
    const r = spawnSync("gh", ["secret", "set", name], {
      cwd: root,
      input: value,
      encoding: "utf8",
      shell: true,
    });
    if (r.status !== 0) console.warn(`⚠  gh secret set ${name} failed`);
    else console.log(`✓ GitHub secret: ${name}`);
  }
}

upsertCreds();
vercelEnv("ADZUNA_APP_ID", appId);
vercelEnv("ADZUNA_APP_KEY", appKey);
githubSecrets();

console.log("\nRun: pnpm jobs:sync");
