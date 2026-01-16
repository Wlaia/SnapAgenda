-- 1. Create a secure function to check admin status (Bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 3. Re-create policies using the safe function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING ( public.check_is_admin() );

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE
USING ( public.check_is_admin() );
