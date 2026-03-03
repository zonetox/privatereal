-- Migration: 20240303000025_add_pending_role.sql
-- Description: Sets default role to 'pending' and adds check constraint.
-- 1. Update the check constraint on role
-- First, we need to find and drop the existing constraint if it has a generated name, 
-- or we can just add a new one and rely on the existing one being replaced if we were to recreate the table.
-- Since it was created inline, we should find its name.
DO $$ BEGIN EXECUTE (
    SELECT 'ALTER TABLE profiles DROP CONSTRAINT ' || quote_ident(conname)
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%role%'
);
EXCEPTION
WHEN OTHERS THEN NULL;
END $$;
-- 2. Add the refined check constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'client', 'pending'));
-- 3. Update the default value for the role column
ALTER TABLE profiles
ALTER COLUMN role
SET DEFAULT 'pending';
-- 4. Modify handle_new_user() trigger function to use 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, email, role)
VALUES (new.id, new.email, 'pending');
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 5. Update any existing 'client' users that were created automatically but shouldn't have been (optional/safety)
-- This might be dangerous if there are real clients, so we'll skip broad updates and focus on the trigger.