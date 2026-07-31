-- Candidate enrichment, SMS alerts, screening credits, video screening, equality monitoring, Reed provenance

-- Candidates: richer profile + SMS
alter table candidates
  add column if not exists phone_e164 text,
  add column if not exists sms_enabled boolean not null default false,
  add column if not exists bio text,
  add column if not exists experience_years int,
  add column if not exists linkedin_url text,
  add column if not exists willing_to_relocate boolean not null default false,
  add column if not exists cv_text text;

alter table talent_profiles
  add column if not exists candidate_id uuid references candidates(id) on delete set null,
  add column if not exists phone_e164 text,
  add column if not exists experience_years int,
  add column if not exists bio text;

create index if not exists talent_profiles_candidate_idx on talent_profiles (candidate_id);

-- Job alerts: SMS channel
alter table job_alerts
  add column if not exists phone_e164 text,
  add column if not exists sms_enabled boolean not null default false,
  add column if not exists channel text not null default 'email';

-- Jobs: external feed provenance (Reed / Adzuna)
alter table jobs
  add column if not exists external_source text,
  add column if not exists external_id text;

create unique index if not exists jobs_external_source_id_uidx
  on jobs (external_source, external_id)
  where external_source is not null and external_id is not null;

-- Screening credits
alter table employers
  add column if not exists screening_credits int not null default 0;

create table if not exists screening_credit_ledger (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references employers(id) on delete cascade,
  delta int not null,
  balance_after int not null,
  reason text not null,
  application_id uuid references applications(id) on delete set null,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create index if not exists screening_credit_ledger_employer_idx
  on screening_credit_ledger (employer_id, created_at desc);

alter table screening_credit_ledger enable row level security;

drop policy if exists "Employers read own screening ledger" on screening_credit_ledger;
create policy "Employers read own screening ledger"
  on screening_credit_ledger for select
  using (
    exists (
      select 1 from employer_users eu
      where eu.employer_id = screening_credit_ledger.employer_id
        and eu.user_id = auth.uid()
    )
  );

-- Video screening
create table if not exists video_screenings (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references employers(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  candidate_email text not null,
  candidate_name text,
  invite_token text not null unique,
  prompt text not null default 'Please introduce yourself and explain why you are a good fit for this role (2–3 minutes).',
  status text not null default 'invited',
  video_storage_path text,
  notes text,
  invited_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index if not exists video_screenings_employer_idx on video_screenings (employer_id, invited_at desc);
create index if not exists video_screenings_token_idx on video_screenings (invite_token);

alter table video_screenings enable row level security;

drop policy if exists "Employers manage own video screenings" on video_screenings;
create policy "Employers manage own video screenings"
  on video_screenings for all
  using (
    exists (
      select 1 from employer_users eu
      where eu.employer_id = video_screenings.employer_id
        and eu.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from employer_users eu
      where eu.employer_id = video_screenings.employer_id
        and eu.user_id = auth.uid()
    )
  );

-- Equality monitoring (voluntary, kept separate from hiring review UI)
create table if not exists equality_monitoring_responses (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references employers(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  age_band text,
  gender text,
  ethnicity text,
  disability text,
  sexual_orientation text,
  religion_belief text,
  prefer_not_to_say boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists equality_monitoring_employer_idx
  on equality_monitoring_responses (employer_id, created_at desc);

alter table equality_monitoring_responses enable row level security;

-- No direct row reads for employers — aggregates only via service role / export API
drop policy if exists "No direct equality row access" on equality_monitoring_responses;
create policy "No direct equality row access"
  on equality_monitoring_responses for select
  using (false);

-- Candidates can manage their own profile
drop policy if exists "Candidates manage own profile" on candidates;
create policy "Candidates manage own profile"
  on candidates for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Employers with CV DB read candidates" on candidates;
create policy "Employers with CV DB read candidates"
  on candidates for select
  using (
    exists (
      select 1
      from employer_users eu
      join employers e on e.id = eu.employer_id
      where eu.user_id = auth.uid()
        and e.cv_database_enabled = true
    )
  );
