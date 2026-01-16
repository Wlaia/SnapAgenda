-- Diagnostic Script to check what belongs to Wellington
SELECT 
    au.email,
    au.id as auth_id,
    p.id as profile_id,
    p.display_name, 
    p.salon_name,
    p.is_admin
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
WHERE au.email = 'wellingtonlaialopes@gmail.com';

-- Also check if there is a 'Debora' in the profiles
SELECT * FROM public.profiles WHERE display_name ILIKE '%Debora%' OR salon_name ILIKE '%Debora%';
