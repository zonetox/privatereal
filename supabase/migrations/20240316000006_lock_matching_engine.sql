-- Migration: Matching Engine SYSTEM LOCK (V1 Final)
-- Description: Finalizes and hardens the 5-pillar advisory logic. 
-- Validates: Budget (VND vs Billion), Goal (Property Types), Horizon (Year Extraction), Security, and Null Safety.

-- 1. Budget Alignment (VND vs Billions)
DROP FUNCTION IF EXISTS public.internal_budget_alignment(TEXT, NUMERIC);
CREATE OR REPLACE FUNCTION public.internal_budget_alignment(client_budget TEXT, project_price NUMERIC) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    budget_max NUMERIC := 999999999999; 
    ratio NUMERIC;
BEGIN 
    IF project_price IS NULL OR project_price = 0 THEN
        RETURN 50; 
    END IF;

    -- Standardize all formats (Lead Assessment or Client Input) to numeric max budget in VND
    CASE COALESCE(client_budget, 'capital_5_10')
        WHEN 'capital_1_3', '1_3_billion' THEN budget_max := 3000000000;
        WHEN 'capital_3_5', '3_5_billion' THEN budget_max := 5000000000;
        WHEN 'capital_5_10', '5_10_billion' THEN budget_max := 10000000000;
        WHEN 'capital_10_20', '10_20_billion' THEN budget_max := 20000000000;
        WHEN 'capital_20plus', '20_billion_plus' THEN budget_max := 100000000000;
        ELSE budget_max := 999999999999;
    END CASE;

    ratio := project_price / budget_max;

    -- Scoring
    IF ratio <= 0.85 THEN RETURN 100;    -- Well within budget
    ELSIF ratio <= 1.00 THEN RETURN 90;  -- Near budget limit
    ELSIF ratio <= 1.15 THEN RETURN 60;  -- Stretching budget
    ELSIF ratio <= 1.30 THEN RETURN 40;  -- Significantly over
    ELSE RETURN 20;                     -- Out of reach
    END IF;
END;
$$;

