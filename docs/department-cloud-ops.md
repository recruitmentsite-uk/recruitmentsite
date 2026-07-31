# Recruitment Site cloud departments — LIVE

**Status:** Live (28 Jul 2026)  
Social owner: `admin@recruitmentsite.co.uk` · Site: https://recruitmentsite.co.uk  
Public: `hello@recruitmentsite.co.uk`  
LinkedIn: https://www.linkedin.com/company/recruitmentsite-uk/  
Facebook: https://www.facebook.com/profile.php?id=61592529213211  
Instagram: https://www.instagram.com/recruitmentsite.uk/  
YouTube: pending `@RecruitmentSiteUK`  
Support: `hello@recruitmentsite.co.uk`

These **Cursor Automations** (cloud agents) are the operating departments. Create/enable each in Cursor → Automations using the prompts below. Same pattern as PropOS `docs/department-cloud-ops.md`.

| Department | Status | Trigger | Job |
|------------|--------|---------|-----|
| **Marketing** | Live | Daily 09:00 Europe/London | Publish next **stock** pack (Unsplash/Canva-style PNGs in-repo) when authorised; else draft from stock + product updates |
| **Community** | Live | Daily 08:00 + every 4h (`0 8 * * *` / `0 */4 * * *`) | Join UK Facebook groups; engage threads; **own all Messenger / Page chats daily**; log activity |
| **Sales** | Live | Weekdays (via `automation.yml` 10:00 UTC) | Employer outreach ≤50/day |
| **SEO** | Live | Daily (via `automation.yml` 06:30 UTC) | IndexNow + Google Indexing |
| **Site / CS** | Live | Daily (via `automation.yml` 05:00 UTC) | Ops report + inbox triage |

## Shared rules

- Meta/social pages use **admin@recruitmentsite.co.uk** (Alex Reed profile + Recruitment Site UK Page).
- Never post publicly without human approval **unless** the run is Community engagement (authorised below), or the operator has authorised that pack in chat/docs.
- Prefer repo paths: `packages/shared/src/social.ts`, `docs/social-media-setup.md`, `docs/social-posts/`, `docs/community/`.
- Tickets/chats: summarise into a short daily brief; do not auto-close customer issues.

## Voice (Community + Marketing replies)

Sound like a real person on the Recruitment Site team — not a bot, not a press release.

- Short sentences. Contractionsctions are fine. No "As an AI", no "I'd be happy to assist", no emoji walls, no hashtag spam in group replies.
- Lead with the other person's problem (hiring cost, agency fees, apply friction, match quality). Mention Recruitment Site only when it fits; soft CTA to recruitmentsite.co.uk or /pricing.
- Rotate benefits — do **not** keep repeating “salary shown”. Prefer: free apply, flat-fee unlimited posts, no agency commission, AI match scores, Google Jobs syndication.
- Max helpful replies per run (script caps). Never argue politics/religion; never scrape private data; never spam the same pitch into every thread.

---

## Marketing — stock creatives + scheduled publish

**Model:** Build creatives with **Unsplash + Canva-style local render** (or Canva when a human/PC session is available). **Save in-repo.** Cloud Marketing **posts when planned** — no live Canva OAuth and no operator PC required for daily publish.

**Stock location:**
- PNGs: `apps/web/public/brand/social/posts/stock/` (14-day pack from 2026-08-01)
- Queue: `docs/social-posts/stock/QUEUE.md` + `queue.json`
- Rebuild: `node scripts/render-social-stock.mjs`
- Optional Canva polish: `rbee.mehmood@gmail.com` — export over the same filenames

**Automation name:** Recruitment Site Marketing — daily stock publish  
**Trigger:** Cron `0 9 * * *` (display as 09:00 Europe/London)  
**Tools:** web + repo  
**Instructions:**

```
You are Recruitment Site Marketing. Each run:
1. Read docs/social-posts/stock/QUEUE.md and queue.json. Find today's date (Europe/London) or the next queued pack.
2. Open the matching docs/social-posts/stock/YYYY-MM-DD.md for captions + asset paths.
3. Confirm IG + LinkedIn PNGs exist under apps/web/public/brand/social/posts/stock/.
4. Do NOT invent new Canva sessions in cloud. Stock is pre-built. If stock is empty (<3 days left), open a PR note / brief asking a human to run node scripts/render-social-stock.mjs (or polish in Canva) and commit new stock — do not block today's publish if a pack exists.
5. Publish ONLY if this run is authorised for publish (standing authorisation: publish the day's queued stock pack). Platforms: Instagram @recruitmentsite.uk, Facebook Page, LinkedIn company 136674000. Use existing publish helpers when available.
6. If not authorised, leave status queued/draft and summarise the pack for approval.
7. After publish: set that pack status to published in QUEUE.md + the pack md; append docs/department-cloud-ops.md Published posts table.
8. Brand voice: rotate benefits (flat fee, free apply, AI match, Google Jobs, video screens). Soft CTA recruitmentsite.co.uk or /pricing. Never say you are an AI.
```

