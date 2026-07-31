import {
  COMPANY_LEGAL_NAME,
  COMPANY_LEGAL_NOTICE,
  COMPANY_NUMBER,
  COMPANY_REGISTERED_ADDRESS,
  COMPANY_VAT_NUMBER,
  SITE_DOMAIN,
  SITE_NAME,
} from "./constants.js";

export const EMAIL_FROM = `${SITE_NAME} <notifications@${SITE_DOMAIN}>`;
export const EMAIL_FROM_HELLO = `${SITE_NAME} <hello@${SITE_DOMAIN}>`;

export const EMAIL_LEGAL_FOOTER_TEXT = `\n\n---\n${COMPANY_LEGAL_NOTICE}`;

export function emailLegalFooterHtml(): string {
  return `<p style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;line-height:1.5;">${COMPANY_LEGAL_NOTICE}</p>`;
}

export function appendEmailLegalFooter(text: string): string {
  return `${text}${EMAIL_LEGAL_FOOTER_TEXT}`;
}

/** Curated Unsplash images (stable CDN URLs — no API key). */
export const UNSPLASH_HEROES = {
  hiring:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
  healthcare:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  care:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80",
  team:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  office:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  growth:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
} as const;

export type UnsplashHeroTheme = keyof typeof UNSPLASH_HEROES;

export type BrandedEmailOptions = {
  title: string;
  preheader?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  hero?: UnsplashHeroTheme;
  siteUrl?: string;
  footerExtraHtml?: string;
};

/** Full branded HTML email with Unsplash hero image. */
export function buildBrandedEmailHtml(opts: BrandedEmailOptions): string {
  const siteUrl = opts.siteUrl ?? `https://${SITE_DOMAIN}`;
  const heroUrl = UNSPLASH_HEROES[opts.hero ?? "hiring"];
  const preheader = opts.preheader ?? opts.title;
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<p style="margin:28px 0 8px;text-align:center">
          <a href="${opts.ctaUrl}" style="background:#0f766e;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block;font-size:15px">${opts.ctaLabel}</a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
          <tr>
            <td style="background:#0f766e;padding:20px 24px;text-align:center">
              <a href="${siteUrl}" style="color:#ffffff;text-decoration:none;font-size:20px;font-weight:800;letter-spacing:-0.02em">${SITE_NAME}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0;line-height:0">
              <img src="${heroUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a">${escapeHtml(opts.title)}</h1>
              <div style="font-size:15px;line-height:1.6;color:#334155">${opts.bodyHtml}</div>
              ${cta}
              ${opts.footerExtraHtml ?? ""}
              ${emailLegalFooterHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;text-align:center;font-size:12px;color:#94a3b8">
              <a href="${siteUrl}" style="color:#0f766e;text-decoration:none">${SITE_DOMAIN}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @deprecated Prefer buildBrandedEmailHtml for marketing/outbound. */
export function wrapEmailHtml(body: string): string {
  return buildBrandedEmailHtml({
    title: SITE_NAME,
    bodyHtml: body,
    hero: "office",
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const STRIPE_INVOICE_FOOTER = COMPANY_LEGAL_NOTICE;

export const STRIPE_PRODUCT_METADATA = {
  trading_name: SITE_NAME,
  legal_entity: COMPANY_LEGAL_NAME,
  company_number: COMPANY_NUMBER,
  vat_number: COMPANY_VAT_NUMBER,
  registered_address: COMPANY_REGISTERED_ADDRESS,
} as const;
