-- Phase: Client Profile Refactor to Real Estate Advisory
-- 1. Update client_preferences with advisory fields
ALTER TABLE public.client_preferences 
ADD COLUMN IF NOT EXISTS purchase_goal TEXT CHECK (purchase_goal IN ('living', 'investment', 'rental')),
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS holding_period TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT;

-- 2. Update client_financials with budget_range
ALTER TABLE public.client_financials
ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- 3. Update calculate_project_fit to support new advisory fields
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
    -- Advisory fields (priority)
    c_purchase_goal TEXT;
    c_holding_period TEXT;
    c_risk_tolerance TEXT;
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

-- 2. Fetch Client Data (Prioritizing new advisory tables)
SELECT 
    COALESCE(pref.risk_tolerance, pref.risk_profile, cli.risk_profile) as risk_p,
    COALESCE(pref.target_annual_return, cli.target_annual_return) as target_r,
    COALESCE(pref.holding_period, pref.investment_horizon, cli.investment_horizon) as horizon_t
INTO c_risk_profile, c_target_return, c_horizon_text
FROM public.clients cli
LEFT JOIN public.client_preferences pref ON cli.id = pref.client_id
WHERE cli.id = p_client_id;

-- Map c_horizon_text to years
CASE
    WHEN LOWER(COALESCE(c_horizon_text, '')) IN ('short_term', 'under_3_years') THEN c_years := 2;
    WHEN LOWER(COALESCE(c_horizon_text, '')) IN ('medium_term', '3_7_years') THEN c_years := 5;
    WHEN LOWER(COALESCE(c_horizon_text, '')) IN ('long_term', '7_years_plus') THEN c_years := 10;
    ELSE BEGIN c_years := (
        REGEXP_REPLACE(c_horizon_text, '[^0-9]', '', 'g')
    )::INT;
    EXCEPTION
        WHEN OTHERS THEN c_years := 5;
    END;
END CASE;

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
NOTIFY pgrst, 'reload schema';
