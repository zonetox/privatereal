-- MIGRATION: 20240302000023_allow_public_lead_insert.sql
-- DESCRIPTION: Allow anonymous and authenticated users to insert rows into the leads table.
-- This is necessary for the public Lead Assessment Form (Survey) to function.
-- 1. Enable INSERT for public/authenticated users
-- We use WITH CHECK (true) because we want to allow any valid lead submission
CREATE POLICY "Allow public lead submission" ON public.leads FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- 2. Ensure only admins can VIEW or MODIFY existing leads
-- (This is already covered by the "Admins have full access to leads" policy, 
-- but we make it explicit that non-admins cannot SELECT)
-- Note: No action needed as by default RLS blocks SELECT if no policy matches.