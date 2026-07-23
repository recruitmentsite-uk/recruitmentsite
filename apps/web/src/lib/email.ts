import {
  appendEmailLegalFooter,
  EMAIL_FROM,
  wrapEmailHtml,
} from "@placeuk/shared";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const payload: Record<string, string> = {
    from: opts.from ?? EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
  };

  if (opts.html) {
    payload.html = wrapEmailHtml(opts.html);
  } else {
    payload.text = appendEmailLegalFooter(opts.text ?? "");
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
