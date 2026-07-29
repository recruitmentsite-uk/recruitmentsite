# Backlink & directory targets (UK employers)

Submit Recruitment Site + claim listing. Link to https://recruitmentsite.co.uk or /for-employers / /pricing.  
Status: `todo` · `submitted` · `live` · `rejected`

## Startup / product directories

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| AlternativeTo | https://alternativeto.net/ | todo | Alternatives to Reed / Indeed / Totaljobs |
| SaaSHub | https://www.saashub.com/ | todo | HR / recruiting category |
| BetaList | https://betalist.com/ | todo | Launch listing |
| Product Hunt | https://www.producthunt.com/ | todo | Launch day when ready |
| There's An AI For That | https://theresanaiforthat.com/ | todo | AI matching angle |
| G2 | https://www.g2.com/ | todo | Recruiting software |
| Capterra | https://www.capterra.com/ | todo | UK job board / ATS-adjacent |
| GetApp | https://www.getapp.com/ | todo | Same family as Capterra |

## UK business / local

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| Google Business Profile | https://business.google.com/ | todo | Recruitmentsite.co.uk NAP |
| Bing Places | https://www.bingplaces.com/ | todo | Mirror GBP |
| Yell | https://www.yell.com/ | todo | UK business |
| Thomson Local | https://www.thomsonlocal.com/ | todo | Local SEO |
| Hotfrog UK | https://www.hotfrog.co.uk/ | todo | Free listing |
| Scoot | https://www.scoot.co.uk/ | todo | Free listing |
| Brownbook | https://www.brownbook.net/ | todo | Citation |
| Yelp for Business | https://biz.yelp.co.uk/ | todo | If applicable |

## HR / recruitment niche

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| HRZone | https://www.hrzone.com/ | todo | Guest / directory if any |
| Recruiter.co.uk | https://www.recruiter.co.uk/ | todo | Industry visibility |
| Onrec | https://www.onrec.com/ | todo | Recruitment tech news |
| Startup Britain / local chambers | varies | todo | Regional SME reach |

## Syndication partners (already in flight)

| Partner | Asset | Status |
|---------|-------|--------|
| Indeed | `/feeds/indeed.xml` | submitted — await review |
| LinkedIn Limited Listings | email LL-BD | requested |
| GOV.UK Find a Job | bulk upload | account live / access requested |
| Google Jobs | structured data + IndexNow | daily cron |

## Linkable assets on our site

| Page | Purpose |
|------|---------|
| `/for-employers` | Primary employer landing |
| `/pricing` | Conversion |
| `/compare` + `/compare/[competitor]` | SEO vs Reed/Indeed |
| `/press` | Press kit + boilerplate (backlink bait) |
| `/hire/[role]` | Role guides |

## Weekly ritual

1. Submit 5 directories from the tables above; mark status.  
2. Pitch 1 guest post / podcast (care / SME hiring).  
3. Run `pnpm ops:indexnow` + `pnpm ops:partner-feeds`.  
4. One employer LinkedIn + FB + IG post from `docs/social-posts/`.  
