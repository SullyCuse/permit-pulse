create table if not exists county_requests (
  id uuid primary key default gen_random_uuid(),
  county text not null,
  email text,
  created_at timestamptz not null default now()
);

-- View to see demand ranked by request count
create or replace view county_request_summary as
  select
    lower(trim(county)) as county,
    count(*) as requests,
    max(created_at) as last_requested_at
  from county_requests
  group by lower(trim(county))
  order by requests desc;
