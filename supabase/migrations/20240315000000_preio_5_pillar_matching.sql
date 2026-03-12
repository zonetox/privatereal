-- Migration: PREIO 5-Pillar Matching Engine (V3)
-- Description: Overhaul calculate_project_fit to use the 5-pillar advisory model (Budget, Location, Goal, Risk, Horizon) instead of legacy financial metrics.

-- 0. Clean up old V2 alignment functions (Return alignment is no longer used)
DROP FUNCTION IF EXISTS public.internal_return_alignment(numeric, numeric);


-- 1. Budget Compatibility Function (25%)
-- Compares client string-based budget_range to project numeric min_unit_price
CREATE OR REPLACE FUNCTION public.internal_budget_alignment(client_budget TEXT, project_price NUMERIC) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    budget_max NUMERIC := 999999; -- Arbitrary high max
    ratio NUMERIC;
BEGIN 
    IF project_price IS NULL THEN
        RETURN 50; -- Neutral if project price unknown
    END IF;

    -- Map text ranges to numeric max budget (Billion VND)
    CASE COALESCE(client_budget, '5_10_billion')
        WHEN '1_3_billion' THEN 
            budget_max := 3;
        WHEN '3_5_billion' THEN 
            budget_max := 5;
        WHEN '5_10_billion' THEN 
            budget_max := 10;
        WHEN '10_20_billion' THEN 
            budget_max := 20;
        WHEN '20_billion_plus' THEN 
            budget_max := 999999;
        ELSE
            RETURN 50; -- Default fallback
    END CASE;

    -- Calculate ratio of project price vs max budget
    ratio := project_price / budget_max;

    -- Scoring Logic based on Matrix
    IF ratio <= 0.90 THEN
        RETURN 100;
    ELSIF ratio <= 1.00 THEN
        RETURN 90;
    ELSIF ratio <= 1.10 THEN
        RETURN 70;
    ELSIF ratio <= 1.20 THEN
        RETURN 50;
    ELSE
        RETURN 20;
    END IF;
END;
$$;


