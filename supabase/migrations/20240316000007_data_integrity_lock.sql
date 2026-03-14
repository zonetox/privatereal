-- Migration: Data Integrity SYSTEM LOCK (V1 Final) - REFINED
-- Description: 结构化 key_advantages, 强化发布校验, 重构报表视图.

-- 1. Structuring key_advantages: Convert TEXT to TEXT[]
DO $$ 
BEGIN 
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'key_advantages') = 'text' THEN
        ALTER TABLE public.projects 
        ALTER COLUMN key_advantages TYPE TEXT[] 
        USING CASE 
            WHEN key_advantages IS NULL THEN '{}'::TEXT[]
            WHEN key_advantages ~ '\n' THEN string_to_array(key_advantages, E'\n')
            ELSE ARRAY[key_advantages]
        END;
    END IF;
END $$;

-- 2. Consolidate & Harden Publish Validation
-- First drop to avoid schema/signature conflicts
DROP FUNCTION IF EXISTS public.validate_project_for_publish(UUID);
DROP FUNCTION IF EXISTS validate_project_for_publish(UUID);

CREATE OR REPLACE FUNCTION public.validate_project_for_publish(p_project_id UUID) 
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE 
    v_project RECORD;
BEGIN
    SELECT 
        legal_score,
        location_score,
        infrastructure_score,
        liquidity_score,
        growth_score,
        risk_score,
        analyst_confidence_level,
        min_unit_price,
        holding_period_recommendation
    INTO v_project
    FROM public.projects
    WHERE id = p_project_id;

    IF v_project.legal_score IS NULL
    OR v_project.location_score IS NULL
    OR v_project.infrastructure_score IS NULL
    OR v_project.liquidity_score IS NULL
    OR v_project.growth_score IS NULL
    OR v_project.risk_score IS NULL
    OR v_project.analyst_confidence_level IS NULL
    OR v_project.min_unit_price IS NULL
    OR v_project.holding_period_recommendation IS NULL THEN 
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- 3. Refactor Reporting Views (portfolios -> client_properties)
DROP VIEW IF EXISTS public.v_client_property_portfolio_summary CASCADE;
CREATE OR REPLACE VIEW public.v_client_property_portfolio_summary AS
SELECT 
    c.id as client_id,
    COALESCE(c.full_name, pr.email, 'Client ' || c.id::text) as client_name,
    c.risk_profile,
    COALESCE(SUM(cp.contract_value), 0) as total_budget_allocated,
    COUNT(cp.id) as property_count,
    0::NUMERIC as avg_expected_return, 
    (
        SELECT stage 
        FROM public.client_project_lifecycle 
        WHERE client_id = c.id 
        ORDER BY updated_at DESC 
        LIMIT 1
    ) as advisory_lifecycle_status
FROM public.clients c
LEFT JOIN public.profiles pr ON c.user_id = pr.id
LEFT JOIN public.client_properties cp ON c.id = cp.client_id
GROUP BY c.id, c.full_name, pr.email, c.risk_profile;

-- 4. Cleanup Legacy Assets (Optional, but safe if approved)
-- DROP TABLE IF EXISTS public.portfolios CASCADE; -- Keeping for history if needed, but view is updated.

-- Grant access
GRANT SELECT ON public.v_client_property_portfolio_summary TO authenticated;
GRANT SELECT ON public.v_client_property_portfolio_summary TO service_role;

NOTIFY pgrst, 'reload schema';
