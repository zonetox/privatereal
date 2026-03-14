-- Migration: Bulk Matching Engine RPC
-- Description: Provides a bulk alternative to calculate_project_fit to prevent N+1 overhead in dashboards.
-- Optimizes Module 5 Performance.

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
    -- Client data cache
    c_budget_range TEXT;
    c_pref_locs TEXT[];
    c_purchase_goal TEXT;
    c_risk_tolerance TEXT;
    c_holding_period TEXT;
    c_years INT := 5;
BEGIN 
    -- 1. Security Check
    SELECT user_id INTO v_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (v_owner_id = auth.uid())) THEN 
        RAISE EXCEPTION 'Access Denied';
    END IF;

    -- 2. Fetch Client Advisory Data (Once)
    SELECT 
        budget_range,
        preferred_locations,
        purchase_goal,
        risk_tolerance,
        holding_period
    INTO 
        c_budget_range, c_pref_locs, c_purchase_goal, c_risk_tolerance, c_holding_period
    FROM public.clients
    WHERE id = p_client_id;

    -- 3. Map holding period text to years (Once)
    CASE
        WHEN LOWER(COALESCE(c_holding_period, '')) IN ('short_term', 'under_3_years') THEN c_years := 2;
        WHEN LOWER(COALESCE(c_holding_period, '')) IN ('medium_term', '3_7_years') THEN c_years := 5;
        WHEN LOWER(COALESCE(c_holding_period, '')) IN ('long_term', '7_years_plus') THEN c_years := 10;
        ELSE BEGIN c_years := (REGEXP_REPLACE(c_holding_period, '[^0-9]', '', 'g'))::INT; EXCEPTION WHEN OTHERS THEN c_years := 5; END;
    END CASE;

    -- 4. Set-based matching calculation
    RETURN QUERY
    WITH calculations AS (
        SELECT 
            p.id as pid,
            public.internal_budget_alignment(c_budget_range, p.min_unit_price) as b_align,
            public.internal_location_alignment(c_pref_locs, p.location) as l_align,
            public.internal_goal_alignment(c_purchase_goal, p.primary_purpose) as g_align,
            public.internal_risk_alignment(c_risk_tolerance, p.risk_score) as r_align,
            public.internal_horizon_alignment(c_years, p.holding_period_recommendation) as h_align
        FROM public.projects p
        WHERE p.status = 'active' AND p.visible_to_clients = true
    ),
    scored AS (
        SELECT 
            pid,
            b_align,
            l_align,
            g_align,
            r_align,
            h_align,
            ROUND(
                (b_align * 0.25) + (l_align * 0.20) + (g_align * 0.20) + (r_align * 0.20) + (h_align * 0.15),
                2
            ) as final_score
        FROM calculations
    )
    SELECT 
        pid,
        final_score,
        CASE 
            WHEN final_score >= 80 THEN 'Highly Suitable'
            WHEN final_score >= 60 THEN 'Suitable with Consideration'
            ELSE 'Not Recommended'
        END,
        b_align,
        l_align,
        g_align,
        r_align,
        h_align
    FROM scored;
END;
$$;
