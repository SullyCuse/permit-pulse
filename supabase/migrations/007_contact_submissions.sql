-- Formalizes contact_submissions table (previously created manually via Supabase dashboard for PR #61)
-- Adds explicit grants required by Supabase breaking change (effective Oct 30 2026 for existing projects)
-- See: https://github.com/orgs/supabase/discussions/45329

create table if not exists public.contact_submissions (
  id         uuid        primary key default gen_random_uuid(),
  type       text        not null check (type in ('county_request', 'issue_report', 'general')),
  message    text        not null,
  email      text,
  name       text,
  created_at timestamptz default now()
);

-- RLS: service role only (writes come from /api/contact via admin client)
alter table public.contact_submissions enable row level security;

-- Explicit grants for service_role (required after Oct 30 2026)
grant select, insert, update, delete on public.contact_submissions to service_role;
