-- Allow users to opt out of emails without losing dashboard access
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_opted_out boolean NOT NULL DEFAULT false;
