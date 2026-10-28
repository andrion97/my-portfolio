-- Substack subscribers captured by the site's Subscribe popup.
-- Run once in Supabase → SQL Editor. Safe to re-run.

create table if not exists public.subscribers (
  id bigint generated always as identity primary key,
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- One row per address, ignoring case. A repeat insert fails with 23505 → the site shows "already on the list".
create unique index if not exists subscribers_email_lower_key on public.subscribers (lower(email));

-- Visitors may add an email and nothing else: no reading, updating or deleting the list.
alter table public.subscribers enable row level security;

revoke all on public.subscribers from anon, authenticated;
grant insert (email) on public.subscribers to anon;

drop policy if exists "Visitors can subscribe" on public.subscribers;
create policy "Visitors can subscribe" on public.subscribers
  for insert to anon
  with check (true);
