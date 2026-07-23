import { SITE_DOMAIN } from "@placeuk/shared";
import { isUsableEnvValue, isValidHttpUrl } from "@/lib/env";

/** Local dev runs on 3003 — port 3000 is used by BindingSignature */
export const DEV_PORT = 3003;
export const DEFAULT_SITE_URL = `http://localhost:${DEV_PORT}`;
export const PRODUCTION_SITE_URL = `https://${SITE_DOMAIN}`;

/** Resolve public site URL — tolerates masked env pulls and missing Vercel config. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (isUsableEnvValue(raw) && isValidHttpUrl(raw)) {
    return raw.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }
  return DEFAULT_SITE_URL;
}
