-- Migration: Add Advisory Intake Fields (Phase 9 - Refactor)
-- Description: Adds qualitative fields to the projects table for rich advisory profiling.

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS buyer_suitability TEXT,
ADD COLUMN IF NOT EXISTS not_suitable_for TEXT,
ADD COLUMN IF NOT EXISTS key_advantages TEXT,
ADD COLUMN IF NOT EXISTS key_concerns TEXT,
ADD COLUMN IF NOT EXISTS market_trend_notes TEXT,
ADD COLUMN IF NOT EXISTS construction_status TEXT;

-- Update RLS policies is not needed as they are already set to full access for admins on projects table.

COMMENT ON COLUMN public.projects.buyer_suitability IS 'Description of the ideal client persona for this property.';
COMMENT ON COLUMN public.projects.not_suitable_for IS 'Who should avoid this project (e.g., short-term speculators).';
COMMENT ON COLUMN public.projects.key_advantages IS 'Strategic highlights and unique selling points.';
COMMENT ON COLUMN public.projects.key_concerns IS 'Potential risks or drawbacks noted by the advisor.';
COMMENT ON COLUMN public.projects.market_trend_notes IS 'Local area dynamics and infrastructure impact notes.';
COMMENT ON COLUMN public.projects.construction_status IS 'Visual or descriptive update on project progress.';
