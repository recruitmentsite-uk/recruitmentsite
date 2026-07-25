# Automation runbook — Recruitment Site

Goal: **< 5 hours/week** of human ops once live.

## Daily (automated — zero human)

Runs on **GitHub Actions** (`.github/workflows/automation.yml`) — continues when your PC is off.

| Job | Script / trigger | What it does |
|-----|------------------|--------------|
| Expand prospects + CS + ops report | `05:00 UTC` | Rebuild/enrich employer list, triage inboxes, HTML daily report to hello@ |
| Job feed sync | `pnpm jobs:sync` (06:00) | Adzuna + Reed + Jooble (optional) + Greenhouse/Lever/Workable boards |
| AI enrichment | `pnpm jobs:enrich` (07:00) | Normalise titles, extract skills, salary bands, location |
| Expired jobs | `pnpm jobs:expire` (07:00) | Archive posts past `expires_at`, email employer to renew |
| Alert digests | `pnpm alerts:digest` (09:00) | HTML digests with Unsplash heroes to alert subscribers |
| Employer outreach | `pnpm campaign:employers` (10:00 daily) | Up to 50 HTML + Unsplash sales emails/day |
| Candidate matching | `pnpm match:run` (hourly) | Score new applicants vs open roles, send alerts |
| Partner feed health | `ops:partner-feeds` (05:00, dry) | Verify Indeed/LinkedIn XML feeds stay live |
| Stripe webhooks | Edge function | Activate/suspend employer accounts on payment events |

Outbound emails use branded HTML layouts + curated Unsplash hero images (`buildBrandedEmailHtml`).

## Weekly (automated)

| Job | Script | What it does |
|-----|--------|--------------|
| Employer outreach | `pnpm campaign:employers` (Tue 10:00) | Cold email SMEs; open/click tracked via `/api/t/*`; skips unsubscribed |
| SEO sitemap | Next.js `sitemap.ts` | Regenerate `/jobs/*` URLs for Google |
| Analytics report | `scripts/weekly-metrics.mjs` | Slack/email summary: MRR, applications, top jobs |
| Stale applicant nudge | cron | "Still looking?" re-engagement for candidates |

## Human-only (edge cases)

- **Fraud / spam jobs** — flag queue in admin (expect < 5/week)
- **Refund requests** — Stripe dashboard
- **Enterprise inbound** — optional Cal.com link for Scale tier only

---

## Job ingestion sources (priority order)

1. **Employer self-serve** — dashboard form + CSV bulk upload
2. **ATS webhooks** — Greenhouse, Lever, Workable (Scale tier)
3. **Partner feeds** — Adzuna API (affiliate revenue), Reed API if approved
4. **Career page scrapers** — Playwright scripts for top 500 NHS trusts / care homes (healthcare wedge)

### Adzuna affiliate

Adzuna pays **£0.10–£0.30 per click** on some categories. Syndicate outbound links on jobs you don't have exclusively — passive income while building inventory.

---

## AI automation pipeline

```
Application submitted
       │
       ▼
Parse CV (PDF/DOCX → text) ──▶ Supabase Storage
       │
       ▼
Extract: skills, years exp, certs, right-to-work hints
       │
       ▼
Match score vs job requirements (0–100)
       │
       ├── Score ≥ 70 → instant email to employer "Strong match"
       ├── Score 40–69 → stays in employer dashboard for review
       └── Score < 40 → polite auto-decline email to candidate + status rejected
```

Prompt templates live in `scripts/prompts/` — keep audit log for bias review.

---

## Employer acquisition automation

`scripts/outreach-employer-campaign.mjs`:

1. Load prospects from `data/employer-prospects.json` (built by `scripts/build-employer-prospects.mjs`)
2. Check if they have jobs on Indeed/Reed (scrape or API)
3. Send personalised email: "You're hiring for X — post free for 30 days on Recruitment Site"
4. Track opens/clicks via `/api/t/open` + `/api/t/click` → `campaign_events`
5. Auto-suppress on unsubscribe + already-sent (GDPR)

Target: **200 emails/week** → 2–5% conversion → 4–10 new employers/week.

---

## Environment checklist

Run `pnpm ops:readiness` before launch. Required:

- [x] Supabase project + schema pushed
- [x] Stripe test products + test webhook live on site
- [ ] Stripe live cutover blocked on business verification doc upload (payments/payouts paused) — then reveal `sk_live` / `pk_live`, create live webhook, `node scripts/setup-stripe-live.mjs`, `pnpm stripe:setup`, redeploy
- [x] Resend domain verified (SPF/DKIM)
- [x] `OPENAI_API_KEY` for matching (Vercel + GitHub secrets)
- [x] Google Search Console verification support (meta tag + HTML file)
- [x] Google Search Console property verified as rbee.mehmood@gmail.com + sitemap submitted (`sitemap.xml`)
- [x] Indeed XML feed live at `https://recruitmentsite.co.uk/feeds/indeed.xml` (241 jobs) — submit via Indeed Partner / Employer Console
- [x] LinkedIn XML feed live at `https://recruitmentsite.co.uk/feeds/linkedin.xml` (241 jobs) — BD email sent to LL-BD@linkedin.com
- [x] Schema migrations 007+008 applied in Supabase SQL editor (alerts, views, talent_profiles)
- [x] Schema migration `009_product_features.sql` applied in Supabase SQL editor (candidate SMS/profile, screening credits, video screening, equality monitoring, Reed provenance)
- [x] Storage bucket `video-screenings` created (private; app falls back to `cvs` if missing)
- [ ] Optional: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` for SMS alerts (`node scripts/setup-twilio.mjs …`)
- [x] `REED_API_KEY` set (Vercel production + GitHub secrets + local credentials)
- [x] Reed inbound sync live (`pnpm jobs:sync` + daily Actions cron with `REED_API_KEY`)
- [x] Adzuna volume expanded (multi-query × multi-page per vertical)
- [x] ATS career boards: Greenhouse / Lever / Workable via `scripts/config/ats-boards.json` (no API key)
- [ ] Optional: set `JOOBLE_API_KEY` (`node scripts/setup-jooble.mjs …` — https://jooble.org/api/about)

---

## Scaling triggers

| Signal | Action |
|--------|--------|
| > 500 applications/day | Move matching to queue (Inngest) |
| > 50k job pages | Add Redis cache for search |
| Support tickets > 10/week | FAQ chatbot + better onboarding emails |
| MRR > £30k | Hire part-time community mod (10h/week) |
