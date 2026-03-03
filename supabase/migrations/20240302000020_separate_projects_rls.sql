-- Migration: Separate Projects RLS Policies (Admin vs Client)
-- Description: Replace the combined SELECT policy with two distinct policies for clarity and correctness.
-- Drop the combined policy from migration 0018
DROP POLICY IF EXISTS "Clients can view active and visible projects" ON public.projects;
-- Policy 1: Admin has full access (already defined in core schema, ensure it exists)
-- This is already set as FOR ALL in migration 0001, so no change needed for admin.
-- Policy 2: Clients can only SELECT active + visible_to_clients projects
CREATE POLICY "Clients can view published projects" ON public.projects FOR
SELECT TO authenticated USING (
        (NOT public.is_admin())
        AND status = 'active'
        AND visible_to_clients = true
    );
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';