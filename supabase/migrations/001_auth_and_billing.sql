-- Extend users table for auth + billing
alter table public.users
  add column if not exists stripe_customer_id text unique,
  add column if not exists is_active boolean not null default false,
  add column if not exists plan text check (plan in ('basic', 'pro'));

-- Link users.id to Supabase auth users
alter table public.users
  add column if not exists auth_id uuid references auth.users(id) on delete cascade;

create unique index if not exists users_auth_id_idx on public.users(auth_id);

-- RLS on users: each user sees only their own row
alter table public.users enable row level security;

drop policy if exists "users: own row only" on public.users;
create policy "users: own row only" on public.users
  for all using (auth.uid() = auth_id);

-- RLS on watchlists: own rows only, must be active subscriber
alter table public.watchlists enable row level security;

drop policy if exists "watchlists: own rows only" on public.watchlists;
create policy "watchlists: own rows only" on public.watchlists
  for all using (
    user_id = (
      select id from public.users where auth_id = auth.uid() and is_active = true
    )
  );

-- RLS on alert_log: own rows only
alter table public.alert_log enable row level security;

drop policy if exists "alert_log: own rows only" on public.alert_log;
create policy "alert_log: own rows only" on public.alert_log
  for all using (
    user_id = (
      select id from public.users where auth_id = auth.uid()
    )
  );

-- Permits are readable by all active subscribers, not public
alter table public.permits enable row level security;

drop policy if exists "permits: active subscribers read" on public.permits;
create policy "permits: active subscribers read" on public.permits
  for select using (
    exists (
      select 1 from public.users
      where auth_id = auth.uid() and is_active = true
    )
  );

-- Service role bypass (for scraper + webhook)
-- The service role key already bypasses RLS by default in Supabase
