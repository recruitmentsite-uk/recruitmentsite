-- Break infinite recursion in employer_users RLS.
-- Policies on employers/jobs that subquery employer_users were re-entering
-- "Members read own team", which itself subqueried employer_users.

create or replace function public.user_employer_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select employer_id from employer_users where user_id = auth.uid();
$$;

revoke all on function public.user_employer_ids() from public;
grant execute on function public.user_employer_ids() to anon, authenticated, service_role;

drop policy if exists "Members read own team" on employer_users;
create policy "Members read own team"
  on employer_users for select
  using (
    user_id = auth.uid()
    or employer_id in (select public.user_employer_ids())
  );

drop policy if exists "Admins manage team" on employer_users;
create policy "Admins manage team"
  on employer_users for insert
  with check (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Rewrite employer/job member policies to use the security-definer helper
-- so SELECT on jobs/employers no longer recurses through employer_users RLS.

drop policy if exists "Members read own employer" on employers;
create policy "Members read own employer"
  on employers for select
  using (id in (select public.user_employer_ids()));

drop policy if exists "Members update own employer" on employers;
create policy "Members update own employer"
  on employers for update
  using (
    id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

drop policy if exists "Members read own jobs" on jobs;
create policy "Members read own jobs"
  on jobs for select
  using (employer_id in (select public.user_employer_ids()));

drop policy if exists "Members insert own jobs" on jobs;
create policy "Members insert own jobs"
  on jobs for insert
  with check (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin', 'recruiter')
    )
  );

drop policy if exists "Members update own jobs" on jobs;
create policy "Members update own jobs"
  on jobs for update
  using (
    employer_id in (
      select employer_id from employer_users
      where user_id = auth.uid() and role in ('owner', 'admin', 'recruiter')
    )
  );
