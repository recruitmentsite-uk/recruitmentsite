# Automation runbook — Recruitment Site

Goal: **≤ 1 hour/week** of human ops. Everything else runs in **GitHub Actions cloud** (PC off).

## Cloud departments (zero human)

Workflow: `.github/workflows/automation.yml` — also runnable manually with `department=all`.

| UTC schedule | Department | What it does |
|--------------|------------|--------------|
| 05:00 daily | `expand-and-ops` | Prospects, partner feed health, CS inbox triage, daily report → hello@ |
| 06:00 daily | `sync-jobs` | Adzuna + Reed + ATS boards (90 min timeout) |
| 06:30 daily | `index-seo` | IndexNow (Bing/Yandex) + Google Indexing API |
| 07:00 daily | `enrich-and-expire` | AI enrich listings + expire old jobs + renew nudges |
| 09:00 daily | `alert-digests` | Candidate job-alert emails |
| 10:00 daily | `employer-outreach` | Up to 50 employer sales emails/day |
| Hourly | `match-candidates` | Score applicants vs roles, notify employers |
| Mon 08:00 | `weekly-metrics` | Metrics + **Monday ≤1hr ops brief → hello@** |

Stripe webhooks stay on the edge runtime (payments). Prod deploys use `Deploy Production` on `master` push.

## Your ≤1 hour/week (Monday)

Triggered by email: **Weekly ops brief** to `hello@`.

1. Skim brief + [Actions](https://github.com/rbeemehmood-arch/recruitmentsite/actions/workflows/automation.yml) for red runs (~10 min)
2. Admin: fraud / spam jobs (~10 min)
3. Stripe: refunds or verification docs if waiting (~10–20 min)
4. Partner mail: Indeed / LinkedIn replies in hello@ (~10 min)
5. Optional GSC glance — skip if feeds/IndexNow green (~10 min)

Do **not** run departments locally unless Actions is red.

## Human-only edge cases (rare)

- Fraud / spam jobs beyond the Monday pass
- Refund requests
- Enterprise inbound / Scale sales calls
- Stripe live verification docs (one-time until unlocked)

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
- [x] IndexNow key live (`/{key}.txt`) + daily `ops:indexnow` cron after job sync
- [x] Google service account `gsc-indexing@recruitmentsite-seo.iam.gserviceaccount.com` is GSC Owner on `https://recruitmentsite.co.uk/` + GitHub secret `GOOGLE_SERVICE_ACCOUNT_JSON` (local path `.secrets/gsc-indexing.json`) for Indexing API (`pnpm ops:gsc -- --api`)
- [x] Indeed XML feed live at `https://recruitmentsite.co.uk/feeds/indeed.xml` (~4500+ jobs) — partner/employer registration submitted (2026-07-26); await Indeed ingestion review
- [x] LinkedIn XML feed live at `https://recruitmentsite.co.uk/feeds/linkedin.xml` (241 jobs) — BD email sent to LL-BD@linkedin.com
- [x] Schema migrations 007+008 applied in Supabase SQL editor (alerts, views, talent_profiles)
- [x] Schema migration `009_product_features.sql` applied in Supabase SQL editor (candidate SMS/profile, screening credits, video screening, equality monitoring, Reed provenance)
- [x] Storage bucket `video-screenings` created (private; app falls back to `cvs` if missing)
- [ ] Optional: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` for SMS alerts (`node scripts/setup-twilio.mjs …`)
- [x] `REED_API_KEY` set (Vercel production + GitHub secrets + local credentials)
- [x] Reed inbound sync live (`pnpm jobs:sync` / `pnpm jobs:sync:reed` + daily Actions cron with `REED_API_KEY`) — all vertical keywords × up to 3 pages × 100 results
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
