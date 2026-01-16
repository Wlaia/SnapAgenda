-- Add birth_date column to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS birth_date date;
