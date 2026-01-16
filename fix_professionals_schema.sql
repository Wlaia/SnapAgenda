-- Fix Professionals Table Schema Mismatch

-- 1. Add 'specialties' column as an array of text (matches frontend code)
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS specialties text[];

-- 2. Migrate data from old 'specialty' column (if it exists) to new 'specialties' array
-- We treat commas as separators if there's existing data
UPDATE public.professionals
SET specialties = string_to_array(specialty, ',')
WHERE specialty IS NOT NULL AND specialties IS NULL;

-- 3. Drop the old 'specialty' column
ALTER TABLE public.professionals
DROP COLUMN IF EXISTS specialty;

-- 4. Ensure commission_rate exists (just in case)
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2);
