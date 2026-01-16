-- Add commission_rate column to professionals table
ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2);

-- Comment on column
COMMENT ON COLUMN public.professionals.commission_rate IS 'Percentage of commission for the professional (0-100)';
