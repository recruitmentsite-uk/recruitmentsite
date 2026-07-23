# Revenue model — Recruitment Site

## Target: £15k–£50k MRR (monthly recurring revenue)

Conservative path to **£20k MRR** (~£240k ARR):

| Stream | Price | Volume | MRR |
|--------|-------|--------|-----|
| Starter plans | £99/mo | 80 employers | £7,920 |
| Growth plans | £249/mo | 35 employers | £8,715 |
| Scale plans | £499/mo | 8 employers | £3,992 |
| Featured boosts | £49 avg | 60/mo | £2,940 |
| CV database add-on | £149/mo | 10 recruiters | £1,490 |
| **Total** | | | **~£25k MRR** |

One-off placement fees (15–20% of salary) require humans and don't scale — **avoid as core model**. Offer optional "concierge hire" at £2,500 flat only for Scale tier upsell.

---

## Pricing tiers (employers)

### Starter — £99/month
- 3 active job posts
- Basic company profile
- Applicant inbox + email notifications
- Standard listing (7-day rotation)

### Growth — £249/month *(primary target)*
- **Unlimited job posts**
- AI match scores on every applicant
- Featured slot rotation (1/mo included)
- Branded careers page (`yourco.recruitmentsite.co.uk`)
- Indeed + Google Jobs syndication

### Scale — £499/month
- Everything in Growth
- 3 featured slots/mo
- API / ATS webhook (Greenhouse, Lever)
- Priority support (still async — no phone queue)
- Team seats (5 users)

### Pay-as-you-go (land grab)
- £79 per single job post (30 days) — for employers not ready to subscribe
- Converts to Growth after 2nd purchase via automated email

---

## Candidate side — free (monetise via employers)

Candidates never pay. This is how you compete with Reed/Indeed on supply.

Monetisation levers:
- **Job alerts** — email/SMS drives SEO traffic back
- **Profile completeness nudge** — better profiles = higher employer conversion
- **Premium candidate badge** (future) — £9/mo for verified skills + priority in AI ranking (optional, low priority)

---

## Unit economics (Growth tier)

| Item | Cost/mo | Notes |
|------|---------|-------|
| Supabase Pro | ~£20 shared | Scales to thousands of users |
| Vercel Pro | ~£20 | |
| Resend | ~£0.001/email | 10k emails ≈ £10 |
| OpenAI (matching) | ~£15/employer | ~500 applicants screened |
| Stripe fees | 2.9% + 20p | On £249 ≈ £7.50 |
| **Gross margin** | **~85%** | |

At £25k MRR with 85% margin → **~£21k/mo profit** before any salary.

---

## 12-month milestones

| Month | Focus | MRR target |
|-------|-------|------------|
| 1–2 | Healthcare vertical launch, 20 paying SMEs | £2k |
| 3–4 | SEO job pages ranking, automated outreach | £5k |
| 5–6 | Second vertical (Trades or Tech) | £10k |
| 7–9 | Featured boosts + CV database upsell | £18k |
| 10–12 | Agency white-label pilot (1–2 partners) | £30k+ |

---

## What NOT to do early

1. **Don't hire recruiters** — AI + self-serve employer dashboard
2. **Don't chase enterprise RPO** — 6-month sales cycles, custom integrations
3. **Don't take % placement fees at scale** — legal/compliance overhead, manual invoicing
4. **Don't build a mobile app first** — responsive web + email alerts is enough

---

## Stripe product IDs

Run `pnpm stripe:setup` after configuring `.env` to create products in Stripe test mode.

Products map to `packages/shared/src/pricing.ts`.
