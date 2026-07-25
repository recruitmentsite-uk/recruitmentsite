#!/usr/bin/env node
/**
 * Configure OpenAI API key across local credentials, Vercel, and GitHub.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/setup-openai.mjs
 *   node scripts/setup-openai.mjs sk-...
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const credsPath = join(root, "go-live-credentials.local.txt");

const apiKey = process.argv[2] ?? process.env.OPENAI_API_KEY;
if (!apiKey?.startsWith("sk-")) {
  console.error("Usage: OPENAI_API_KEY=sk-... node scripts/setup-openai.mjs");
  console.error("\nCreate account at https://platform.openai.com/signup");
  console.error("Email: admin@recruitmentsite.co.uk");
  console.error("Verify via webmail: https://parnis-lon.cloudhosting.uk:2096");
  process.exit(1);
}

function upsertCreds(key) {
  let text = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
  const line = `OPENAI_API_KEY=${key}`;
  if (/^OPENAI_API_KEY=/m.test(text)) {
    text = text.replace(/^OPENAI_API_KEY=.*$/m, line);
  } else {
    text = text.trimEnd() + `\n\n## OpenAI (admin@recruitmentsite.co.uk)\nLogin: https://platform.openai.com\n${line}\n`;
  }
  writeFileSync(credsPath, text, "utf8");
  console.log("✓ Saved to go-live-credentials.local.txt");
}

function addVercelEnv(key) {
  const add = spawnSync(
    "vercel",
    ["env", "add", "OPENAI_API_KEY", "production", "preview", "development"],
    { cwd: root, input: key, encoding: "utf8", shell: true },
  );
  if (add.status !== 0) {
    console.warn("⚠  Vercel env add failed — run manually:");
    console.warn("   vercel env add OPENAI_API_KEY production preview development");
    return;
  }
  console.log("✓ Added OPENAI_API_KEY to Vercel (all environments)");
}

function addGithubSecret(key) {
  const gh = spawnSync("gh", ["secret", "set", "OPENAI_API_KEY"], {
    cwd: root,
    input: key,
    encoding: "utf8",
    shell: true,
  });
  if (gh.status !== 0) {
    console.warn("⚠  GitHub secret set failed — run: gh secret set OPENAI_API_KEY");
    return;
  }
  console.log("✓ Set OPENAI_API_KEY in GitHub Actions secrets");
}

upsertCreds(apiKey);
addVercelEnv(apiKey);
addGithubSecret(apiKey);

console.log("\nRun: pnpm jobs:polish");
