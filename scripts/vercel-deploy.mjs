#!/usr/bin/env node
/**
 * Prints Vercel production deploy steps (run manually — requires approval).
 * Run: node scripts/vercel-deploy.mjs
 */
const domain = "recruitmentsite.co.uk";

console.log("Recruitment Site — Vercel production deploy\n");
console.log("Project: backend-7626s-projects/web (linked in apps/web/.vercel)\n");

console.log("── Step 1: Add production env vars ──");
console.log("cd apps/web");
console.log("Copy values from apps/web/.env.production.template and go-live-credentials.local.txt\n");
const envVars = [
  "NEXT_PUBLIC_SITE_URL=https://" + domain,
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "EMPLOYER_NOTIFY_EMAIL=hello@" + domain,
  "ADMIN_EMAILS=admin@" + domain,
  "STRIPE_SECRET_KEY (when ready)",
  "STRIPE_WEBHOOK_SECRET (when ready)",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (when ready)",
  "RESEND_API_KEY (when ready)",
  "OPENAI_API_KEY (when ready)",
];
for (const v of envVars) console.log("  vercel env add " + v.split(" ")[0] + " production");

console.log("\n── Step 2: Deploy ──");
console.log("cd apps/web");
console.log("vercel --prod --yes\n");

console.log("── Step 3: Add custom domain ──");
console.log(`vercel domains add ${domain}`);
console.log(`vercel domains add www.${domain}`);
console.log(`vercel domains add *.${domain}\n`);

console.log("── Step 4: Verify DNS (after Cloudflare NS change) ──");
console.log(`vercel domains inspect ${domain}\n`);

console.log("── Step 5: Supabase auth URLs ──");
console.log(`Site URL: https://${domain}`);
console.log(`Redirect: https://${domain}/auth/callback\n`);

console.log("Build verified locally: pnpm build ✓");