-- 2. Goal Alignment (Expanded Property Types)
DROP FUNCTION IF EXISTS public.internal_goal_alignment(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.internal_goal_alignment(client_goal TEXT, project_type TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    IF client_goal IS NULL OR project_type IS NULL THEN
         RETURN 50;
    END IF;

    -- Normalizing client_goal (Supports Lead values: income, growth, preserve, diversify AND Client values: living, investment, rental)
    CASE 
        WHEN LOWER(TRIM(client_goal)) IN ('living', 'preserve') THEN
            IF project_type ILIKE ANY(ARRAY['%apartment%', '%house%', '%residential%', '%townhouse%', '%villa%']) THEN RETURN 100;
            ELSIF project_type ILIKE ANY(ARRAY['%mixed_use%', '%resort%']) THEN RETURN 60;
            ELSE RETURN 30; -- Land is usually investment
            END IF;
        
        WHEN LOWER(TRIM(client_goal)) IN ('investment', 'growth', 'diversify') THEN
            IF project_type ILIKE ANY(ARRAY['%land%', '%mixed_use%', '%commercial%', '%growth%', '%investment%']) THEN RETURN 100;
            ELSIF project_type ILIKE ANY(ARRAY['%villa%', '%resort%', '%townhouse%']) THEN RETURN 80;
            ELSE RETURN 70; -- Apartment
            END IF;

        WHEN LOWER(TRIM(client_goal)) IN ('rental', 'income') THEN
            IF project_type ILIKE ANY(ARRAY['%apartment%', '%rental%', '%yield%', '%resort%']) THEN RETURN 100;
            ELSIF project_type ILIKE ANY(ARRAY['%mixed_use%', '%villa%', '%townhouse%']) THEN RETURN 80;
            ELSE RETURN 40; -- Land has no yield
            END IF;
            
        ELSE RETURN 50;
    END CASE;
END;
$$;

-- 3. Horizon Alignment (Smart Year Extraction)
DROP FUNCTION IF EXISTS public.internal_horizon_alignment(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.internal_horizon_alignment(client_horizon TEXT, project_rec TEXT) 
RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    c_years INT;
    p_years INT := 5;
    diff INT;
BEGIN 
    IF client_horizon IS NULL OR project_rec IS NULL THEN RETURN 50; END IF;

    -- Map Client Text (Lead or Profile) to years
    CASE LOWER(client_horizon)
        WHEN 'under_3_years', 'short_term' THEN c_years := 2;
        WHEN '3_7_years', 'medium_term' THEN c_years := 5;
        WHEN '7_years_plus', 'long_term' THEN c_years := 10;
        ELSE BEGIN c_years := (REGEXP_REPLACE(client_horizon, '[^0-9]', '', 'g'))::INT; EXCEPTION WHEN OTHERS THEN c_years := 5; END;
    END CASE;

    -- Map Project recommendation (Smart Extraction: "3 years" -> 3)
    BEGIN 
        p_years := (REGEXP_REPLACE(project_rec, '[^0-9]', '', 'g'))::INT;
        IF p_years IS NULL THEN p_years := 5; END IF;
    EXCEPTION WHEN OTHERS THEN p_years := 5; 
    END;

    diff := ABS(p_years - c_years);
    
    IF diff = 0 THEN RETURN 100;
    ELSIF diff <= 2 THEN RETURN 85;
    ELSIF diff <= 5 THEN RETURN 60;
    ELSE RETURN 30;
    END IF;
END;
$$;

-- 4. Main Fit Function (Hardened SECURITY DEFINER)
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
    -- Variables
    c_owner_id UUID;
    c_data RECORD;
    p_data RECORD;
    v_budget NUMERIC; v_location NUMERIC; v_goal NUMERIC; v_risk NUMERIC; v_horizon NUMERIC;
    v_final NUMERIC;
BEGIN 
    -- Security: Admin or Owner ONLY
    SELECT user_id INTO c_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (c_owner_id = auth.uid())) THEN 
        RAISE EXCEPTION 'Access Denied';
    END IF;

    -- Fetch Data
    SELECT budget_range, preferred_locations, purchase_goal, risk_tolerance, holding_period INTO c_data FROM public.clients WHERE id = p_client_id;
    SELECT min_unit_price, location, property_type, risk_score, holding_period_recommendation::TEXT as holding_rec INTO p_data FROM public.projects WHERE id = p_project_id;

    -- Pillar Logic
    v_budget   := public.internal_budget_alignment(c_data.budget_range, p_data.min_unit_price);
    v_location := public.internal_location_alignment(c_data.preferred_locations, p_data.location);
    v_goal     := public.internal_goal_alignment(c_data.purchase_goal, p_data.property_type);
    v_risk     := public.internal_risk_alignment(c_data.risk_tolerance, p_data.risk_score);
    v_horizon  := public.internal_horizon_alignment(c_data.holding_period, p_data.holding_rec);

    v_final := ROUND((v_budget * 0.25) + (v_location * 0.20) + (v_goal * 0.20) + (v_risk * 0.20) + (v_horizon * 0.15), 2);

    fit_score := v_final;
    fit_label := CASE WHEN v_final >= 85 THEN 'Highly Suitable' WHEN v_final >= 70 THEN 'Suitable' WHEN v_final >= 50 THEN 'Conditional' ELSE 'Not Recommended' END;
    budget_alignment := v_budget; location_alignment := v_location; goal_alignment := v_goal; risk_alignment := v_risk; horizon_alignment := v_horizon;
    
    RETURN NEXT;
END;
$$;

-- 5. Bulk Fit Optimization (Sync with Lock Logic)
DROP FUNCTION IF EXISTS public.calculate_all_project_fits(UUID);
CREATE OR REPLACE FUNCTION public.calculate_all_project_fits(p_client_id UUID) 
RETURNS TABLE (
    project_id UUID,
    fit_score NUMERIC,
    fit_label TEXT,
    budget_alignment NUMERIC,
    location_alignment NUMERIC,
    goal_alignment NUMERIC,
    risk_alignment NUMERIC,
    horizon_alignment NUMERIC
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE 
    v_owner_id UUID;
    c RECORD;
BEGIN 
    SELECT user_id INTO v_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (v_owner_id = auth.uid())) THEN RAISE EXCEPTION 'Access Denied'; END IF;

    SELECT budget_range, preferred_locations, purchase_goal, risk_tolerance, holding_period INTO c FROM public.clients WHERE id = p_client_id;

    RETURN QUERY
    SELECT 
        p.id,
        ROUND((public.internal_budget_alignment(c.budget_range, p.min_unit_price) * 0.25) + 
              (public.internal_location_alignment(c.preferred_locations, p.location) * 0.20) + 
              (public.internal_goal_alignment(c.purchase_goal, p.property_type) * 0.20) + 
              (public.internal_risk_alignment(c.risk_tolerance, p.risk_score) * 0.20) + 
              (public.internal_horizon_alignment(c.holding_period, p.holding_period_recommendation::TEXT) * 0.15), 2) as final_score,
        'Analyzed'::TEXT, -- Placeholder label for bulk
        public.internal_budget_alignment(c.budget_range, p.min_unit_price),
        public.internal_location_alignment(c.preferred_locations, p.location),
        public.internal_goal_alignment(c.purchase_goal, p.property_type),
        public.internal_risk_alignment(c.risk_tolerance, p.risk_score),
        public.internal_horizon_alignment(c.holding_period, p.holding_period_recommendation::TEXT)
    FROM public.projects p
    WHERE p.status = 'active' AND p.visible_to_clients = true;
END;
$$;

NOTIFY pgrst, 'reload schema';
