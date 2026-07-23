/** Branded Supabase auth email templates for Recruitment Site */

const wrap = (title, body, ctaLabel, ctaUrl = "{{ .ConfirmationURL }}", footer = "If you didn't request this, you can safely ignore this email.") => `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px 16px"><div style="background:#0f766e;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">Recruitment Site</h1></div><div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px"><h2 style="color:#0f172a;margin:0 0 16px;font-size:18px">${title}</h2>${body}${ctaLabel ? `<p style="margin:0 0 24px"><a href="${ctaUrl}" style="background:#0f766e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${ctaLabel}</a></p>` : ""}<p style="color:#64748b;font-size:13px;line-height:1.5;margin:0">${footer}</p></div><p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px;line-height:1.5">Recruitment Site is a trading name of Recruitment Drive Ltd (Company No. 13481215).</p></div>`;

export const templates = {
  "confirm-signup": {
    subject: "Confirm your Recruitment Site account",
    body: wrap(
      "Confirm your email",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">Thanks for signing up. Please confirm your email address to activate your Recruitment Site account.</p>`,
      "Confirm email address",
      "{{ .ConfirmationURL }}",
      "If you didn't create an account, you can safely ignore this email."
    ),
  },
  "magic-link": {
    subject: "Your sign-in link for Recruitment Site",
    body: wrap(
      "Sign in to Recruitment Site",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">Click the button below to sign in to your account. This link expires shortly.</p>`,
      "Sign in",
      "{{ .ConfirmationURL }}"
    ),
  },
  "reset-password": {
    subject: "Reset your Recruitment Site password",
    body: wrap(
      "Reset your password",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">We received a request to reset your password. Click the button below to choose a new one.</p>`,
      "Reset password",
      "{{ .ConfirmationURL }}"
    ),
  },
  "change-email": {
    subject: "Confirm your new email on Recruitment Site",
    body: wrap(
      "Confirm new email address",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">You requested to change the email address on your Recruitment Site account. Confirm the new address below.</p>`,
      "Confirm new email",
      "{{ .ConfirmationURL }}"
    ),
  },
  invite: {
    subject: "You're invited to Recruitment Site",
    body: wrap(
      "You've been invited",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">You've been invited to create an account on Recruitment Site. Accept the invitation to get started.</p>`,
      "Accept invitation",
      "{{ .ConfirmationURL }}"
    ),
  },
  reauthentication: {
    subject: "Verify your identity on Recruitment Site",
    body: wrap(
      "Verify your identity",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">Please verify your identity before continuing with this sensitive action.</p>`,
      "Verify identity",
      "{{ .ConfirmationURL }}"
    ),
  },
  "password-changed": {
    subject: "Your Recruitment Site password was changed",
    body: wrap(
      "Password changed",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">The password for your Recruitment Site account (<strong>{{ .Email }}</strong>) was changed successfully.</p><p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">If you didn't make this change, contact us immediately at <a href="mailto:hello@recruitmentsite.co.uk" style="color:#0f766e">hello@recruitmentsite.co.uk</a>.</p>`,
      null,
      null,
      ""
    ),
  },
  "email-changed": {
    subject: "Your Recruitment Site email was changed",
    body: wrap(
      "Email address changed",
      `<p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">The email address on your Recruitment Site account was changed.</p><p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px">If you didn't make this change, contact us immediately at <a href="mailto:hello@recruitmentsite.co.uk" style="color:#0f766e">hello@recruitmentsite.co.uk</a>.</p>`,
      null,
      null,
      ""
    ),
  },
};
