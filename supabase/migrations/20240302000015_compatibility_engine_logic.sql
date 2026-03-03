-- Migration: Client-Project Compatibility Engine
-- Description: Implement project matching logic based on risk, return, and horizon alignment.
DROP FUNCTION IF EXISTS public.calculate_project_fit(UUID, UUID);
CREATE OR REPLACE FUNCTION public.calculate_project_fit(p_client_id UUID, p_project_id UUID) RETURNS RECORD LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE -- Client data
    c_risk INT;
c_return NUMERIC;
c_horizon TEXT;
-- Project data
p_risk INT;
p_growth NUMERIC;
p_horizon_rec INT;
-- Alignment scores
risk_score_align NUMERIC := 0;
return_score_align NUMERIC := 0;
horizon_score_align NUMERIC := 0;
v_fit_score INT := 0;
v_fit_label TEXT;
result RECORD;
BEGIN -- 1. Fetch client data
SELECT risk_score,
    target_annual_return,
    investment_horizon INTO c_risk,
    c_return,
    c_horizon
FROM public.clients
WHERE id = p_client_id;
-- 2. Fetch project data
SELECT risk_score,
    expected_growth_rate,
    holding_period_recommendation INTO p_risk,
    p_growth,
    p_horizon_rec
FROM public.projects
WHERE id = p_project_id;
-- Safety checks
IF c_risk IS NULL THEN c_risk := 50;
END IF;
IF c_return IS NULL
OR c_return = 0 THEN c_return := 10;
END IF;
IF p_risk IS NULL THEN p_risk := 50;
END IF;
IF p_growth IS NULL THEN p_growth := 0;
END IF;
-- 3. Risk Alignment (0-100)
-- Lower is better for delta. 100 - delta.
risk_score_align := 100 - LEAST(ABS(c_risk - p_risk), 100);
-- 4. Return Alignment (0-100)
-- If project >= client target: 100.
-- If less, penalize.
IF p_growth >= c_return THEN return_score_align := 100;
ELSE return_score_align := GREATEST(0, 100 - (c_return - p_growth) * 10);
END IF;
-- 5. Horizon Alignment (0-100)
-- Map c_horizon to years (Assuming standard terms if not numeric)
-- This is a simple heuristic mapping
DECLARE c_years INT := 5;
-- default
BEGIN CASE
    LOWER(c_horizon)
    WHEN 'short_term' THEN c_years := 2;
WHEN 'medium_term' THEN c_years := 5;
WHEN 'long_term' THEN c_years := 10;
ELSE -- Try parsing if it's "5 years" or just "5"
BEGIN c_years := (REGEXP_REPLACE(c_horizon, '[^0-9]', '', 'g'))::INT;
EXCEPTION
WHEN OTHERS THEN c_years := 5;
END;
END CASE
;
IF c_years >= COALESCE(p_horizon_rec, 0) THEN horizon_score_align := 100;
ELSE horizon_score_align := GREATEST(
    0,
    100 - (COALESCE(p_horizon_rec, 1) - c_years) * 15
);
END IF;
END;
-- 6. Combine Overall Score (Weighted: 40% Risk, 40% Return, 20% Horizon)
v_fit_score := ROUND(
    (risk_score_align * 0.4) + (return_score_align * 0.4) + (horizon_score_align * 0.2)
);
-- 7. Map to Grade
IF v_fit_score >= 80 THEN v_fit_label := 'Strong Fit';
ELSIF v_fit_score >= 60 THEN v_fit_label := 'Moderate Fit';
ELSE v_fit_label := 'Mismatch';
END IF;
SELECT v_fit_score as fit_score,
    v_fit_label as fit_label INTO result;
RETURN result;
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';