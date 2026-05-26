alter table public.permits
  add column if not exists contractor_name text,
  add column if not exists applicant_name  text;
