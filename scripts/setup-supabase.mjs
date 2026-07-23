#!/usr/bin/env node
/**
 * Prints Supabase project setup steps and validates env after creation.
 * Run after creating a project at https://supabase.com/dashboard
 */
const domain = "recruitmentsite.co.uk";

console.log("Supabase setup for Recruitment Site\n");
console.log(`Domain: ${domain} ONLY — do not reuse another project's URL.\n`);
console.log("1. Organization: Recruitment Site (created)");
console.log("2. Create project named: recruitmentsite");
console.log("   Region: West EU (London) — eu-west-2\n");
console.log("3. Authentication → URL configuration:");
console.log(`   Site URL: https://${domain}`);
console.log(`   Redirect URLs:`);
console.log(`     https://${domain}/auth/callback`);
console.log(`     https://${domain}/**`);
console.log("   Do NOT set placeuk.co.uk or localhost here in production.\n");
console.log("3. Settings → API — copy to apps/web/.env.production.template:");
console.log("   NEXT_PUBLIC_SUPABASE_URL");
console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY");
console.log("   SUPABASE_SERVICE_ROLE_KEY\n");
console.log("4. Push schema:");
console.log("   pnpm db:push\n");
console.log("5. Create admin user:");
console.log(`   Sign up at https://${domain}/signup with admin@${domain}`);
console.log("   Set ADMIN_EMAILS=admin@" + domain + " in production env\n");

const vars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
const ok = vars.filter((v) => process.env[v]).length;
console.log(`Env check: ${ok}/${vars.length} Supabase vars set in current shell`);
