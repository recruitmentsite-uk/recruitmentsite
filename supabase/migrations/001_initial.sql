-- Recruitment Site core schema (Supabase Postgres)
-- Run: pnpm db:push (or paste into Supabase SQL editor)

create extension if not exists "uuid-ossp";

-- Employers
create table employers (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  slug text unique not null,
  vertical text not null default 'general',
  plan text not null default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  active_job_limit int not null default 3,
  featured_slots_remaining int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jobs
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references employers(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text not null,
  location text not null,
  city text not null,
  region text not null,
  postcode text,
  remote text not null default 'onsite',
  job_type text not null default 'permanent',
  vertical text not null default 'general',
  salary_min numeric,
  salary_max numeric,
  salary_period text default 'year',
  salary_disclosed boolean not null default true,
  skills text[] default '{}',
  status text not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_status_city_idx on jobs(status, city);
create index jobs_vertical_idx on jobs(vertical) where status = 'active';

-- Candidates (linked to Supabase auth.users)
create table candidates (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  headline text,
  skills text[] default '{}',
  verticals text[] default '{}',
  city text,
  right_to_work_uk boolean default false,
  cv_storage_path text,
  alert_frequency text not null default 'daily',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Applications
create table applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  match_score int,
  status text not null default 'submitted',
  cover_note text,
  submitted_at timestamptz not null default now(),
  unique(job_id, candidate_id)
);

create index applications_job_score_idx on applications(job_id, match_score desc);

-- Job alerts
create table job_alerts (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid references candidates(id) on delete cascade,
  email text not null,
  keywords text,
  city text,
  vertical text,
  frequency text not null default 'daily',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Campaign tracking (employer outreach)
create table campaign_events (
  id uuid primary key default uuid_generate_v4(),
  prospect_email text not null,
  campaign_id text not null,
  event_type text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- RLS (enable in Supabase dashboard)
alter table employers enable row level security;
alter table jobs enable row level security;
alter table candidates enable row level security;
alter table applications enable row level security;

-- Public read for active jobs
create policy "Active jobs are public"
  on jobs for select
  using (status = 'active');

-- Employers manage own jobs (via service role or auth hook — expand when auth wired)
