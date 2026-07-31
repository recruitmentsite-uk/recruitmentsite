-- Talent pool from guest apply + campaign tracking helpers

create table if not exists talent_profiles (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text,
  headline text,
  city text,
  skills text[] not null default '{}',
  verticals text[] not null default '{}',
  right_to_work_uk boolean default false,
  cv_storage_path text,
  source_application_id uuid references applications(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists talent_profiles_city_idx on talent_profiles (city) where active = true;
create index if not exists talent_profiles_active_idx on talent_profiles (active);

alter table talent_profiles enable row level security;

drop policy if exists "CV database members read talent profiles" on talent_profiles;
create policy "CV database members read talent profiles"
  on talent_profiles for select
  using (
    active = true
    and exists (
      select 1
      from employer_users eu
      join employers e on e.id = eu.employer_id
      where eu.user_id = auth.uid()
        and e.cv_database_enabled = true
    )
  );

alter table applications
  add column if not exists right_to_work_uk boolean;

create index if not exists campaign_events_email_type_idx
  on campaign_events (prospect_email, event_type);
