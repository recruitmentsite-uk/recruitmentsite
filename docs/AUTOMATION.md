# Automation runbook — Recruitment Site

Goal: **< 5 hours/week** of human ops once live.

## Daily (automated — zero human)

| Job | Script / trigger | What it does |
|-----|------------------|--------------|
| Job feed sync | `pnpm jobs:sync` (cron 06:00) | Pull from ATS webhooks, RSS, career page scrapers |
| AI enrichment | `pnpm jobs:enrich` (after sync) | Normalise titles, extract skills, salary bands, location |
| Candidate matching | `pnpm match:run` (hourly) | Score new applicants vs open roles, send alerts |
| Alert digests | Supabase cron / Inngest | Daily "3 jobs for you" emails to candidates |
| Stripe webhooks | Edge function | Activate/suspend employer accounts on payment events |
| Expired jobs | DB cron | Archive posts past 30 days, nudge employer to renew |

## Weekly (automated)

| Job | Script | What it does |
|-----|--------|--------------|
| Employer outreach | `pnpm campaign:employers` | Cold email SMEs in target vertical with open roles on other boards |
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
       ├── Score 40–69 → weekly digest
       └── Score < 40 → polite auto-decline template (optional, Growth+)
```

Prompt templates live in `scripts/prompts/` — keep audit log for bias review.

---

## Employer acquisition automation

`scripts/outreach-employer-campaign.mjs`:

1. Load prospects from `data/employer-prospects.json` (built by `scripts/build-employer-prospects.mjs`)
2. Check if they have jobs on Indeed/Reed (scrape or API)
3. Send personalised email: "You're hiring for X — post free for 30 days on Recruitment Site"
4. Track opens/clicks in Supabase `campaign_events`
5. Auto-suppress on unsubscribe (GDPR)

Target: **200 emails/week** → 2–5% conversion → 4–10 new employers/week.

---

## Environment checklist

Run `pnpm ops:readiness` before launch. Required:

- [x] Supabase project + schema pushed
- [ ] Stripe products created (test → live) — test products done; live onboarding still open
- [x] Resend domain verified (SPF/DKIM)
- [ ] `OPENAI_API_KEY` for matching
- [x] Google Search Console verification support (meta tag + HTML file)
- [x] Google Search Console property verified as rbee.mehmood@gmail.com + sitemap submitted (`sitemap.xml`)
- [ ] Indeed organic feed (optional, post-launch)

---

## Scaling triggers

| Signal | Action |
|--------|--------|
| > 500 applications/day | Move matching to queue (Inngest) |
| > 50k job pages | Add Redis cache for search |
| Support tickets > 10/week | FAQ chatbot + better onboarding emails |
| MRR > £30k | Hire part-time community mod (10h/week) |
