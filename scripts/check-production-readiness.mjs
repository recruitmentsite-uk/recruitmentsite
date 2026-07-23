#!/usr/bin/env node
const checks = [
  { name: "NEXT_PUBLIC_SITE_URL", env: "NEXT_PUBLIC_SITE_URL" },
  { name: "Supabase URL", env: "NEXT_PUBLIC_SUPABASE_URL" },
  { name: "Supabase anon key", env: "NEXT_PUBLIC_SUPABASE_ANON_KEY" },
  { name: "Supabase service role", env: "SUPABASE_SERVICE_ROLE_KEY" },
  { name: "Stripe secret", env: "STRIPE_SECRET_KEY" },
  { name: "Stripe webhook", env: "STRIPE_WEBHOOK_SECRET" },
  { name: "Resend API", env: "RESEND_API_KEY" },
  { name: "OpenAI (matching)", env: "OPENAI_API_KEY" },
  { name: "Admin emails", env: "ADMIN_EMAILS" },
  { name: "Employer notify email", env: "EMPLOYER_NOTIFY_EMAIL" },
];

console.log("Recruitment Site production readiness\n");
let ok = 0;
for (const c of checks) {
  const pass = !!process.env[c.env];
  console.log(`${pass ? "✓" : "✗"} ${c.name}`);
  if (pass) ok++;
}
console.log(`\n${ok}/${checks.length} configured`);
if (ok < checks.length) {
  console.log("Copy apps/web/.env.example → apps/web/.env.local and fill values.");
  console.log("Run pnpm ops:accounts for mailbox passwords and signup checklist.");
}
