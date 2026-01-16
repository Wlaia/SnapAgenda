-- Add address column to clients table if it doesn't exist
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS address text;
