/** Twilio SMS helper — no-ops when TWILIO_* env vars are missing. */

export function normalizeUkPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  if (/^\+44\d{9,10}$/.test(digits)) return digits;
  if (/^07\d{9}$/.test(digits)) return `+44${digits.slice(1)}`;
  if (/^447\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

export async function sendSms(to: string, body: string): Promise<{ ok: boolean; dryRun?: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.log(`[sms dry-run] → ${to}: ${body.slice(0, 120)}`);
    return { ok: true, dryRun: true };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: to, From: from, Body: body.slice(0, 1600) });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Twilio error");
    return { ok: false, error: err.slice(0, 200) };
  }
  return { ok: true };
}
