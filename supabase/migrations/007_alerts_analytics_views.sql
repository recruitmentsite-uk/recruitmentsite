-- Job alert digests, view tracking, application source attribution

alter table job_alerts
  add column if not exists last_sent_at timestamptz;

create index if not exists job_alerts_active_freq_idx
  on job_alerts (active, frequency)
  where active = true;

alter table jobs
  add column if not exists view_count int not null default 0;

alter table applications
  add column if not exists source text;

create table if not exists job_events (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  event_type text not null,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists job_events_job_created_idx
  on job_events (job_id, created_at desc);

create index if not exists job_events_type_created_idx
  on job_events (event_type, created_at desc);

create or replace function increment_job_view(p_job_id uuid, p_source text default null)
returns void as $$
begin
  update jobs
  set view_count = coalesce(view_count, 0) + 1
  where id = p_job_id and status = 'active';

  insert into job_events (job_id, event_type, source)
  values (p_job_id, 'view', p_source);
end;
$$ language plpgsql security definer;