**Launch pack (authorised & published 27 Jul 2026):** `docs/social-posts/launch.md`  
**Premium pack (published ~2026-07-30):** `apps/web/public/brand/social/posts/2026-07-30-*.png`

---

## Community — groups, chats & conversations

**Automation name:** Recruitment Site Community — groups & daily chats  
**Triggers:**  
- Daily `0 8 * * *` (08:00) — **full chat inbox + group pass**  
- Every 4 hours `0 */4 * * *` — lighter group join/engage  
**Tools:** web + repo + computer use (Meta Chrome profile)  
**Authorised:** Join UK jobs / NHS / recruitment / careers Facebook groups; reply in threads; **handle all Messenger and Page inbox chats daily** as Recruitment Site / Alex Reed; soft CTA to site/pricing.  
**Local runner:** `node scripts/community-engage-facebook.mjs` (supports `--max-joins=12 --max-replies=6 --chats=8`; light: `--light` or `--max-joins=4 --max-replies=2`)  
**Instructions:**

```
You are on the Recruitment Site team (public Page: Recruitment Site UK / IG @recruitmentsite.uk). Never say you are an AI. Write like a helpful colleague.

Daily (and every 4h lighter run):
1. Read docs/community/targets.md, docs/community/activity-log.md, .community-seen-groups.json if present.
2. CHATS FIRST: Open Facebook Messenger + Page inbox. Reply to every unread / unanswered conversation in a natural voice. Qualify gently (jobseeker vs employer). Offer recruitmentsite.co.uk or /pricing. Cap spam: one clear reply per thread unless they ask a follow-up. If Messenger hangs, continue with groups using: node scripts/community-engage-facebook.mjs --skip-chats
3. GROUPS: Search UK Jobs / NHS Jobs / Recruitment UK / careers groups. Join or request to join new ones (aim 8–12 new per heavy run; 3–4 on light). Skip groups already in the activity log / seen list.
4. Engage: up to 6 helpful thread replies per heavy run (2 on light runs). Prefer answering the question over pitching.
5. Log every join / reply / chat to docs/community/activity-log.md with timestamps and URLs. Update docs/community/targets.md.
6. Stop on captcha / rate-limit. Prefer: node scripts/community-engage-facebook.mjs
   Light run: node scripts/community-engage-facebook.mjs --light
7. Escalate angry legal/compliance threats to hello@recruitmentsite.co.uk — do not argue in-thread.
```

**Targets file:** `docs/community/targets.md`  
**Activity log:** `docs/community/activity-log.md`

---

## Published posts

| Date | Platform | Pack | URL / note | Status |
|------|----------|------|------------|--------|
| 2026-07-27 | Facebook | launch | [Recruitment Site UK](https://www.facebook.com/profile.php?id=61592529213211) — launch post + cover/logo | **Published** |
| 2026-07-27 | Instagram | launch | [@recruitmentsite.uk](https://www.instagram.com/recruitmentsite.uk/) — 1 feed post | **Published** |
| 2026-07-27 | LinkedIn | — | [recruitmentsite-uk](https://www.linkedin.com/company/recruitmentsite-uk/) | Page live; launch post optional |
| — | X | — | skipped | Skipped |
| — | YouTube | — | `@RecruitmentSiteUK` | Pending |

Publish helpers: `scripts/publish-launch-social-posts.mjs`, `scripts/finish-facebook-post.mjs`.  
Community helper: `scripts/community-engage-facebook.mjs`.

## Enable in Cursor

1. Cursor → **Automations** → New automation.  
2. Use the name, trigger, and instructions block for each department above (including Community).  
3. Repo scope: this placeuk / recruitmentsite repo · branch `master` (or `main`).  
4. Marketing launch pack is already authorised for publish; Community group joins/replies are authorised; cold mass DMs are not.
