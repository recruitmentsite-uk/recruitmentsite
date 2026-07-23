-- Allow public read of employer company names for job listings (anon join)
create policy "Public read employer company names"
  on employers for select
  using (true);
