# Automation runbook — Recruitment Site

Goal: **≤ 1 hour/week** of human ops. Everything else runs in **GitHub Actions cloud** (PC off).

## Business departments (cloud)

| Department | Cloud coverage | Schedule |
|------------|----------------|----------|
| **Site** | Deploy on `master` + post-deploy `ops:site-smoke`; daily HTTP health in ops email; manual `site-smoke` | Push + 05:00 daily |
| **Sales** | UK multi-sector prospect grow + scrape; employer outreach ≤50/day | 05:00 + 10:00 daily |
| **Marketing** | Partner feed health; IndexNow + Google Indexing API; candidate digests; marketing hub check | 05:00 / 06:30 / 09:00 |
| **Customer service / email** | IMAP triage (hello/admin/billing/privacy/legal/github/jobs/notifications): mark vendor noise Seen, surface actionable items in daily email. **No auto-replies** (human still replies) | 05:00 daily |
| **Community** | Same as PropOS: **Cursor Automation** (`docs/department-cloud-ops.md`) + `node scripts/community-engage-facebook.mjs` | Daily 08:00 + every 4h |

Workflow: `.github/workflows/automation.yml` — run manually with `department=all`.  
Community cloud departments: **`docs/department-cloud-ops.md`** (Cursor Automations — PropOS pattern).

| UTC schedule | Job | What it does |
|--------------|-----|--------------|
| 05:00 daily | `expand-and-ops` | Sales: CQC expand + UK board discovery (~60 searches) + ingest + scrape 250 emails; marketing feed health; **CS daily report → hello@** |
| 06:00 daily | `sync-jobs` | Adzuna + Reed + ATS boards (90 min timeout) |
| 06:30 daily | `index-seo` | Marketing SEO: IndexNow + Google Indexing API |
| 07:00 daily | `enrich-and-expire` | AI enrich listings + expire old jobs + renew nudges |
| 08:00 + every 4h | Community (Cursor) | Facebook UK groups + inbox — see `docs/department-cloud-ops.md` |
| 09:00 daily | `alert-digests` | Marketing: candidate job-alert emails |
| 10:00 daily | `employer-outreach` | Sales: up to 50 employer emails/day |
| Hourly | `match-candidates` | Product: score applicants vs roles |
| Mon 08:00 | `weekly-metrics` | Metrics + **Monday ≤1hr ops brief → hello@** |

Stripe webhooks stay on the edge runtime. Prod deploys: `.github/workflows/deploy.yml` (+ site smoke).

## Super admin (web)

`/admin` (allowlist `ADMIN_EMAILS`) — platform hub:

- **Overview / Stats** — live employers, jobs, apps, MRR, ticket + social queue counts
- **Tickets** — CS / partner / internal tickets with reply thread (table `support_tickets`)
- **Social CMS** — compose, library, reuse, publish via Meta/LinkedIn APIs (`social_posts`)
- **Moderation** — pending job review

Schema: `supabase/migrations/011_super_admin.sql`. Social tokens: `META_*` / `LINKEDIN_*` env only (never in DB).

**One-time setup**
1. Apply schema: Actions → **Super admin setup** (or paste `011_super_admin.sql` in Supabase SQL editor)
2. `pnpm social:import-stock` (also part of that workflow) loads all `docs/social-posts/stock` packs into the library
3. Add GitHub + Vercel secrets when ready to publish live: `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, `META_IG_USER_ID`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID`
4. Daily CS triage auto-creates tickets; cron `social-publish` at 08:20 UTC publishes due scheduled posts

## Your ≤1 hour/week (Monday)

Triggered by email: **Weekly ops brief** to `hello@` — or skim `/admin`.

1. Skim brief + daily ops emails + [Actions](https://github.com/rbeemehmood-arch/recruitmentsite/actions/workflows/automation.yml) (~10 min)
2. **CS:** reply to any ACTION items listed in daily ops; log in `/admin/tickets` (~15–20 min)
3. Admin: fraud / spam jobs (~10 min)
4. Stripe: refunds or verification docs if waiting (~10 min)
5. Sales/marketing: partner (Indeed/LinkedIn) replies only if flagged; social via `/admin/social` (~10 min)

Do **not** run departments locally unless Actions is red.

## Human-only edge cases (rare)

- Fraud / spam jobs beyond the Monday pass
- Refund requests
- Enterprise inbound / Scale sales calls
- Stripe live verification docs (done — charges/payouts enabled)

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

### Continuous UK prospect growth

The list grows every day beyond England CQC care:

| Step | When | What |
|------|------|------|
| `prospects:expand` | 05:00 UTC | Refresh CQC CSV + guess emails |
| `prospects:competitors` | 05:00 UTC | ~60 Reed/Adzuna searches/day across UK sectors (care, hospitality, trades, retail, logistics, education, office) + Scotland/Wales/NI locations |
| `prospects:ingest` | after competitors | Upsert unmatched board employers as `source: board_discovery` |
| `prospects:scrape` | 05:00 (250) + 10:00 (100) | Scrape websites for real emails |

State is cached in Actions across runs (`employer-prospects.json`, scrape + competitor progress). Local: `pnpm prospects:grow`. Caps: `COMPETITOR_LIMIT`, `SCRAPE_LIMIT`.

---

## Environment checklist

Run `pnpm ops:readiness` before launch. Required:

- [x] Supabase project + schema pushed
- [x] Stripe test products + test webhook live on site
- [x] Stripe live cutover complete (`pk_live`/`sk_live` + live webhook on Vercel)
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
