import {
  COMPANY_LEGAL_NAME,
  COMPANY_LEGAL_NOTICE,
  COMPANY_NUMBER,
  COMPANY_REGISTERED_ADDRESS,
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

export function wrapEmailHtml(body: string): string {
  return `${body}${emailLegalFooterHtml()}`;
}

export const STRIPE_INVOICE_FOOTER = COMPANY_LEGAL_NOTICE;

export const STRIPE_PRODUCT_METADATA = {
  trading_name: SITE_NAME,
  legal_entity: COMPANY_LEGAL_NAME,
  company_number: COMPANY_NUMBER,
  registered_address: COMPANY_REGISTERED_ADDRESS,
} as const;
