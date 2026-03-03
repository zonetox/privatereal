-- MIGRATION: 20240302000024_setup_admin_user.sql
-- DESCRIPTION: Create the requested admin user and ensure they have the 'admin' role.
-- 1. Create the user in auth.users if they don't exist
-- Note: We use a subquery to get a stable UUID if they already exist, or a new one.
DO $$
DECLARE v_user_id UUID;
v_email TEXT := 'tanloifmc@yahoo.com';
v_pass TEXT := '123456@Loi';
BEGIN -- Check if user already exists
SELECT id INTO v_user_id
FROM auth.users
WHERE email = v_email;
IF v_user_id IS NULL THEN -- Create new user
-- We use crypt to hash the password
INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        v_email,
        extensions.crypt(v_pass, extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
RETURNING id INTO v_user_id;
RAISE NOTICE 'Created new auth user with ID: %',
v_user_id;
ELSE RAISE NOTICE 'User already exists with ID: %',
v_user_id;
END IF;
-- 2. Ensure profile exists and is set to admin
INSERT INTO public.profiles (id, email, role)
VALUES (v_user_id, v_email, 'admin') ON CONFLICT (id) DO
UPDATE
SET role = 'admin',
    email = EXCLUDED.email;
RAISE NOTICE 'Set role to admin for user: %',
v_email;
END $$;