-- Migration: Update Project Publish Validation
-- Description: Adds min_unit_price to the checklist for publishing a project.
-- Projects must have a minimum unit price set to ensure budget matching works.

CREATE OR REPLACE FUNCTION validate_project_for_publish(p_project_id UUID) RETURNS BOOLEAN AS $$
DECLARE v_project RECORD;
BEGIN
    SELECT 
        legal_score,
        location_score,
        infrastructure_score,
        liquidity_score,
        growth_score,
        risk_score,
        expected_growth_rate,
        holding_period_recommendation,
        analyst_confidence_level,
        min_unit_price
    INTO v_project
    FROM projects
    WHERE id = p_project_id;

    IF v_project.legal_score IS NULL
    OR v_project.location_score IS NULL
    OR v_project.infrastructure_score IS NULL
    OR v_project.liquidity_score IS NULL
    OR v_project.growth_score IS NULL
    OR v_project.risk_score IS NULL
    OR v_project.expected_growth_rate IS NULL
    OR v_project.holding_period_recommendation IS NULL
    OR v_project.analyst_confidence_level IS NULL
    OR v_project.min_unit_price IS NULL THEN 
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
