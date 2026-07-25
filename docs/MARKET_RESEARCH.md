# UK Recruitment Market Research — Q1/Q2 2026

Sources: ONS Labour Market Overview (Mar 2026), Get Staffed Q1 2026 Report, Appcast UK Benchmark 2026, Adzuna UK Job Market Report, CIPD Resourcing Survey.

## Market snapshot

| Metric | Value | Implication for Recruitment Site |
|--------|-------|-------------------------|
| UK job openings | ~721,000 (flat since Mar 2025) | Stable inventory opportunity; not shrinking |
| Unemployment | 5.2% | More candidates available — quality filtering matters |
| Jobs with salary shown | 80% | Salary transparency is table stakes; we require it |
| Top application source | Indeed (25%) | Syndicate to Indeed organic + Google Jobs |
| Top hire source (agencies) | Totaljobs (31%) | Long-term syndication target |
| Best conversion boards | Reed, Guardian Jobs | Quality > volume — AI matching is our edge |
| Top vertical by ads | Health & Social Care | Validates healthcare-first launch wedge |

## Competitive landscape

### Tier 1 — Volume players (don't fight on spend)
- **Indeed** — 25% of applications; PPC from ~£1.50/click; free tier limited
- **Totaljobs** — 31% of confirmed hires for agency customers; paid packages
- **Reed** — 12% applications but **higher conversion**; 1 free post/month then ~£100+/listing
- **CV-Library** — 14% applications; free trial traps (auto-converts to paid)

### Tier 2 — Quality / niche
- **LinkedIn** — Professional roles; expensive for SMEs
- **Guardian Jobs** — Higher conversion, public sector / professional
- **Find a Job (GOV.UK)** — Fully free; must syndicate for public sector reach

### Tier 3 — Traditional agencies (our price disruption target)
- **Hays, Michael Page, Adecco, Randstad** — 15–25% of first-year salary per placement
- **Locum agencies (healthcare)** — 20–30% markup on shift rates

## Where Recruitment Site wins

1. **SME unit economics** — £249/mo unlimited vs £5k+ agency fee on a £35k hire
2. **Healthcare vertical** — Chronic shortage, high agency dependency, compliance-aware buyers
3. **AI screening** — Appcast 2026: apply rates highest when application takes <5 minutes; we auto-score so employers skip manual CV sifting
4. **Salary transparency** — 25–30% higher application rates when salary shown (industry benchmarks)
5. **SEO long-tail** — Google Jobs requires individual pages with JobPosting schema; job boards with proper pages beat aggregators on specific searches

## Revenue validation

| Model | Market norm | Recruitment Site |
|-------|-------------|---------|
| Agency placement fee | 15–25% of salary | **None** — flat subscription |
| Reed single listing | ~£100+ | £79 PAYG or unlimited on Growth |
| Indeed sponsored | £1.50–£3.00/click | Organic + Google Jobs first; optional boost £49 |
| CV database access | £200–500/mo (Reed) | £149/mo add-on |
| Adzuna affiliate | £0.10–£0.30/click | Passive on outbound syndicated jobs |

## 2026 hiring behaviour (Appcast, 3.6M clicks analysed)

- CPC and CPA **declining** as candidate pool grows — good time to launch
- **Mobile-first apply** essential — forms must work on phone in <5 min
- **Early-week posting** (Mon–Wed) gets more applies
- **Shorter job titles** convert better
- White-collar roles still expensive to recruit; healthcare/trades have better CPA

## Launch vertical: Healthcare (recommended)

**Why healthcare first:**
- Largest ad volume on UK job boards (Get Staffed data)
- Employers already pay agencies heavily — easy ROI story
- Clear compliance hooks: NMC, HCPC, DBS, CQC, right to work
- NHS Band pay scales are public — salary transparency is natural
- 721k open roles nationally with regional hotspots (NW, Midlands, London)

**Target employers (automated outreach):**
- CQC-registered care homes (11,000+ in England)
- NHS trust subsidiaries and private healthcare groups
- Locum agencies looking for cheaper candidate sourcing

**Target job titles (SEO):**
- Registered Nurse (Band 5/6)
- Care Assistant / Support Worker
- HCA (Healthcare Assistant)
- RMN (Mental Health Nurse)
- Physiotherapist / OT (HCPC)
- GP Practice Nurse

## Syndication priority (free/low cost)

1. **Google Jobs** — JobPosting JSON-LD on every `/jobs/[slug]` page (implemented)
2. **GOV.UK Find a Job** — Free; register as employer feed provider
3. **Indeed organic** — Free tier + XML feed
4. **Adzuna** — Free API for backfill + affiliate revenue on outbound clicks
5. **Reed** — Paid later; use in outreach ("you're on Reed for £100 — try us for £249 unlimited")

## 12-month revenue scenario (healthcare wedge)

| Month | Employers | Avg plan | MRR | Notes |
|-------|-----------|----------|-----|-------|
| 1–2 | 15 | £149 blended | £2.2k | Beta + outreach |
| 3–4 | 35 | £199 | £7k | SEO pages indexing |
| 5–6 | 60 | £219 | £13k | Featured boosts kicking in |
| 7–9 | 90 | £239 | £21k | CV database add-ons |
| 10–12 | 120 | £249 | £30k | Trades vertical launch |

**Year 1 target: £30k MRR (~£360k ARR) at 85% margin = ~£300k gross profit.**

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Chicken-and-egg (no jobs, no candidates) | Seed with Adzuna API backfill + aggressive employer outreach |
| Reed/Indeed brand trust | Niche vertical depth + verified employer badges |
| GDPR / ICO complaint | Privacy policy, consent on apply, 12-month CV retention, easy deletion |
| Ghost jobs | Require salary + employer verification for Growth+ |
| AI bias in screening | Audit prompts; no protected characteristic filtering |

## Action items from research

- [x] Require salary on all posts (already in product)
- [x] JobPosting JSON-LD on job pages
- [x] Register Adzuna API key for job backfill (keys on Vercel + GitHub; run `pnpm jobs:sync` to pull)
- [x] Verify Search Console as rbee.mehmood@gmail.com and submit `https://recruitmentsite.co.uk/sitemap.xml`
- [ ] Register on GOV.UK Find a Job as employer partner
- [ ] Build healthcare prospect list (CQC care homes by region)
- [ ] Mobile-optimised apply flow (<5 min)
