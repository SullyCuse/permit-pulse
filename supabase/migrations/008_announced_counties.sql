-- Tracks which counties have already been announced in a digest email.
-- Used to detect newly added scrapers and include a "new area" notice.
create table if not exists public.announced_counties (
  county text primary key,
  announced_at timestamptz not null default now()
);
