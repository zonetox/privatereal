-- Migration: Legacy Structure Cleanup (Financial Artifacts)
-- Description: Drop portfolios, simulations, and related legacy objects. Update reporting view to use client_properties.

-- 1. Drop Legacy Tables (Supposed to be unused logic)
DROP TABLE IF EXISTS public.simulations CASCADE;
DROP TABLE IF EXISTS public.portfolios CASCADE;

-- 2. Drop Associated Legacy Functions
DROP FUNCTION IF EXISTS public.internal_calculate_simulation_metrics(NUMERIC, NUMERIC, NUMERIC, INT, NUMERIC, NUMERIC, NUMERIC);
DROP FUNCTION IF EXISTS public.internal_calculate_simulation_metrics(NUMERIC, NUMERIC, NUMERIC, INT, NUMERIC);
DROP FUNCTION IF EXISTS public.handle_simulation_metrics();
DROP FUNCTION IF EXISTS public.calculate_simulation_metrics(UUID);

-- 3. Refactor Reporting View (Source change from portfolios to client_properties)
-- We need to DROP CASCADE because of dependencies, then recreate.
DROP VIEW IF EXISTS public.v_client_property_portfolio_summary CASCADE;

CREATE OR REPLACE VIEW public.v_client_property_portfolio_summary AS
SELECT 
    c.id as client_id,
    COALESCE(c.full_name, pr.email, 'Client ' || c.id::text) as client_name,
    c.risk_profile,
    COALESCE(SUM(cp.contract_value), 0) as total_property_investment,
    COUNT(cp.id) filter (where cp.id is not null) as asset_count,
    COALESCE(AVG(p.avg_rental_yield), 0) as avg_expected_roi,
    (
        SELECT stage 
        FROM client_project_lifecycle 
        WHERE client_id = c.id 
        ORDER BY updated_at DESC 
        LIMIT 1
    ) as portfolio_lifecycle_status
FROM clients c
LEFT JOIN profiles pr ON c.user_id = pr.id
LEFT JOIN client_properties cp ON c.id = cp.client_id
LEFT JOIN projects p ON cp.project_id = p.id
GROUP BY c.id, c.full_name, pr.email, c.risk_profile;

-- 4. Re-grant access for the view
GRANT SELECT ON public.v_client_property_portfolio_summary TO authenticated;
GRANT SELECT ON public.v_client_property_portfolio_summary TO service_role;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
