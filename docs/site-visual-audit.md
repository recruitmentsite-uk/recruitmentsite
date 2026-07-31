# Site visual audit — Unsplash + Canva

**Date:** 2026-07-31 (refresh)  
**Goal:** Modern marketing chrome; diversify Unsplash; brand “how it works” graphic.

## Done this pass

| Area | Change |
|------|--------|
| Fonts | Fraunces + Plus Jakarta via `next/font` in `layout.tsx` |
| Header | Guides + Pricing; single primary CTA (Post a job) |
| Footer | Handshake Unsplash band + brand line + contact mailto |
| Pricing | `/brand/how-it-works.png` + step grid (no slate cards) |
| For employers | Workshop hero; how-it-works embed; border-t stats |
| About | Team hero; interview mid-photo |
| Blog | Checklist hero; title-on-cover article heroes |
| Home employer CTA | Handshake Unsplash full-bleed |
| Careers | Rotating Unsplash by employer slug |
| City jobs | `commute` instead of London skyline |
| How-it-works asset | `scripts/render-how-it-works.mjs` → `public/brand/how-it-works.png` |

## Hero photography map

| Page | Image |
|------|--------|
| Home | `hero.hiring` |
| Jobs | `hero.commute` |
| Pricing | `sections.meeting` |
| For employers | `hero.workshop` |
| About | `hero.team` |
| Blog index | `sections.checklist` |
| Auth login | `hero.hiring` |
| Employer signup | `sections.meeting` |
| Candidate signup | `hero.commute` |

## Canva backlog (`rbee.mehmood@gmail.com`)

1. ~~How it works~~ — shipped as brand PNG
2. ~~Transparent header over heroes~~ — `Header` light/dark by `[data-hero]` scroll
3. Optional: per-employer careers banner template in Canva
4. Keep social pack in `docs/social-posts/CREATIVE-SYSTEM.md` (Unsplash first)

## Credits

Footer: “Photos via Unsplash.” Local cache: `apps/web/public/brand/social/unsplash/CREDITS.txt`.
