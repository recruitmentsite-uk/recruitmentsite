/** Supabase dashboard template slugs + branded content for browser/API apply. */
import { templates } from "./supabase-email-templates.mjs";

export const templateRoutes = [
  { slug: "confirm-sign-up", key: "confirm-signup" },
  { slug: "magic-link-or-otp", key: "magic-link" },
  { slug: "reset-password", key: "reset-password" },
  { slug: "change-email-address", key: "change-email" },
  { slug: "invite-user", key: "invite" },
  { slug: "reauthentication", key: "reauthentication" },
  { slug: "password-changed", key: "password-changed" },
  { slug: "email-address-changed", key: "email-changed" },
].map(({ slug, key }) => ({
  slug,
  subject: templates[key].subject,
  body: templates[key].body,
}));
