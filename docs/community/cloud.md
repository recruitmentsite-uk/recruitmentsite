# Community cloud — same as PropOS

Community runs as a **Cursor Automation**, not GitHub-hosted Actions.

Source of truth: [`docs/department-cloud-ops.md`](../department-cloud-ops.md) → section **Community — groups, chats & conversations**.

| | PropOS | Recruitment Site |
|---|--------|------------------|
| Doc | `docs/department-cloud-ops.md` | same |
| Script | `scripts/community-engage-facebook.mjs` | same |
| Triggers | `0 8 * * *` + `0 */4 * * *` | same |
| Log | `docs/community/activity-log.md` | same |
| Targets | `docs/community/targets.md` | same |

## Enable

1. Cursor → **Automations** → New  
2. Copy name / triggers / instructions from `docs/department-cloud-ops.md` (Community block)  
3. Repo: this placeuk repo  

Local: `node scripts/community-engage-facebook.mjs`  
Light: `node scripts/community-engage-facebook.mjs --light`
