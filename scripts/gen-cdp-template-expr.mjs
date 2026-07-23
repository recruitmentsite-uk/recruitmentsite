#!/usr/bin/env node
/** Print a Runtime.evaluate expression to fill Supabase template subject + Monaco body. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/gen-cdp-template-expr.mjs <slug>");
  process.exit(1);
}

const jsonPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".supabase-templates.json");
const routes = JSON.parse(readFileSync(jsonPath, "utf8"));
const t = routes.find((r) => r.slug === slug || r.slug.includes(slug));
if (!t) {
  console.error(`Template not found for slug: ${slug}`);
  process.exit(1);
}

const expr = `(() => {
  const subject = ${JSON.stringify(t.subject)};
  const body = ${JSON.stringify(t.body)};
  const subj = document.querySelector('input[type="text"]');
  if (subj) {
    subj.focus();
    subj.value = subject;
    subj.dispatchEvent(new Event('input', { bubbles: true }));
    subj.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const editors = window.monaco?.editor?.getEditors?.() || [];
  if (editors[0]) editors[0].setValue(body);
  return { subject: subj?.value, monaco: editors.length };
})()`;

process.stdout.write(expr);
