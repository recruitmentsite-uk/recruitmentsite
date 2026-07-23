import { SITE_DOMAIN } from "@placeuk/shared";

/** Local dev runs on 3003 — port 3000 is used by BindingSignature */
export const DEV_PORT = 3003;
export const DEFAULT_SITE_URL = `http://localhost:${DEV_PORT}`;
export const PRODUCTION_SITE_URL = `https://${SITE_DOMAIN}`;

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}
