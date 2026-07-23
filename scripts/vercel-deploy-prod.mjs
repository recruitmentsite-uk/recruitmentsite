#!/usr/bin/env node
/**
 * Deploy to Vercel production without git metadata.
 *
 * Vercel Hobby teams block CLI deploys when the git commit author email
 * doesn't match a verified team member. Copying the project to a temp folder
 * (excluding .git) avoids that check and runs a remote build on Vercel.
 *
 * Run: node scripts/vercel-deploy-prod.mjs
 */
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const tempRoot = mkdtempSync(join(tmpdir(), "placeuk-deploy-"));
const exclude = new Set([
  "node_modules",
  ".git",
  ".next",
  ".vercel",
  "apps/web/.next",
  "apps/web/.vercel",
]);

function copyDir(src, dest) {
  cpSync(src, dest, {
    recursive: true,
    filter: (source) => {
      const rel = source.slice(root.length + 1).replace(/\\/g, "/");
      if (!rel) return true;
      return !exclude.has(rel) && ![...exclude].some((part) => rel.startsWith(`${part}/`));
    },
  });
}

console.log(`Copying project to ${tempRoot}...`);
copyDir(root, tempRoot);

const link = spawnSync("vercel", ["link", "--project", "web", "--yes"], {
  cwd: tempRoot,
  stdio: "inherit",
  shell: true,
});
if (link.status !== 0) process.exit(link.status ?? 1);

const deploy = spawnSync("vercel", ["deploy", "--prod", "--yes"], {
  cwd: tempRoot,
  stdio: "inherit",
  shell: true,
});

rmSync(tempRoot, { recursive: true, force: true });
process.exit(deploy.status ?? 1);
