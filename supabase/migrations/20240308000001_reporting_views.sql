-- Phase 9F: Real Estate Reporting Layer (Final Fix)

-- 0. Ensure clients table has names to avoid view failures
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;

-- 1. Client Property Portfolio Summary View
DROP VIEW IF EXISTS public.v_client_property_portfolio_summary CASCADE;
CREATE OR REPLACE VIEW v_client_property_portfolio_summary AS
SELECT 
    c.id as client_id,
    COALESCE(c.full_name, pr.email, 'Client ' || c.id::text) as client_name,
    c.risk_profile,
    COALESCE(SUM(p.capital_allocated), 0) as total_budget_allocated,
    COUNT(p.id) filter (where p.id is not null) as property_count,
    COALESCE(AVG(p.expected_irr), 0) as avg_expected_return,
    (
        SELECT stage 
        FROM client_project_lifecycle 
        WHERE client_id = c.id 
        ORDER BY updated_at DESC 
        LIMIT 1
    ) as advisory_lifecycle_status
FROM clients c
LEFT JOIN profiles pr ON c.user_id = pr.id
LEFT JOIN portfolios p ON c.id = p.client_id
GROUP BY c.id, c.full_name, pr.email, c.risk_profile;

-- 2. Market Location Intelligence Snapshot View
DROP VIEW IF EXISTS public.v_market_intelligence_snapshot CASCADE;
CREATE OR REPLACE VIEW v_market_intelligence_snapshot AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.investment_grade as advisory_grade,
    COALESCE(li.location_score, 0) as overall_location_score,
    COALESCE(mi.rental_yield, 0) as avg_rental_return,
    mi.demand_level,
    mi.supply_level as pipeline_risk,
    COALESCE(ri.market_risk, 0) as overall_market_risk,
    p.expected_growth_rate as appreciation_potential
FROM projects p
LEFT JOIN (
    SELECT project_id, 
           (metro_access_score + highway_access_score + infrastructure_pipeline_score) / 3 as location_score
    FROM project_location_intelligence
) li ON p.id = li.project_id
LEFT JOIN project_market_intelligence mi ON p.id = mi.project_id
LEFT JOIN project_risk_intelligence ri ON p.id = ri.project_id
WHERE p.status = 'active';

-- Grant access
GRANT SELECT ON v_client_property_portfolio_summary TO authenticated;
GRANT SELECT ON v_market_intelligence_snapshot TO authenticated;
GRANT SELECT ON v_client_property_portfolio_summary TO service_role;
GRANT SELECT ON v_market_intelligence_snapshot TO service_role;
