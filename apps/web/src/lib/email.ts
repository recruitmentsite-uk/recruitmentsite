import {
  appendEmailLegalFooter,
  buildBrandedEmailHtml,
  EMAIL_FROM,
  type BrandedEmailOptions,
} from "@placeuk/shared";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text?: string;
  /** Full HTML document, or a body fragment if `branded` is set. */
  html?: string;
  /** When set with `html` body fragment (or alone via bodyHtml), builds branded template. */
  branded?: Omit<BrandedEmailOptions, "bodyHtml"> & { bodyHtml?: string };
  from?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const payload: Record<string, string> = {
    from: opts.from ?? EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
  };

  let html = opts.html;
  if (opts.branded) {
    html = buildBrandedEmailHtml({
      ...opts.branded,
      bodyHtml: opts.branded.bodyHtml ?? opts.html ?? "",
    });
  } else if (html && !isFullHtmlDocument(html)) {
    html = buildBrandedEmailHtml({
      title: opts.subject,
      bodyHtml: html,
      hero: "office",
    });
  }

  if (html) {
    payload.html = html;
  }
  if (opts.text) {
    payload.text = appendEmailLegalFooter(opts.text);
  } else if (!html) {
    payload.text = appendEmailLegalFooter("");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

function isFullHtmlDocument(html: string): boolean {
  const head = html.slice(0, 200).toLowerCase();
  return head.includes("<!doctype") || head.includes("<html");
}
