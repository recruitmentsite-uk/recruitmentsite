# Employer acquisition — plan & execution

**Goal:** Paying UK employers (care / SME / hospitality first).  
**Primary CTA:** https://recruitmentsite.co.uk/pricing · trial → /onboarding  
**Offer:** 30-day free trial · flat-fee unlimited posts · AI match · Google Jobs · no agency commission.

## Channel mix (this sprint)

| # | Channel | Action | Cadence |
|---|---------|--------|---------|
| 1 | **Email outreach** | `employer-outreach` ≤50/day to CQC/SME prospects | Daily 10:00 UTC + manual boost |
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
- [x] Email outreach batch — **50 sent** (suppressed now 213; ~14k sendable left)
- [x] IndexNow / SEO workflow triggered
- [ ] Publish FB + IG + LinkedIn employer posts — **attempted; composers failed** (retry: `node scripts/finish-facebook-post.mjs --pack=employer-acquisition` · LinkedIn needs login in Meta Chrome profile)
- [ ] Community engage pass (employer groups) — queued behind publish retry
