-- Grant Admin Access to specific user

-- Update the profile associated with the email 'wellingtonlaialopes@gmail.com'
-- Note: This requires the user to exist in auth.users and have a matching entry in public.profiles

UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'wellingtonlaialopes@gmail.com'
);

-- Verify the update (Optional, will return the row if successful)
SELECT * FROM public.profiles 
WHERE is_admin = true;
