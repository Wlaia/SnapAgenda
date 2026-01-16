-- Add subscription fields to profiles table

-- 1. Subscription Status (trial, active, past_due, cancelled)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';

-- 2. Trial End Date (Defaults to 45 days from creation for new rows, but we need to handle existing)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone DEFAULT (now() + interval '45 days');

-- 3. Admin Flag
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 4. Last Payment Date
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_payment_date date;

-- Comment on columns
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status of the subscription: trial, active, past_due, cancelled';
COMMENT ON COLUMN public.profiles.trial_ends_at IS 'Date when the 45-day free trial ends';
COMMENT ON COLUMN public.profiles.is_admin IS 'Boolean flag to identify system administrators';
