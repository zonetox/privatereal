-- 0. Cleanup existing functions to avoid parameter name mismatch errors
DROP FUNCTION IF EXISTS public.internal_location_alignment(text[], text);
DROP FUNCTION IF EXISTS public.internal_goal_alignment(text, text);
DROP FUNCTION IF EXISTS public.internal_risk_alignment(text, integer);
DROP FUNCTION IF EXISTS public.calculate_project_fit(uuid, uuid);

-- 1. Location Preference Alignment (20%)
-- Levels: Exact (100), Zone/Nearby (80), City (60), Different Zone (40), Different Region (20)
CREATE OR REPLACE FUNCTION public.internal_location_alignment(client_locs TEXT[], project_loc TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    loc TEXT;
    best_score NUMERIC := 20; -- Default: Different Region
BEGIN
    IF client_locs IS NULL OR array_length(client_locs, 1) IS NULL THEN
        RETURN 100;
    END IF;

    IF project_loc IS NULL THEN
        RETURN 50;
    END IF;

    FOREACH loc IN ARRAY client_locs LOOP
        -- Exact Match or Strict Substring Containment (District level typically)
        IF project_loc ILIKE '%' || TRIM(loc) || '%' THEN
             best_score := GREATEST(best_score, 100);
        
        -- Same City (Assumption: Most projects are in HCMC or Hanoi)
        ELSIF (project_loc ILIKE '%Hồ Chí Minh%' OR project_loc ILIKE '%HCMC%' OR project_loc ILIKE '%Sài Gòn%') AND 
              (loc ILIKE '%Hồ Chí Minh%' OR loc ILIKE '%HCMC%' OR loc ILIKE '%Sài Gòn%') THEN
             best_score := GREATEST(best_score, 80); -- Treat as Same Zone/Nearby for same city proximity
        
        ELSIF (project_loc ILIKE '%Hà Nội%' OR project_loc ILIKE '%Hanoi%') AND 
              (loc ILIKE '%Hà Nội%' OR loc ILIKE '%Hanoi%') THEN
             best_score := GREATEST(best_score, 80);
             
        -- Same City but possibly different zones/outskirts
        ELSIF project_loc ILIKE '%City%' AND loc ILIKE '%City%' THEN
             best_score := GREATEST(best_score, 60);

        -- Different Zone but maybe same city category
        ELSIF (project_loc ILIKE '%Quận%' OR project_loc ILIKE '%District%') AND
              (loc ILIKE '%Quận%' OR loc ILIKE '%District%') THEN
             best_score := GREATEST(best_score, 40);
        END IF;

    END LOOP;

    RETURN best_score;
END;
$$;


-- 2. Goal Alignment Function (20%)
-- Mapping Table: Client Goal vs Project Type
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
            IF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' OR project_purpose ILIKE '%tăng trưởng%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%' OR project_purpose ILIKE '%cho thuê%' THEN
                RETURN 80;
            END IF;

        WHEN 'rental' THEN
            IF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%' OR project_purpose ILIKE '%cho thuê%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' OR project_purpose ILIKE '%tăng trưởng%' THEN
                RETURN 60;
            END IF;
            
        ELSE
            RETURN 50;
    END CASE;

    RETURN 50; 
END;
$$;


-- 3. Risk Tolerance Alignment (20%)
-- Client: Low, Medium, High
-- Project Score: 80-100 (Low), 60-80 (Mod), 40-60 (Med), 20-40 (High)
CREATE OR REPLACE FUNCTION public.internal_risk_alignment(client_risk_tolerance TEXT, project_risk_score INT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    client_risk TEXT;
    proj_risk TEXT;
BEGIN 
    IF project_risk_score IS NULL THEN
        RETURN 50; 
    END IF;

    -- Map Project Risk per user matrix
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
        ELSIF proj_risk = 'medium' THEN RETURN 50; -- Interpolated
        ELSE RETURN 30; -- high
        END IF;
    ELSIF client_risk = 'medium' THEN
        IF proj_risk = 'low' THEN RETURN 100; -- High compatibility for lower risk
        ELSIF proj_risk = 'moderate' THEN RETURN 100; -- Ideal match
        ELSIF proj_risk = 'medium' THEN RETURN 80; -- Close enough
        ELSE RETURN 70; -- high
        END IF;
    ELSIF client_risk = 'high' THEN
        -- High risk tolerance accepts everything, but optimized for high risk
        IF proj_risk = 'high' THEN RETURN 100;
        ELSE RETURN 100; 
        END IF;
    END IF;

    RETURN 50;
END;
$$;


-- 4. MAIN FIT FUNCTION (V3.1 - Weights: 25, 20, 20, 20, 15)
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
    p_horizon_rec TEXT;
    
    -- Calculated scores
    v_budget NUMERIC;
    v_location NUMERIC;
    v_goal NUMERIC;
    v_risk NUMERIC;
    v_horizon NUMERIC;
    v_final_fit NUMERIC;
    v_label TEXT;
BEGIN 
    -- 1. Security Check
    SELECT user_id INTO c_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (c_owner_id = auth.uid())) THEN 
        RAISE EXCEPTION 'Access Denied';
    END IF;

    -- 2. Fetch Client Data
    SELECT 
        budget_range, preferred_locations, purchase_goal, risk_tolerance, holding_period
    FROM public.clients WHERE id = p_client_id
    INTO c_budget_range, c_pref_locations, c_purchase_goal, c_risk_tolerance, c_holding_period;

    -- 3. Fetch Project Data
    SELECT 
        min_unit_price, location, property_type, risk_score, target_segment
    FROM public.projects WHERE id = p_project_id
    INTO p_min_price, p_location, p_purpose, p_risk_score, p_horizon_rec;

    -- 4. Run Alignment Calculators
    v_budget    := public.internal_budget_alignment(c_budget_range, p_min_price);
    v_location  := public.internal_location_alignment(c_pref_locations, p_location);
    v_goal      := public.internal_goal_alignment(c_purchase_goal, p_purpose);
    v_risk      := public.internal_risk_alignment(c_risk_tolerance, p_risk_score);
    v_horizon   := public.internal_horizon_alignment(c_holding_period, p_horizon_rec);

    -- 5. Combine Overall Score (Weighted)
    -- Budget 25%, Location 20%, Goal 20%, Risk 20%, Horizon 15%
    v_final_fit := ROUND(
        (v_budget * 0.25) + 
        (v_location * 0.20) + 
        (v_goal * 0.20) + 
        (v_risk * 0.20) + 
        (v_horizon * 0.15),
        2
    );

    -- 6. Map Label
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

NOTIFY pgrst, 'reload schema';
