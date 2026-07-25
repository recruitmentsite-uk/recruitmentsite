/**
 * Configure REED_API_KEY on Vercel, GitHub, and local credentials.
 * Usage: node scripts/setup-reed.mjs <API_KEY>
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const credsPath = join(root, "go-live-credentials.local.txt");
const apiKey = process.argv[2] ?? process.env.REED_API_KEY;

if (!apiKey) {
  console.error("Usage: node scripts/setup-reed.mjs API_KEY");
  console.error("Register at https://www.reed.co.uk/developers/jobseeker");
  process.exit(1);
}

function upsertCreds() {
  let text = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
  const block = `## Reed Jobseeker API (hello@recruitmentsite.co.uk)
Login/docs: https://www.reed.co.uk/developers/jobseeker
REED_API_KEY=${apiKey}
`;
  if (/## Reed/m.test(text)) {
    text = text.replace(/## Reed[\s\S]*?(?=\n## |\n*$)/, block.trimEnd() + "\n");
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

function githubSecret(name, value) {
  const r = spawnSync("gh", ["secret", "set", name], {
    cwd: root,
    input: value,
    encoding: "utf8",
    shell: true,
  });
  if (r.status !== 0) console.warn(`⚠  gh secret set ${name} failed`);
  else console.log(`✓ GitHub secret: ${name}`);
}

upsertCreds();
vercelEnv("REED_API_KEY", apiKey);
githubSecret("REED_API_KEY", apiKey);
console.log("\nRun: pnpm jobs:sync");
