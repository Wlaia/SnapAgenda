-- 1. Ensure ordinary users can see their own profile
-- Use CREATE OR REPLACE logic by dropping first to avoid "policy exists" errors
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

-- 2. Ensure ordinary users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- 3. Force Admin rights again (just in case)
UPDATE public.profiles
SET is_admin = true, subscription_status = 'active'
WHERE id = (SELECT id FROM auth.users WHERE email = 'wellingtonlaialopes@gmail.com');