-- 2. Location Preference Alignment (20%)
-- Evaluates string match quality to approximate Zone/Region differences
CREATE OR REPLACE FUNCTION public.internal_location_alignment(client_locs TEXT[], project_loc TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    loc TEXT;
    best_score NUMERIC := 40; -- Default: Assume same city, different zone
BEGIN
    -- If client has no preference, don't penalize
    IF client_locs IS NULL OR array_length(client_locs, 1) IS NULL THEN
        RETURN 100;
    END IF;

    IF project_loc IS NULL THEN
        RETURN 50;
    END IF;

    -- Evaluate each preferred location
    FOREACH loc IN ARRAY client_locs LOOP
        -- Exact Match or Strict Substring Containment (Same District)
        IF project_loc ILIKE '%' || TRIM(loc) || '%' THEN
             RETURN 100; -- Early exit for perfect match
        END IF;
        
        -- Partial Match (Same Zone / Nearby logic approximation)
        -- E.g. Both are in "District/Quận" but differ slightly, or share a keyword
        -- This is a rudimentary check; in production, use a lookup table for adjacencies
        IF (project_loc ILIKE '%District%' AND loc ILIKE '%District%') OR
           (project_loc ILIKE '%Quận%' AND loc ILIKE '%Quận%') THEN
            best_score := GREATEST(best_score, 80);
        END IF;

    END LOOP;

    RETURN best_score;
END;
$$;


-- 3. Goal Alignment Function (20%)
-- Mapping Table Logic: Client Goal vs Project Type
CREATE OR REPLACE FUNCTION public.internal_goal_alignment(client_goal TEXT, project_purpose TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    IF client_goal IS NULL OR project_purpose IS NULL THEN
         RETURN 50;
    END IF;

    CASE LOWER(TRIM(client_goal))
        WHEN 'living' THEN
            IF project_purpose ILIKE '%apartment%' OR project_purpose ILIKE '%house%' OR project_purpose ILIKE '%residential%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%resort%' OR project_purpose ILIKE '%rental%' THEN
                RETURN 60;
            END IF;
        
        WHEN 'investment' THEN
            IF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%' THEN
                RETURN 80;
            END IF;

        WHEN 'rental' THEN
            IF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' THEN
                RETURN 60;
            END IF;
            
        ELSE
            RETURN 30; -- Unknown goal mapping
    END CASE;

    -- Default Mismatch if no conditions met within the case
    RETURN 30; 
END;
$$;


-- 4. Risk Tolerance Alignment (20%)
CREATE OR REPLACE FUNCTION public.internal_risk_alignment(client_risk_tolerance TEXT, project_risk_score INT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    client_risk TEXT;
    proj_risk TEXT;
BEGIN 
    IF project_risk_score IS NULL THEN
        RETURN 50; 
    END IF;

    -- Map Project Risk
    IF project_risk_score >= 80 THEN proj_risk := 'low';
    ELSIF project_risk_score >= 60 THEN proj_risk := 'moderate';
    ELSIF project_risk_score >= 40 THEN proj_risk := 'medium';
    ELSE proj_risk := 'high';
    END IF;

    -- Map Client Risk
    CASE LOWER(COALESCE(client_risk_tolerance, 'balanced'))
        WHEN 'conservative' THEN client_risk := 'low';
        WHEN 'balanced' THEN client_risk := 'medium';
        WHEN 'aggressive' THEN client_risk := 'high';
        ELSE client_risk := 'medium';
    END CASE;

    -- Scoring Logic based on Matrix
    IF client_risk = 'low' THEN
        IF proj_risk = 'low' THEN RETURN 100;
        ELSIF proj_risk = 'moderate' THEN RETURN 70;
        ELSIF proj_risk = 'medium' THEN RETURN 50;
        ELSE RETURN 30; -- high
        END IF;
    ELSIF client_risk = 'medium' THEN
        IF proj_risk IN ('low', 'moderate') THEN RETURN 100;
        ELSIF proj_risk = 'medium' THEN RETURN 80;
        ELSE RETURN 70; -- high
        END IF;
    ELSIF client_risk = 'high' THEN
        -- High risk tolerance generally accepts anything
        IF proj_risk = 'high' THEN RETURN 100;
        ELSE RETURN 100; 
        END IF;
    END IF;

    RETURN 50;
END;
$$;


-- 5. Holding Strategy Alignment (15%)
CREATE OR REPLACE FUNCTION public.internal_horizon_alignment(client_horizon TEXT, project_term TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    c_years_target INT;
    p_years INT := 5; -- Default fallback
    diff INT;
BEGIN 
    -- Map Client Text to roughly representative target years
    CASE LOWER(COALESCE(client_horizon, '3_7_years'))
        WHEN 'under_3_years' THEN c_years_target := 2;
        WHEN '3_7_years' THEN c_years_target := 5;
        WHEN '7_years_plus' THEN c_years_target := 10;
        ELSE c_years_target := 5;
    END CASE;

    -- Attempt to extract integer from project_term if it exists
    IF project_term IS NOT NULL THEN
        BEGIN
            p_years := (REGEXP_REPLACE(project_term, '[^0-9]', '', 'g'))::INT;
            IF p_years IS NULL THEN p_years := 5; END IF;
        EXCEPTION WHEN OTHERS THEN 
            p_years := 5;
        END;
    END IF;

    -- Scoring Difference
    diff := ABS(p_years - c_years_target);
    
    IF diff = 0 THEN
        RETURN 100;
    ELSIF diff <= 2 THEN
        RETURN 80;
    ELSIF diff <= 5 THEN
        RETURN 60;
    ELSE
        RETURN 40;
    END IF;
END;
$$;


-- 6. MAIN FIT FUNCTION (V3 - 5 Pillars)
DROP FUNCTION IF EXISTS public.calculate_project_fit(UUID, UUID);
CREATE OR REPLACE FUNCTION public.calculate_project_fit(p_client_id UUID, p_project_id UUID) 
RETURNS TABLE (
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
    c_pref_locations TEXT[];
    c_purchase_goal TEXT;
    c_risk_tolerance TEXT;
    c_holding_period TEXT;
    c_owner_id UUID;
    
    -- Project data
    p_min_price NUMERIC;
    p_location TEXT;
    p_purpose TEXT;
    p_risk_score INT;
    p_horizon_rec TEXT; -- Can be TEXT or numeric in DB, typically stored as string like "3-5 years"
    
    -- Calculated scores
    v_budget NUMERIC;
    v_location NUMERIC;
    v_goal NUMERIC;
    v_risk NUMERIC;
    v_horizon NUMERIC;
    v_final_fit NUMERIC;
    v_label TEXT;
BEGIN 
    -- 1. Security Check: Admin or Owner
    SELECT user_id INTO c_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (c_owner_id = auth.uid())) THEN 
        RAISE EXCEPTION 'Access Denied: You do not have permission to run compatibility analysis for this client.';
    END IF;

    -- 2. Fetch Client Data (from combined views or joined tables based on current schema)
    -- Assuming client_financials and client_preferences have been merged back to clients or accessible via join
    -- For safety, we query the main 'clients' table where these fields were added.
    SELECT 
        budget_range,
        preferred_locations,
        purchase_goal,
        risk_tolerance,
        holding_period
    INTO 
        c_budget_range,
        c_pref_locations,
        c_purchase_goal,
        c_risk_tolerance,
        c_holding_period
    FROM public.clients
    WHERE id = p_client_id;

    -- 3. Fetch Project Data
    SELECT 
        min_unit_price,
        location,
        property_type, -- Often used as primary_purpose in PREIO schema
        risk_score,
        target_segment -- Sometimes holds timeline, but we fall back safely if missing
    INTO 
        p_min_price,
        p_location,
        p_purpose,
        p_risk_score,
        p_horizon_rec
    FROM public.projects
    WHERE id = p_project_id;

    -- 4. Run Alignment Calculators
    v_budget    := public.internal_budget_alignment(c_budget_range, p_min_price);
    v_location  := public.internal_location_alignment(c_pref_locations, p_location);
    v_goal      := public.internal_goal_alignment(c_purchase_goal, p_purpose);
    v_risk      := public.internal_risk_alignment(c_risk_tolerance, p_risk_score);
    v_horizon   := public.internal_horizon_alignment(c_holding_period, p_horizon_rec);

    -- 5. Combine Overall Score (Weighted)
    -- Weights: Budget 25%, Location 20%, Goal 20%, Risk 20%, Horizon 15%
    v_final_fit := ROUND(
        (v_budget * 0.25) + 
        (v_location * 0.20) + 
        (v_goal * 0.20) + 
        (v_risk * 0.20) + 
        (v_horizon * 0.15),
        2
    );

    -- 6. Map Label based on Matrix
    IF v_final_fit >= 85 THEN v_label := 'Highly Suitable';
    ELSIF v_final_fit >= 70 THEN v_label := 'Suitable';
    ELSIF v_final_fit >= 50 THEN v_label := 'Conditional';
    ELSE v_label := 'Not Recommended';
    END IF;

    -- 7. Return Result
    fit_score := v_final_fit;
    fit_label := v_label;
    budget_alignment := v_budget;
    location_alignment := v_location;
    goal_alignment := v_goal;
    risk_alignment := v_risk;
    horizon_alignment := v_horizon;
    
    RETURN NEXT;
END;
$$;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
