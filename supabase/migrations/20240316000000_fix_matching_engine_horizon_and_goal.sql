-- Migration: Fix Matching Engine — Horizon Alignment & Goal Mapping
-- Issues Fixed:
--   C1: p_horizon_rec was fetching target_segment instead of holding_period_recommendation
--   C3: Goal alignment missing mapping for land, townhouse, mixed_use property types

-- 1. Goal Alignment — Add missing property type mappings
CREATE OR REPLACE FUNCTION public.internal_goal_alignment(client_goal TEXT, project_purpose TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    IF client_goal IS NULL OR project_purpose IS NULL THEN
         RETURN 50;
    END IF;

    CASE LOWER(TRIM(client_goal))
        WHEN 'living' THEN
            IF project_purpose ILIKE '%apartment%' OR project_purpose ILIKE '%house%' 
               OR project_purpose ILIKE '%residential%' OR project_purpose ILIKE '%mid_apartment%'
               OR project_purpose ILIKE '%townhouse%' OR project_purpose ILIKE '%villa%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%resort%' OR project_purpose ILIKE '%rental%'
               OR project_purpose ILIKE '%mixed_use%' THEN
                RETURN 60;
            ELSIF project_purpose ILIKE '%land%' THEN
                RETURN 30;
            END IF;
        
        WHEN 'investment' THEN
            IF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%'
               OR project_purpose ILIKE '%land%' OR project_purpose ILIKE '%mixed_use%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%'
               OR project_purpose ILIKE '%resort%' OR project_purpose ILIKE '%villa%' THEN
                RETURN 80;
            ELSIF project_purpose ILIKE '%apartment%' OR project_purpose ILIKE '%townhouse%' THEN
                RETURN 70;
            END IF;

        WHEN 'rental' THEN
            IF project_purpose ILIKE '%rental%' OR project_purpose ILIKE '%yield%'
               OR project_purpose ILIKE '%resort%' THEN
                RETURN 100;
            ELSIF project_purpose ILIKE '%apartment%' OR project_purpose ILIKE '%mixed_use%' THEN
                RETURN 80;
            ELSIF project_purpose ILIKE '%growth%' OR project_purpose ILIKE '%investment%' THEN
                RETURN 60;
            ELSIF project_purpose ILIKE '%land%' OR project_purpose ILIKE '%villa%' THEN
                RETURN 40;
            END IF;
            
        ELSE
            RETURN 30; -- Unknown goal mapping
    END CASE;

    RETURN 30; -- Default mismatch
END;
$$;


-- 2. Main Fit Function — Fix: use holding_period_recommendation for horizon, not target_segment
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
    p_horizon_years TEXT; -- FIXED: now reads holding_period_recommendation (INT stored as TEXT via cast)
    
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

    -- 2. Fetch Client Data
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

    -- 3. Fetch Project Data (FIXED: use holding_period_recommendation instead of target_segment)
    SELECT 
        min_unit_price,
        location,
        property_type,
        risk_score,
        holding_period_recommendation::TEXT  -- FIXED: cast INT years to TEXT for horizon parser
    INTO 
        p_min_price,
        p_location,
        p_purpose,
        p_risk_score,
        p_horizon_years
    FROM public.projects
    WHERE id = p_project_id;

    -- 4. Run Alignment Calculators
    v_budget    := public.internal_budget_alignment(c_budget_range, p_min_price);
    v_location  := public.internal_location_alignment(c_pref_locations, p_location);
    v_goal      := public.internal_goal_alignment(c_purchase_goal, p_purpose);
    v_risk      := public.internal_risk_alignment(c_risk_tolerance, p_risk_score);
    v_horizon   := public.internal_horizon_alignment(c_holding_period, p_horizon_years);

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

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
