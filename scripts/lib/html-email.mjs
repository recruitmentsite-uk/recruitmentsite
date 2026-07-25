/**
 * Node-side helper mirroring @placeuk/shared branded HTML emails (Unsplash heroes).
 * Prefer importing from @placeuk/shared when the package build is available.
 */
import {
  buildBrandedEmailHtml,
  EMAIL_FROM,
  EMAIL_FROM_HELLO,
  appendEmailLegalFooter,
} from "@placeuk/shared";

export { buildBrandedEmailHtml, EMAIL_FROM, EMAIL_FROM_HELLO, appendEmailLegalFooter };

export async function sendHtmlEmail({
  apiKey,
  from = EMAIL_FROM_HELLO,
  to,
  subject,
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  hero = "hiring",
  text,
  replyTo,
  cc,
}) {
  if (!apiKey) {
    console.log(`[dry-run] ${to}: ${subject}`);
    return { ok: true, dryRun: true };
  }

  const html = buildBrandedEmailHtml({
    title: title || subject,
    preheader: subject,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    hero,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://recruitmentsite.co.uk",
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      ...(cc ? { cc: Array.isArray(cc) ? cc : [cc] } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
      text: text ? appendEmailLegalFooter(text) : undefined,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, id: data.id, error: data.message, status: res.status };
}
