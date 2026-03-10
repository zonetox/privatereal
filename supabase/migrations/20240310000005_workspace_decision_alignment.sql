-- Migration: Workspace Alignment (Client Decision Tool)
-- Description: Update lifecycle stages and terminology to match the RE Advisory workflow.

-- 1. Update the check constraint for stages
-- We need to drop the old constraint and add a new one.
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'client_project_lifecycle' 
        AND constraint_name = 'client_project_lifecycle_stage_check'
    ) THEN
        ALTER TABLE public.client_project_lifecycle DROP CONSTRAINT client_project_lifecycle_stage_check;
    END IF;
END $$;

ALTER TABLE public.client_project_lifecycle 
ADD CONSTRAINT client_project_lifecycle_stage_check 
CHECK (stage IN ('research', 'site_visit', 'reservation', 'deposit', 'contract', 'payment', 'portfolio'));

-- 2. Data Migration: Rename existing stages to new terminology
UPDATE public.client_project_lifecycle SET stage = 'research' WHERE stage = 'exploring' OR stage = 'Research';
UPDATE public.client_project_lifecycle SET stage = 'contract' WHERE stage = 'spa_signing' OR stage = 'SPA Signing';

-- 3. Update the trigger function to use the new default stage 'research'
CREATE OR REPLACE FUNCTION public.handle_workspace_selection_lifecycle()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.client_project_lifecycle (client_id, project_id, stage)
  VALUES (new.client_id, new.project_id, 'research')
  ON CONFLICT (client_id, project_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 4. Notify PostgREST
NOTIFY pgrst, 'reload schema';
