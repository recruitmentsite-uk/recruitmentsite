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
| **Marketing** | Live | Daily 09:00 Europe/London | Draft LinkedIn + Instagram from product updates; queue for approval unless told to publish |
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

## Marketing — daily social draft

**Automation name:** Recruitment Site Marketing — daily social draft  
**Trigger:** Cron `0 9 * * *` (display as 09:00 Europe/London)  
**Tools:** web + repo  
**Instructions:**

```
You are Recruitment Site Marketing. Each run:
1. Read packages/shared/src/social.ts and docs/social-media-setup.md for live profile URLs.
2. Scan recent commits / docs on master for shippable product updates (last 24–48h).
3. Write one LinkedIn company post and one Instagram caption into docs/social-posts/YYYY-MM-DD-daily.md.
4. Keep brand voice: UK jobs with salary shown upfront; CTA https://recruitmentsite.co.uk or /pricing.
5. Do NOT publish unless this run was explicitly authorised to publish. Leave status: draft and ping for approval.
6. After a human publishes, update docs/department-cloud-ops.md Published posts table.
```

**Launch pack (authorised & published 27 Jul 2026):** `docs/social-posts/launch.md`

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
