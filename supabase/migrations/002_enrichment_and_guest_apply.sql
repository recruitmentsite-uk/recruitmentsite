-- Recruitment Site schema additions: enrichment, guest applications, RLS improvements

alter table jobs add column if not exists enriched_at timestamptz;
alter table jobs add column if not exists application_count int not null default 0;
alter table jobs add column if not exists compliance jsonb default '{}';

alter table applications add column if not exists match_summary text;
alter table applications add column if not exists guest_email text;
alter table applications add column if not exists guest_name text;
alter table applications add column if not exists guest_cv_path text;

-- Allow guest applications (no auth required for v1 apply flow)
alter table applications alter column candidate_id drop not null;

create index if not exists applications_guest_email_idx on applications(guest_email) where guest_email is not null;

-- Function to increment application count
create or replace function increment_job_application_count()
returns trigger as $$
begin
  update jobs set application_count = application_count + 1 where id = new.job_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_application_insert on applications;
create trigger on_application_insert
  after insert on applications
  for each row execute function increment_job_application_count();

-- Public insert for guest applications (rate-limit at API layer)
create policy "Anyone can apply to active jobs"
  on applications for insert
  with check (
    exists (select 1 from jobs where id = job_id and status = 'active')
  );

-- Public insert for job alerts
alter table job_alerts enable row level security;

create policy "Anyone can create job alerts"
  on job_alerts for insert
  with check (true);

create policy "Public read active jobs with employer name"
  on jobs for select
  using (status = 'active');

-- Expire jobs past valid_through
create or replace function expire_old_jobs()
returns void as $$
begin
  update jobs set status = 'expired', updated_at = now()
  where status = 'active' and expires_at < now();
end;
$$ language plpgsql;
