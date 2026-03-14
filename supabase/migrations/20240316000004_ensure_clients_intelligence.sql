-- Migration: Ensure Client Intelligence Fields
-- Description: Ensures the clients table has all columns required by the PREIO 5-Pillar Matching Engine.
-- This prevents "column not found" errors and enables automated data flow from leads.

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS purchase_goal TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
ADD COLUMN IF NOT EXISTS holding_period TEXT;

COMMENT ON COLUMN public.clients.budget_range IS 'Selected budget bracket (e.g., capital_1_3 or 1_3_billion).';
COMMENT ON COLUMN public.clients.preferred_locations IS 'Array of target areas/districts.';
COMMENT ON COLUMN public.clients.purchase_goal IS 'Principal investment objective (living, investment, rental, etc).';
COMMENT ON COLUMN public.clients.risk_tolerance IS 'Qualitative risk profile (conservative, balanced, aggressive).';
COMMENT ON COLUMN public.clients.holding_period IS 'Target investment duration (years or range).';

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
