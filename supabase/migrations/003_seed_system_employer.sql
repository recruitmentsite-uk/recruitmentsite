-- System employer for syndicated/affiliate jobs (Adzuna backfill)
insert into employers (id, company_name, slug, vertical, plan, active_job_limit)
values (
  '00000000-0000-0000-0000-000000000001',
  'Syndicated Listings',
  'syndicated',
  'general',
  'starter',
  9999
) on conflict (slug) do nothing;

-- Make employer_id optional for syndicated jobs OR always use system employer
-- Adzuna sync uses system employer id above
