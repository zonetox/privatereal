-- Migration: Project Validation Logic
-- Description: Ensures projects have all required intelligence data before they can be published.
CREATE OR REPLACE FUNCTION validate_project_for_publish(p_project_id UUID) RETURNS BOOLEAN AS $$
DECLARE v_project RECORD;
BEGIN
SELECT legal_score,
    location_score,
    infrastructure_score,
    liquidity_score,
    growth_score,
    risk_score,
    expected_growth_rate,
    holding_period_recommendation,
    analyst_confidence_level INTO v_project
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
OR v_project.analyst_confidence_level IS NULL THEN RETURN FALSE;
END IF;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;