-- Create admin users manually if they don't exist
-- Note: This script assumes admin users have been created in Supabase Auth manually

-- Update any existing profiles with admin emails to have admin role
UPDATE public.profiles 
SET role = 'admin'
WHERE email IN ('abathwabiz@gmail.com', 'admin@abathwa.com');

-- Function to create admin user profile if they don't exist
-- (This would be used after manually creating the user in Supabase Auth)
CREATE OR REPLACE FUNCTION public.ensure_admin_profile(
    user_id UUID,
    user_email TEXT,
    first_name TEXT DEFAULT NULL,
    last_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        tokens,
        created_at,
        updated_at
    )
    VALUES (
        user_id,
        user_email,
        first_name,
        last_name,
        'admin',
        50, -- More tokens for admin
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;