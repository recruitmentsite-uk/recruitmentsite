-- Super admin: support tickets + social marketing CMS
-- Access is app-layer (ADMIN_EMAILS + service role). RLS on; no public policies.

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  body text not null default '',
  status text not null default 'open'
    check (status in ('open', 'pending', 'resolved', 'closed')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  channel text not null default 'manual'
    check (channel in ('email', 'manual', 'social', 'internal', 'partner')),
  requester_email text,
  requester_name text,
  assignee_email text,
  mailbox text,
  external_ref text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists support_tickets_status_idx
  on support_tickets (status, priority, created_at desc);
create index if not exists support_tickets_requester_idx
  on support_tickets (requester_email);

create table if not exists support_ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  author_email text,
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists support_ticket_messages_ticket_idx
  on support_ticket_messages (ticket_id, created_at);

create table if not exists social_accounts (
  id uuid primary key default uuid_generate_v4(),
  platform text not null unique
    check (platform in ('facebook', 'instagram', 'linkedin', 'x', 'youtube')),
  label text not null,
  handle text,
  profile_url text,
  external_page_id text,
  enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists social_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null default '',
  captions jsonb not null default '{}'::jsonb,
  image_url text,
  link_url text,
  platforms text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'queued', 'scheduled', 'publishing', 'published', 'failed', 'archived')),
  scheduled_for timestamptz,
  published_at timestamptz,
  tags text[] not null default '{}',
  source text not null default 'manual',
  created_by text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_posts_status_idx
  on social_posts (status, scheduled_for, created_at desc);
create index if not exists social_posts_tags_idx on social_posts using gin (tags);

create table if not exists social_post_publishes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references social_posts(id) on delete cascade,
  platform text not null
    check (platform in ('facebook', 'instagram', 'linkedin', 'x', 'youtube')),
  status text not null default 'pending'
    check (status in ('pending', 'published', 'failed', 'skipped')),
  external_id text,
  external_url text,
  error text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (post_id, platform)
);

create index if not exists social_post_publishes_post_idx
  on social_post_publishes (post_id);

alter table support_tickets enable row level security;
alter table support_ticket_messages enable row level security;
alter table social_accounts enable row level security;
alter table social_posts enable row level security;
alter table social_post_publishes enable row level security;

-- Seed default social accounts (tokens live in env, not DB)
insert into social_accounts (platform, label, handle, profile_url, external_page_id)
values
  ('facebook', 'Facebook Page', 'recruitmentsiteuk', 'https://www.facebook.com/profile.php?id=61592529213211', '61592529213211'),
  ('instagram', 'Instagram', 'recruitmentsite.uk', 'https://www.instagram.com/recruitmentsite.uk/', null),
  ('linkedin', 'LinkedIn Company', 'recruitmentsite-uk', 'https://www.linkedin.com/company/recruitmentsite-uk/', null),
  ('x', 'X / Twitter', 'RecruitSiteUK', null, null),
  ('youtube', 'YouTube', 'RecruitmentSiteUK', 'https://www.youtube.com/@RecruitmentSiteUK', null)
on conflict (platform) do nothing;

-- Seed library post from 2026-08-01 stock pack
insert into social_posts (
  title, body, captions, image_url, link_url, platforms, status, tags, source
)
select
  'Flat-fee hiring — no placement cut',
  'UK employers: stop paying a percentage of salary every time you hire.

Recruitment Site — flat-fee posting, AI match scores, Google Jobs syndication. No agency commission.

→ https://recruitmentsite.co.uk/pricing',
  jsonb_build_object(
    'instagram', 'Agency fees quietly eat hiring budgets.

Recruitment Site is flat-fee UK hiring — post roles, get AI-scored applicants, hire without a placement cut.

recruitmentsite.co.uk/pricing',
    'facebook', 'UK employers: stop paying a percentage of salary every time you hire.

Recruitment Site — flat-fee posting, AI match scores, Google Jobs syndication. No agency commission.

→ recruitmentsite.co.uk/pricing',
    'linkedin', 'UK employers: stop paying a percentage of salary every time you hire.

Recruitment Site — flat-fee posting, AI match scores, Google Jobs syndication. No agency commission.

→ recruitmentsite.co.uk/pricing'
  ),
  '/brand/social/posts/stock/2026-08-01-linkedin.png',
  'https://recruitmentsite.co.uk/pricing',
  array['facebook', 'instagram', 'linkedin'],
  'queued',
  array['employer', 'pricing', 'stock'],
  'stock'
where not exists (
  select 1 from social_posts where title = 'Flat-fee hiring — no placement cut' and source = 'stock'
);
