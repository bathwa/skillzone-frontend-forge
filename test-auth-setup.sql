-- Test Authentication Setup Script
-- Run this in Supabase SQL Editor to verify auth system

-- 1. Check if trigger function exists and is correct
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';

-- 2. Check if trigger exists
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- 3. Check existing profiles and their roles
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    tokens,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if admin users exist
SELECT 
    id,
    email,
    role,
    created_at
FROM public.profiles 
WHERE email IN ('abathwabiz@gmail.com', 'admin@abathwa.com');

-- 5. Test the admin profile creation function
-- (Uncomment and modify with actual admin user ID if needed)
-- SELECT public.ensure_admin_profile(
--     'your-admin-user-uuid'::UUID,
--     'admin@abathwa.com',
--     'Admin',
--     'User'
-- );