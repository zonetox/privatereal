-- Migration: Advisory Fit Engine – NULL Safety
-- Description: Return NULL fit_score and 'Insufficient Data' when any required field is NULL.
DROP FUNCTION IF EXISTS public.calculate_project_fit(UUID, UUID);
CREATE OR REPLACE FUNCTION public.calculate_project_fit(p_client_id UUID, p_project_id UUID) RETURNS TABLE (
        fit_score NUMERIC,
        fit_label TEXT,
        risk_alignment NUMERIC,
        return_alignment NUMERIC,
        horizon_alignment NUMERIC
    ) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE -- Client data
    c_risk_profile TEXT;
c_target_return NUMERIC;
c_horizon_text TEXT;
c_years INT := 5;
c_owner_id UUID;
-- Project data
p_risk_score INT;
p_growth_rate NUMERIC;
p_horizon_rec INT;
-- Calculated scores
v_risk_align NUMERIC;
v_return_align NUMERIC;
v_horizon_align NUMERIC;
v_final_fit NUMERIC;
v_label TEXT;
BEGIN -- 1. Security Check: Admin or Owner
SELECT user_id INTO c_owner_id
FROM public.clients
WHERE id = p_client_id;
IF NOT (
    public.is_admin()
    OR (c_owner_id = auth.uid())
) THEN RAISE EXCEPTION 'Access Denied: You do not have permission to run compatibility analysis for this client.';
END IF;
-- 2. Fetch Client Data
SELECT risk_profile,
    target_annual_return,
    investment_horizon INTO c_risk_profile,
    c_target_return,
    c_horizon_text
FROM public.clients
WHERE id = p_client_id;
-- 3. Fetch Project Data
SELECT risk_score,
    expected_growth_rate,
    holding_period_recommendation INTO p_risk_score,
    p_growth_rate,
    p_horizon_rec
FROM public.projects
WHERE id = p_project_id;
-- 4. NULL Guard: If any required field is missing, return Insufficient Data
IF c_risk_profile IS NULL
OR c_target_return IS NULL
OR c_horizon_text IS NULL
OR p_risk_score IS NULL
OR p_growth_rate IS NULL
OR p_horizon_rec IS NULL THEN fit_score := NULL;
fit_label := 'Insufficient Data';
risk_alignment := NULL;
return_alignment := NULL;
horizon_alignment := NULL;
RETURN NEXT;
RETURN;
END IF;
-- 5. Map investment_horizon to years
CASE
    LOWER(c_horizon_text)
    WHEN 'short_term' THEN c_years := 2;
WHEN 'medium_term' THEN c_years := 5;
WHEN 'long_term' THEN c_years := 10;
ELSE BEGIN c_years := (
    REGEXP_REPLACE(c_horizon_text, '[^0-9]', '', 'g')
)::INT;
EXCEPTION
WHEN OTHERS THEN c_years := 5;
END;
END CASE
;
-- 6. Run Alignment Calculators
v_risk_align := public.internal_risk_alignment(c_risk_profile, p_risk_score);
v_return_align := public.internal_return_alignment(c_target_return, p_growth_rate);
v_horizon_align := public.internal_horizon_alignment(c_years, p_horizon_rec);
-- 7. Combine Overall Score
v_final_fit := ROUND(
    (v_risk_align * 0.4) + (v_return_align * 0.35) + (v_horizon_align * 0.25),
    2
);
-- 8. Map Label
IF v_final_fit >= 80 THEN v_label := 'Highly Suitable';
ELSIF v_final_fit >= 60 THEN v_label := 'Suitable with Consideration';
ELSE v_label := 'Not Recommended';
END IF;
-- 9. Return Result
fit_score := v_final_fit;
fit_label := v_label;
risk_alignment := v_risk_align;
return_alignment := v_return_align;
horizon_alignment := v_horizon_align;
RETURN NEXT;
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';