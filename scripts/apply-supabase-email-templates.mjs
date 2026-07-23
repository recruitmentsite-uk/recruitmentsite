#!/usr/bin/env node
/**
 * Apply one Supabase email template via Management API (single template patch).
 * Requires SUPABASE_ACCESS_TOKEN in env or go-live-credentials.local.txt
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { templateRoutes } from "./supabase-template-routes.mjs";

const projectRef = "wvwhxnokuisxcgwbwqlo";
const credsPath = join(dirname(fileURLToPath(import.meta.url)), "..", "go-live-credentials.local.txt");
const creds = existsSync(credsPath) ? readFileSync(credsPath, "utf8") : "";
const pick = (k) => process.env[k] ?? creds.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1]?.trim();
const accessToken = pick("SUPABASE_ACCESS_TOKEN");

const apiMap = {
  "confirm-sign-up": ["mailer_subjects_confirmation", "mailer_templates_confirmation_content"],
  "magic-link-or-otp": ["mailer_subjects_magic_link", "mailer_templates_magic_link_content"],
  "reset-password": ["mailer_subjects_recovery", "mailer_templates_recovery_content"],
  "change-email-address": ["mailer_subjects_email_change", "mailer_templates_email_change_content"],
  "invite-user": ["mailer_subjects_invite", "mailer_templates_invite_content"],
  reauthentication: ["mailer_subjects_reauthentication", "mailer_templates_reauthentication_content"],
  "password-changed": [
    "mailer_subjects_password_changed_notification",
    "mailer_templates_password_changed_notification_content",
  ],
  "email-address-changed": [
    "mailer_subjects_email_changed_notification",
    "mailer_templates_email_changed_notification_content",
  ],
};

if (!accessToken) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const body = {
  mailer_notifications_password_changed_enabled: true,
  mailer_notifications_email_changed_enabled: true,
  mailer_notifications_phone_changed_enabled: true,
  mailer_notifications_identity_linked_enabled: true,
  mailer_notifications_identity_unlinked_enabled: true,
  mailer_notifications_mfa_factor_enrolled_enabled: true,
  mailer_notifications_mfa_factor_unenrolled_enabled: true,
};

for (const route of templateRoutes) {
  const keys = apiMap[route.slug];
  if (!keys) continue;
  body[keys[0]] = route.subject;
  body[keys[1]] = route.body;
}

const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error("Management API failed:", res.status, await res.text());
  process.exit(1);
}

console.log(`✓ Applied ${templateRoutes.length} branded templates + security notifications`);
