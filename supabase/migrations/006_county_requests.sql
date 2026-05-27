-- Formalizes county_requests table (previously created via county_requests.sql outside migrations)
-- Adds explicit grants required by Supabase breaking change (effective Oct 30 2026 for existing projects)
-- See: https://github.com/orgs/supabase/discussions/45329

create table if not exists public.county_requests (
  id         uuid        primary key default gen_random_uuid(),
  county     text        not null,
  email      text,
  created_at timestamptz not null default now()
);

create or replace view public.county_request_summary as
  select
    lower(trim(county)) as county,
    count(*)            as requests,
    max(created_at)     as last_requested_at
  from public.county_requests
  group by lower(trim(county))
  order by requests desc;

-- RLS: service role only (writes come from API route via admin client)
alter table public.county_requests enable row level security;

-- Explicit grants for service_role (required after Oct 30 2026)
grant select, insert, update, delete on public.county_requests to service_role;
