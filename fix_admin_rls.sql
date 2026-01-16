-- Create a policy to allow Admins to read all profiles
-- First, enable RLS (it should be allowed already, but good to ensure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to see ALL profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Policy: Allow admins to update ALL profiles (to activate/block)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);
