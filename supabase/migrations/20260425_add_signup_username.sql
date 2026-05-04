-- Add username column to signup_requests (idempotent)
ALTER TABLE public.signup_requests
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

COMMENT ON COLUMN public.signup_requests.username IS 'Requested username for signup approval';
