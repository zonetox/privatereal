-- Migration: Consolidate Intelligence Fields into Projects
-- Description: Moves essential metrics from sub-tables to projects for faster intake and AI optimization.

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS distance_to_cbd NUMERIC,
ADD COLUMN IF NOT EXISTS rental_demand TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS supply_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS avg_rental_yield NUMERIC;

COMMENT ON COLUMN public.projects.distance_to_cbd IS 'Distance to Central Business District in kilometers.';
COMMENT ON COLUMN public.projects.rental_demand IS 'Qualitative demand level: low, medium, high.';
COMMENT ON COLUMN public.projects.supply_level IS 'Area supply index: low, medium, high.';
COMMENT ON COLUMN public.projects.avg_rental_yield IS 'Average annual rental yield percentage.';
