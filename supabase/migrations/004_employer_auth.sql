-- Employer auth, team invites, CV database add-on, storage

alter table employers add column if not exists contact_email text;
alter table employers add column if not exists cv_database_enabled boolean not null default false;
alter table employers add column if not exists cv_database_stripe_sub_id text;

create unique index if not exists employers_stripe_customer_id_idx
  on employers(stripe_customer_id) where stripe_customer_id is not null;

create table if not exists employer_users (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references employers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'recruiter')),
  invited_at timestamptz,
  accepted_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique(employer_id, user_id)
);

create index employer_users_user_idx on employer_users(user_id);

create table if not exists employer_invites (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references employers(id) on delete cascade,
  email text not null,
  role text not null default 'recruiter' check (role in ('admin', 'recruiter')),
  token text unique not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index employer_invites_token_idx on employer_invites(token) where accepted_at is null;

alter table employer_users enable row level security;
alter table employer_invites enable row level security;

-- Employer members can read their employer
create policy "Members read own employer"
  on employers for select
  using (
    id in (select employer_id from employer_users where user_id = auth.uid())
  );

create policy "Members update own employer"
  on employers for update
  using (
    id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Jobs: members manage own employer jobs
create policy "Members read own jobs"
  on jobs for select
  using (
    employer_id in (select employer_id from employer_users where user_id = auth.uid())
  );

create policy "Members insert own jobs"
  on jobs for insert
  with check (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin', 'recruiter')
    )
  );

create policy "Members update own jobs"
  on jobs for update
  using (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin', 'recruiter')
    )
  );

-- Applications: members read applications for their jobs
create policy "Members read applications for own jobs"
  on applications for select
  using (
    job_id in (
      select j.id from jobs j
      join employer_users eu on eu.employer_id = j.employer_id
      where eu.user_id = auth.uid()
    )
  );

create policy "Members update applications for own jobs"
  on applications for update
  using (
    job_id in (
      select j.id from jobs j
      join employer_users eu on eu.employer_id = j.employer_id
      where eu.user_id = auth.uid() and eu.role in ('owner', 'admin', 'recruiter')
    )
  );

-- Employer users membership
create policy "Members read own team"
  on employer_users for select
  using (
    employer_id in (select employer_id from employer_users where user_id = auth.uid())
  );

create policy "Admins manage team"
  on employer_users for insert
  with check (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Invites
create policy "Admins read invites"
  on employer_invites for select
  using (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins create invites"
  on employer_invites for insert
  with check (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- CV database: members with addon can read candidates
create policy "CV database members read candidates"
  on candidates for select
  using (
    exists (
      select 1 from employer_users eu
      join employers e on e.id = eu.employer_id
      where eu.user_id = auth.uid() and e.cv_database_enabled = true
    )
  );

-- Storage bucket for CVs
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

create policy "Anyone can upload CV on apply"
  on storage.objects for insert
  with check (bucket_id = 'cvs');

create policy "Employer members read CVs for their applications"
  on storage.objects for select
  using (
    bucket_id = 'cvs'
    and exists (
      select 1 from applications a
      join jobs j on j.id = a.job_id
      join employer_users eu on eu.employer_id = j.employer_id
      where eu.user_id = auth.uid()
      and a.guest_cv_path = name
    )
  );
