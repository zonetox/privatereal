-- Migration: Project Intake Governance Layer
-- Description: Add editorial control columns and update RLS for client visibility control.
-- 1. Safely add governance columns
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS evaluation_notes TEXT,
    ADD COLUMN IF NOT EXISTS legal_notes TEXT,
    ADD COLUMN IF NOT EXISTS risk_notes TEXT,
    ADD COLUMN IF NOT EXISTS analyst_confidence_level INT,
    ADD COLUMN IF NOT EXISTS visible_to_clients BOOLEAN DEFAULT false;
-- Add CHECK constraints separately to handle IF NOT EXISTS gracefully
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_status_check'
        AND conrelid = 'public.projects'::regclass
) THEN
ALTER TABLE public.projects
ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'active', 'archived'));
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_confidence_level_check'
        AND conrelid = 'public.projects'::regclass
) THEN
ALTER TABLE public.projects
ADD CONSTRAINT projects_confidence_level_check CHECK (
        analyst_confidence_level BETWEEN 0 AND 100
    );
END IF;
END $$;
-- 2. Update RLS: Drop the existing broad client SELECT policy
DROP POLICY IF EXISTS "Clients can view all projects" ON public.projects;
-- 3. New restricted client policy: Only active + visible projects
CREATE POLICY "Clients can view active and visible projects" ON public.projects FOR
SELECT TO authenticated USING (
        public.is_admin()
        OR (
            status = 'active'
            AND visible_to_clients = true
        )
    );
-- 4. Add index for efficient client queries
CREATE INDEX IF NOT EXISTS idx_projects_status_visibility ON public.projects (status, visible_to_clients);
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';