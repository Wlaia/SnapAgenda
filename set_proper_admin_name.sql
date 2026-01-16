-- Update the admin profile to have a clear, distinct name
UPDATE public.profiles
SET 
    display_name = 'Wellington Admin',
    salon_name = 'SnapAgenda HQ',
    subscription_status = 'active',
    is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'wellingtonlaialopes@gmail.com');
