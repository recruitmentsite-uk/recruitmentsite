#!/usr/bin/env node
/** Print CDP expression that fills + saves a Supabase email template. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const slug = process.argv[2];
const jsonPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".supabase-templates.json");
const routes = JSON.parse(readFileSync(jsonPath, "utf8"));
const t = routes.find((r) => r.slug === slug);
if (!t) {
  console.error(`Template not found: ${slug}`);
  process.exit(1);
}

const expr = `(() => {
  const subject = ${JSON.stringify(t.subject)};
  const body = ${JSON.stringify(t.body)};
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  const subj = document.querySelector('input[type="text"], input[name^="MAILER"]');
  if (subj && setter) {
    subj.focus();
    setter.call(subj, subject);
    subj.dispatchEvent(new Event('input', { bubbles: true }));
    subj.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const editor = window.monaco?.editor?.getEditors?.()[0];
  if (editor) editor.setValue(body);
  const save = [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Save changes');
  if (save && !save.disabled) { save.click(); return 'saved'; }
  return { saveDisabled: save?.disabled, monaco: window.monaco?.editor?.getEditors?.().length || 0 };
})()`;

process.stdout.write(expr);
