-- Migration: Project Intelligence Engine Extension
-- Description: Extending projects table with specialized investment metrics.
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS launch_year INT,
    ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (
        property_type IN (
            'apartment',
            'villa',
            'townhouse',
            'land',
            'mixed_use'
        )
    ),
    ADD COLUMN IF NOT EXISTS target_segment TEXT CHECK (
        target_segment IN ('mass', 'mid', 'high_end', 'luxury')
    ),
    ADD COLUMN IF NOT EXISTS avg_rental_yield NUMERIC,
    ADD COLUMN IF NOT EXISTS expected_growth_rate NUMERIC,
    ADD COLUMN IF NOT EXISTS holding_period_recommendation INT,
    ADD COLUMN IF NOT EXISTS downside_risk_percent NUMERIC;
-- Notify PostgREST to reload schema
NOTIFY pgrst,
'reload schema';