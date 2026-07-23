import { createBrowserClient } from "@supabase/ssr";
import { isUsableEnvValue, isValidHttpUrl } from "@/lib/env";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isUsableEnvValue(url) || !isValidHttpUrl(url) || !isUsableEnvValue(key)) return null;
  return createBrowserClient(url, key);
}

export function isAuthConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return isUsableEnvValue(url) && isValidHttpUrl(url) && isUsableEnvValue(key);
}
