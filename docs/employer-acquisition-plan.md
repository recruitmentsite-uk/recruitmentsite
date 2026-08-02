# Employer acquisition — plan & execution

**Goal:** Paying UK employers (care / SME / hospitality first) — **get HR to list roles on our site**.  
**Primary CTA:** https://recruitmentsite.co.uk/pricing · trial → /onboarding → first job live  
**Offer:** 30-day free trial · flat-fee unlimited posts · AI match · Google Jobs · no agency commission.  
**Month-1 revenue north star:** £10k MRR ≈ **41 Growth** (£249) or **21 Scale** (£499). Cash in month 1 needs annual / PAYG / skip-trial offers (standard trial bills after 30 days).

### Tools → employer listings (use these)

| Tool | How it gets listings |
|------|----------------------|
| `employer-outreach` ≤50/day | Email HR / hiring managers with open roles → `/pricing` |
| Prospect grow (CQC + boards) | Keep 30k+ list filled with real emails |
| Social CMS `/admin/social` | Employer creatives → FB/IG/LI (needs API tokens) |
| `community:engage` | UK employer/SME Facebook groups |
| Stripe trial checkout | Self-serve signup path |
| `/admin` tickets + stats | Never drop warm replies; track MRR |

### This week push

1. Run outreach every weekday (care + SME first).  
2. Re-login Meta/LinkedIn; publish Social CMS queue.  
3. Restart FB employer-group engage (quiet since 29 Jul).  
4. Follow every open/click into `/admin/tickets`.  
5. Offer first 20 warm leads: skip trial — **£99 month 1** → post a role same day.

## Channel mix (this sprint)

| # | Channel | Action | Cadence |
|---|---------|--------|---------|
| 1 | **Email outreach** | `employer-outreach` ≤50/day to CQC + UK board-discovered SMEs | Daily 10:00 UTC + manual boost |
| 2 | **Facebook community** | Join UK employer/SME/HR groups; wall posts + replies (employer copy) | Daily / every 4h light |
| 3 | **Social publish** | Employer posts on FB Page + IG + LinkedIn Company | 2–3×/week |
| 4 | **Backlinks / SEO** | Directory submissions · IndexNow · GSC · compare/hire pages · press kit | Weekly batch |
| 5 | **Partner syndication** | Indeed XML · LinkedIn Limited Listings · GOV.UK Find a Job | Chase human reviews |
| 6 | **Inbound site** | `/for-employers` · `/pricing` · `/compare` · hire guides | Always on |

## Message pillars (rotate — do not hammer salary)

1. Flat fee vs agency commission  
2. Unlimited posts / predictable spend  
3. AI match scores on applicants  
4. Google Jobs syndication from day one  
5. Free candidate apply (more volume)

## Backlink targets (UK + HR tech)

See `docs/backlinks/directory-targets.md`. Priority: startup directories, HR software lists, local business chambers, CQC/care networks, guest posts on SME blogs.

## Success metrics (weekly)

- Employer **signups** (auth / employers with users)  
- **Paid** conversions / MRR  
- Outreach opens/clicks (`campaign_events`)  
- Social → `/pricing` traffic (when analytics wired)  
- New referring domains

## Done this execution pass

- [x] Plan doc (`docs/employer-acquisition-plan.md`)
- [x] Employer social post pack (`docs/social-posts/employer-acquisition.md`)
- [x] Directory / backlink targets (`docs/backlinks/directory-targets.md`)
- [x] Press kit page (`/press`) + footer link (needs deploy)
- [x] Email outreach — **250+ sent** cumulative (latest +50; ~280 suppressed)
- [x] IndexNow / Google Indexing + partner-feed chase emails
- [x] Facebook employer Page post published
- [x] Community engage pass — more UK groups joined + posts/replies (incl. 2026-07-29 light pass)
- [x] Press kit live at `/press` (HTTP 200)
- [x] Instagram employer post published (`@recruitmentsite.uk`)
- [x] LinkedIn Company Page branded + employer posts published (tagline/banner employer-first; daily pack 2026-07-29 on LI/FB/IG)
- [x] Cloud automation `department=all` triggered (run 30474813265)
- [x] Cloud automation `department=all` re-run 2026-08-01 (run 30702593541) — outreach + SEO + metrics + site-smoke green; sync/expand in flight
- [ ] Social stock 2026-08-01 — blocked: Meta/LinkedIn Chrome sessions expired (re-login admin@recruitmentsite.co.uk, then publish)
- [x] Stripe business verification (`charges_enabled` + `payouts_enabled`, live products + webhook)
- [ ] Directory submissions — forms opened again (Hotfrog/Scoot/Brownbook/SaaSHub/TAAFT); finish CAPTCHA/submit in Chrome tabs
- [x] Vercel Analytics wired in `layout.tsx` (deployed via PR #4 — enable Web Analytics in Vercel if not already)
- [x] Deploy `/signup/candidate` — live (HTTP 200); nav CTA + homepage hero links
- [x] LinkedIn company email domain `recruitmentsite.co.uk` added
- [ ] LinkedIn HQ location (Stanmore / HA7 3DS) — Edit Page UI keeps bouncing to dashboard
- [x] YouTube `@RecruitmentSiteUK` — live brand channel on rbee.mehmood@gmail.com (public name brand-only)
