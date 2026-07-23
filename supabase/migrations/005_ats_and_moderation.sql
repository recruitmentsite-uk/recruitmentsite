-- ATS webhooks, job moderation, employer settings

alter table employers add column if not exists ats_webhook_url text;

-- pending_review jobs hidden from public until admin approves
-- (status values: draft, pending_review, active, paused, expired, filled)

create index if not exists jobs_pending_review_idx
  on jobs(status) where status = 'pending_review';
