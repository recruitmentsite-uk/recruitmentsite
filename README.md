# Recruitment Site — Automated UK Recruitment

AI-first job board and hiring platform built to compete with Reed, Hays, Indeed, and Totaljobs **without a large recruitment ops team**.

## The opportunity

| Segment | Pain | Our angle |
|---------|------|-----------|
| **SME employers** (1–250 staff) | Reed/Hays charge 15–25% placement fees; Indeed PPC gets expensive | Flat monthly subscription + unlimited posts |
| **Candidates** | Keyword search, ghost jobs, spam | Verified employers, AI match scores, salary transparency |
| **Vertical niches** | General boards are noisy | Launch in **Healthcare**, **Trades**, or **Tech** first |

UK recruitment is a **£40bn+ industry**. You don't need to beat Reed nationally on day one — owning a vertical + automating the full funnel is enough for **£500k–£2m ARR** with 2–3 people.

## Revenue model (target: £15k–£50k MRR within 12 months)

See [docs/REVENUE.md](./docs/REVENUE.md) for full breakdown. Summary:

1. **Employer subscriptions** — £99 / £249 / £499 per month (Starter / Growth / Scale)
2. **Featured job boosts** — £29–£79 per listing (7-day premium placement)
3. **CV database access** — £149/mo add-on for recruiters
4. **AI screening credits** — £2 per applicant auto-screened (video/text)
5. **Affiliate syndication** — rev-share when jobs click out to partner boards

**Primary wedge:** unlimited flat-fee hiring for SMEs vs % placement fees from traditional agencies.

## Automation-first architecture

Human involvement should be limited to **moderation edge cases** and **sales for enterprise deals**.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Job sources │────▶│ Sync workers │────▶│ Supabase (jobs) │
│ ATS feeds   │     │ (cron/Inngest)│     │ candidates      │
│ Career pages│     └──────────────┘     └────────┬────────┘
└─────────────┘                                    │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Stripe      │◀───▶│ Next.js web  │◀───▶│ AI matching     │
│ billing     │     │ SEO job pages│     │ screening       │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                           ▼
                    Resend email / SMS alerts
                    Indeed & LinkedIn syndication APIs
```

## Stack

- **Web:** Next.js 15, React, Tailwind (SEO-critical job pages)
- **Backend:** Supabase (auth, Postgres, storage, edge functions) — minimal custom server code
- **Billing:** Stripe subscriptions + one-off boosts
- **Email:** Resend (alerts, digests, employer onboarding)
- **Jobs:** Background workers via `scripts/` + optional Inngest/Trigger.dev
- **AI:** OpenAI for CV parsing, job–candidate matching, screening summaries
- **Shared:** TypeScript types in `@placeuk/shared`

## Quick start

```powershell
cd C:\Users\rbeem\Projects\placeuk
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

Open [http://localhost:3003](http://localhost:3003) (port 3000 is used by BindingSignature).

## Project structure

```
placeuk/
├── apps/web/           Next.js — public job board, employer dashboard, pricing
├── packages/shared/    Types, pricing tiers, UK compliance constants
├── supabase/           Schema migrations
├── scripts/            Automation — job sync, outreach, Stripe setup
└── docs/               Business plan, revenue, automation runbooks
```

## Go-to-market (automated)

1. **Week 1–2:** Launch one vertical (recommend **Healthcare** — NHS locum/agency demand, clear compliance needs)
2. **Week 3–4:** Scrape/enrich employer leads → automated cold email (`scripts/outreach-employer-campaign.mjs`)
3. **Ongoing:** SEO job pages (`/jobs/{slug}`), Google Jobs structured data, Indeed organic feed
4. **Month 2+:** Candidate alert digests drive return traffic; featured boosts upsell

## Compliance (UK)

- GDPR + UK GDPR — consent on applications, 12-month CV retention default
- Equality Act 2010 — no discriminatory filtering in AI prompts
- Right to work — checklist prompts for employers (not legal advice)
- REC / APSCo alignment optional for enterprise sales

## Docs

- [Market research (Q1 2026)](./docs/MARKET_RESEARCH.md)
- [Revenue model](./docs/REVENUE.md)
- [Automation runbook](./docs/AUTOMATION.md)
- [Competitive positioning](./docs/COMPETITIVE.md)

## What's implemented

| Feature | Status |
|---------|--------|
| Public job board (9 sample jobs) | ✅ |
| Healthcare vertical landing page | ✅ |
| Google Jobs JSON-LD schema | ✅ |
| Job apply flow (demo + Supabase) | ✅ |
| Job alert signup | ✅ |
| Employer dashboard + post job form | ✅ |
| Stripe checkout + webhooks | ✅ (needs keys) |
| Privacy + Terms (GDPR) | ✅ |
| Adzuna job sync script | ✅ (needs API key) |
| AI matching + enrichment workers | ✅ (needs OpenAI) |
| Employer outreach automation | ✅ (needs Resend) |
| GitHub Actions cron | ✅ |

## Launch checklist

```powershell
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Fill: Supabase, Stripe, Resend, OpenAI, Adzuna
pnpm ops:readiness
# Paste supabase/migrations/*.sql into Supabase SQL editor
pnpm stripe:setup
pnpm prospects:build
pnpm dev
```

## License

Private — all rights reserved.
