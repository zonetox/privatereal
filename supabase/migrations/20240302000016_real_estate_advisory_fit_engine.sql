-- Migration: Real Estate Advisory Fit Engine (V2)
-- Description: Implement high-precision matching logic with granular alignment functions and security checks.
-- 1. Risk Alignment Function
CREATE OR REPLACE FUNCTION public.internal_risk_alignment(client_risk TEXT, project_risk INT) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_alignment NUMERIC := 0;
v_diff INT := 0;
BEGIN CASE
    LOWER(client_risk)
    WHEN 'conservative' THEN IF project_risk <= 40 THEN v_alignment := 100;
ELSE v_alignment := GREATEST(0, 100 - (project_risk - 40) * 1.6);
END IF;
WHEN 'balanced' THEN IF project_risk >= 30
AND project_risk <= 70 THEN v_alignment := 100;
ELSIF project_risk < 30 THEN v_alignment := GREATEST(0, 100 - (30 - project_risk) * 1.5);
ELSE v_alignment := GREATEST(0, 100 - (project_risk - 70) * 1.5);
END IF;
WHEN 'aggressive' THEN IF project_risk >= 60 THEN v_alignment := 100;
ELSE v_alignment := GREATEST(0, 100 - (60 - project_risk) * 1.5);
END IF;
ELSE v_alignment := 50;
-- Default fallback
END CASE
;
RETURN ROUND(v_alignment, 2);
END;
$$;
-- 2. Return Alignment Function
CREATE OR REPLACE FUNCTION public.internal_return_alignment(client_target NUMERIC, project_growth NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_diff NUMERIC;
BEGIN v_diff := ABS(
    COALESCE(client_target, 0) - COALESCE(project_growth, 0)
);
IF v_diff <= 2 THEN RETURN 100;
ELSIF v_diff <= 5 THEN RETURN 80;
ELSIF v_diff <= 10 THEN RETURN 60;
ELSE RETURN 30;
END IF;
END;
$$;
-- 3. Horizon Alignment Function
CREATE OR REPLACE FUNCTION public.internal_horizon_alignment(client_years INT, project_years INT) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_diff INT;
BEGIN v_diff := ABS(
    COALESCE(client_years, 0) - COALESCE(project_years, 0)
);
IF v_diff <= 1 THEN RETURN 100;
ELSIF v_diff <= 3 THEN RETURN 70;
ELSE RETURN 40;
END IF;
END;
$$;
-- 4. Main Fit Function (V2)
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
-- Map c_horizon_text to years
CASE
    LOWER(COALESCE(c_horizon_text, ''))
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
-- 3. Fetch Project Data
SELECT risk_score,
    expected_growth_rate,
    holding_period_recommendation INTO p_risk_score,
    p_growth_rate,
    p_horizon_rec
FROM public.projects
WHERE id = p_project_id;
-- 4. Run Alignment Calculators
v_risk_align := public.internal_risk_alignment(c_risk_profile, p_risk_score);
v_return_align := public.internal_return_alignment(c_target_return, p_growth_rate);
v_horizon_align := public.internal_horizon_alignment(c_years, p_horizon_rec);
-- 5. Combine Overall Score
-- (risk_score * 0.4) + (return_score * 0.35) + (horizon_score * 0.25)
v_final_fit := ROUND(
    (v_risk_align * 0.4) + (v_return_align * 0.35) + (v_horizon_align * 0.25),
    2
);
-- 6. Map Label
IF v_final_fit >= 80 THEN v_label := 'Highly Suitable';
ELSIF v_final_fit >= 60 THEN v_label := 'Suitable with Consideration';
ELSE v_label := 'Not Recommended';
END IF;
-- 7. Return Result
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