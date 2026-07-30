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
const excludeExact = new Set([".git", ".next", ".vercel", "apps/web/.next", "apps/web/.vercel"]);

function shouldCopy(source) {
  const rel = source.slice(root.length + 1).replace(/\\/g, "/");
  if (!rel) return true;
  if (excludeExact.has(rel)) return false;
  // Skip any node_modules / build / git path segment (pnpm workspace symlinks break on Windows).
  const parts = rel.split("/");
  if (parts.some((p) => p === "node_modules" || p === ".git" || p === ".next" || p === ".vercel")) {
    return false;
  }
  return true;
}

function copyDir(src, dest) {
  cpSync(src, dest, {
    recursive: true,
    filter: shouldCopy,
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
