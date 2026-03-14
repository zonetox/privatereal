-- =========================================
-- ENHANCED ACTIVITY LOGGING MIGRATION
-- =========================================

-- 1. Add entity_id and metadata for deeper intelligence
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Add Index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_activities_type_created ON public.activities(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_client_created ON public.activities(client_id, created_at DESC);

-- 3. Update RLS to allow clients to log their own events
-- First, drop the old restrictive policy if it exists (usually it was admin-only or very restricted)
DROP POLICY IF EXISTS "Clients can view own activities" ON public.activities;
DROP POLICY IF EXISTS "Admins have full access to activities" ON public.activities;

-- Policy: Admins still have full access
CREATE POLICY "Admins have full access to activities" 
ON public.activities FOR ALL TO authenticated 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Policy: Clients can SELECT their own logs
CREATE POLICY "Clients can view own activities" 
ON public.activities FOR SELECT TO authenticated 
USING (
    client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
);

-- Policy: Clients can INSERT their own logs (Crucial for client-side tracking)
CREATE POLICY "Clients can insert own activities" 
ON public.activities FOR INSERT TO authenticated 
WITH CHECK (
    client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
