-- Phase: Matching Engine Refocus (Real Estate Fit Score)
-- 1. Update projects table with suitability fields
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS min_unit_price NUMERIC,
ADD COLUMN IF NOT EXISTS primary_purpose TEXT CHECK (primary_purpose IN ('living', 'investment', 'rental'));

-- 2. Budget Alignment Function
CREATE OR REPLACE FUNCTION public.internal_budget_alignment(client_range TEXT, project_price NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    v_min NUMERIC := 0;
    v_max NUMERIC := 999999999;
BEGIN 
    IF project_price IS NULL OR client_range IS NULL THEN RETURN 50; END IF;
    
    CASE client_range
        WHEN '1_3_billion' THEN v_min := 1000000000; v_max := 3000000000;
        WHEN '3_5_billion' THEN v_min := 3000000000; v_max := 5000000000;
        WHEN '5_10_billion' THEN v_min := 5000000000; v_max := 10000000000;
        WHEN '10_20_billion' THEN v_min := 10000000000; v_max := 20000000000;
        WHEN '20_billion_plus' THEN v_min := 20000000000; v_max := 999999999999;
        ELSE RETURN 50;
    END CASE;

    IF project_price >= v_min AND project_price <= v_max THEN 
        RETURN 100;
    ELSIF project_price < v_min THEN
        -- Price is lower than budget, which is generally good (high suitability)
        RETURN GREATEST(70, 100 - (v_min - project_price) / v_min * 50);
    ELSE
        -- Price is higher than budget, penalize heavily
        RETURN LEAST(60, GREATEST(0, 100 - (project_price - v_max) / v_max * 100));
    END IF;
END;
$$;

-- 3. Location Alignment Function
CREATE OR REPLACE FUNCTION public.internal_location_alignment(client_locs TEXT[], project_loc TEXT) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    v_loc TEXT;
    v_match_count INT := 0;
BEGIN 
    IF client_locs IS NULL OR array_length(client_locs, 1) IS NULL OR project_loc IS NULL THEN 
        RETURN 50; 
    END IF;

    FOREACH v_loc IN ARRAY client_locs LOOP
        IF project_loc ILIKE '%' || v_loc || '%' THEN
            v_match_count := v_match_count + 1;
        END IF;
    END LOOP;

    IF v_match_count > 0 THEN RETURN 100; ELSE RETURN 30; END IF;
END;
$$;

-- 4. Goal Alignment Function
CREATE OR REPLACE FUNCTION public.internal_goal_alignment(client_goal TEXT, project_purpose TEXT) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN 
    IF client_goal IS NULL OR project_purpose IS NULL THEN RETURN 50; END IF;
    IF client_goal = project_purpose THEN RETURN 100;
    ELSIF (client_goal = 'investment' AND project_purpose = 'rental') OR (client_goal = 'rental' AND project_purpose = 'investment') THEN
        RETURN 80;
    ELSE 
        RETURN 40;
    END IF;
END;
$$;

-- 5. Final Revised Matching Engine RPC
DROP FUNCTION IF EXISTS public.calculate_project_fit(UUID, UUID);
CREATE OR REPLACE FUNCTION public.calculate_project_fit(p_client_id UUID, p_project_id UUID) RETURNS TABLE (
        fit_score NUMERIC,
        fit_label TEXT,
        budget_alignment NUMERIC,
        location_alignment NUMERIC,
        goal_alignment NUMERIC,
        risk_alignment NUMERIC,
        horizon_alignment NUMERIC
    ) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE 
    -- Client data
    c_budget_range TEXT;
    c_pref_locs TEXT[];
    c_purchase_goal TEXT;
    c_risk_tolerance TEXT;
    c_holding_period TEXT;
    -- Project data
    p_min_price NUMERIC;
    p_location TEXT;
    p_purpose TEXT;
    p_risk_score INT;
    p_horizon_rec INT;
    -- Internal alignments
    v_budget_align NUMERIC;
    v_loc_align NUMERIC;
    v_goal_align NUMERIC;
    v_risk_align NUMERIC;
    v_horizon_align NUMERIC;
    -- Results
    v_final_fit NUMERIC;
    v_label TEXT;
    v_owner_id UUID;
BEGIN 
    -- 1. Security Check
    SELECT user_id INTO v_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (v_owner_id = auth.uid())) THEN 
        RAISE EXCEPTION 'Access Denied';
    END IF;

    -- 2. Fetch Client Advisory Data
    SELECT 
        fin.budget_range,
        pref.preferred_locations,
        pref.purchase_goal,
        COALESCE(pref.risk_tolerance, cli.risk_profile),
        COALESCE(pref.holding_period, cli.investment_horizon)
    INTO 
        c_budget_range, c_pref_locs, c_purchase_goal, c_risk_tolerance, c_holding_period
    FROM public.clients cli
    LEFT JOIN public.client_financials fin ON cli.id = fin.client_id
    LEFT JOIN public.client_preferences pref ON cli.id = pref.client_id
    WHERE cli.id = p_client_id;

    -- 3. Fetch Project Suitability Data
    SELECT 
        min_unit_price, location, primary_purpose, risk_score, holding_period_recommendation
    INTO 
        p_min_price, p_location, p_purpose, p_risk_score, p_horizon_rec
    FROM public.projects
    WHERE id = p_project_id;

    -- 4. Calculate Alignments
    v_budget_align := public.internal_budget_alignment(c_budget_range, p_min_price);
    v_loc_align := public.internal_location_alignment(c_pref_locs, p_location);
    v_goal_align := public.internal_goal_alignment(c_purchase_goal, p_purpose);
    v_risk_align := public.internal_risk_alignment(c_risk_tolerance, p_risk_score);
    
    -- Map holding period text to years for alignment
    DECLARE 
        c_years INT := 5;
    BEGIN
        CASE
            WHEN LOWER(COALESCE(c_holding_period, '')) IN ('short_term', 'under_3_years') THEN c_years := 2;
            WHEN LOWER(COALESCE(c_holding_period, '')) IN ('medium_term', '3_7_years') THEN c_years := 5;
            WHEN LOWER(COALESCE(c_holding_period, '')) IN ('long_term', '7_years_plus') THEN c_years := 10;
            ELSE BEGIN c_years := (REGEXP_REPLACE(c_holding_period, '[^0-9]', '', 'g'))::INT; EXCEPTION WHEN OTHERS THEN c_years := 5; END;
        END CASE;
        v_horizon_align := public.internal_horizon_alignment(c_years, p_horizon_rec);
    END;

    -- 5. Weighted Score Calculation
    -- Budget: 25%, Location: 20%, Goal: 20%, Risk: 20%, Horizon: 15%
    v_final_fit := ROUND(
        (v_budget_align * 0.25) + 
        (v_loc_align * 0.20) + 
        (v_goal_align * 0.20) + 
        (v_risk_align * 0.20) + 
        (v_horizon_align * 0.15),
        2
    );

    -- 6. Labeling
    IF v_final_fit >= 80 THEN v_label := 'Highly Suitable';
    ELSIF v_final_fit >= 60 THEN v_label := 'Suitable with Consideration';
    ELSE v_label := 'Not Recommended';
    END IF;

    -- 7. Return Result
    fit_score := v_final_fit;
    fit_label := v_label;
    budget_alignment := v_budget_align;
    location_alignment := v_loc_align;
    goal_alignment := v_goal_align;
    risk_alignment := v_risk_align;
    horizon_alignment := v_horizon_align;
    RETURN NEXT;
END;
$$;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
