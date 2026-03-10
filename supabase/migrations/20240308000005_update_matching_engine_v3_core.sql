-- Migration: Update Matching Engine to use Consolidated Core
-- Description: Refactors calculate_project_fit to read all metrics from public.projects.

CREATE OR REPLACE FUNCTION public.calculate_project_fit(p_client_id UUID, p_project_id UUID) RETURNS SETOF project_fit_result LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE 
    -- Client data
    c_risk_profile TEXT;
    c_target_return NUMERIC;
    c_horizon_text TEXT;
    c_years INT := 5;
    c_owner_id UUID;
    c_max_drawdown INT;
    c_liquidity TEXT;
    c_succession BOOLEAN;
    c_cashflow NUMERIC;

    -- Project Intelligence Core data (Consolidated)
    p_risk_score INT;
    p_growth_rate NUMERIC;
    p_horizon_rec INT;
    p_downside NUMERIC;
    p_type TEXT;
    p_rental_yield NUMERIC;
    p_demand TEXT;
    p_supply TEXT;
    p_dist NUMERIC;
    p_infra NUMERIC;

    -- Calculated scores
    v_risk_core NUMERIC;
    v_risk_drawdown NUMERIC;
    v_risk_align NUMERIC; 

    v_return_core NUMERIC; 

    v_horizon_core NUMERIC;
    v_horizon_liquid NUMERIC;
    v_horizon_align NUMERIC; 

    v_location_align NUMERIC; 
    v_strategy_align NUMERIC; 

    v_final_fit NUMERIC;
    v_label TEXT;
    
    result_record project_fit_result;
BEGIN 
    -- Security Check
    SELECT user_id INTO c_owner_id FROM public.clients WHERE id = p_client_id;
    IF NOT (public.is_admin() OR (c_owner_id = auth.uid())) THEN 
        RAISE EXCEPTION 'Access Denied: You do not have permission to run compatibility analysis for this client.';
    END IF;

    -- Fetch Client Data
    SELECT 
        risk_profile, target_annual_return, investment_horizon, 
        max_drawdown_percent, liquidity_preference, succession_planning, monthly_cashflow
    INTO 
        c_risk_profile, c_target_return, c_horizon_text, 
        c_max_drawdown, c_liquidity, c_succession, c_cashflow
    FROM public.clients
    WHERE id = p_client_id;

    -- Map Horizon
    CASE LOWER(COALESCE(c_horizon_text, ''))
        WHEN 'short_term' THEN c_years := 2;
        WHEN 'medium_term' THEN c_years := 5;
        WHEN 'long_term' THEN c_years := 10;
        ELSE BEGIN c_years := (REGEXP_REPLACE(c_horizon_text, '[^0-9]', '', 'g'))::INT; EXCEPTION WHEN OTHERS THEN c_years := 5; END;
    END CASE;

    -- Fetch Project Intelligence Core (All in ONE table now)
    SELECT 
        risk_score, expected_growth_rate, holding_period_recommendation, downside_risk_percent, property_type,
        COALESCE(avg_rental_yield, 0), COALESCE(rental_demand, 'medium'), COALESCE(supply_level, 'medium'),
        COALESCE(distance_to_cbd, 10), COALESCE(infrastructure_score, 50)
    INTO 
        p_risk_score, p_growth_rate, p_horizon_rec, p_downside, p_type,
        p_rental_yield, p_demand, p_supply,
        p_dist, p_infra
    FROM public.projects WHERE id = p_project_id;

    -- Pillar Calculations
    -- Pillar 1: Financial (Total Return: Growth + Yield)
    v_return_core := public.internal_financial_alignment(c_target_return, COALESCE(p_growth_rate, 0) + p_rental_yield);

    -- Pillar 2: Risk (Profile + Drawdown Tolerance)
    v_risk_core := public.internal_risk_alignment(c_risk_profile, p_risk_score);
    v_risk_drawdown := public.internal_drawdown_alignment(c_max_drawdown, p_downside, p_risk_score);
    v_risk_align := (v_risk_core * 0.7) + (v_risk_drawdown * 0.3); 

    -- Pillar 3: Horizon (Time + Liquidity)
    v_horizon_core := public.internal_horizon_alignment(c_years, p_horizon_rec);
    v_horizon_liquid := public.internal_liquidity_alignment(c_liquidity, p_supply, p_demand);
    v_horizon_align := (v_horizon_core * 0.6) + (v_horizon_liquid * 0.4);

    -- Pillar 4: Location
    v_location_align := public.internal_location_strategy_alignment(c_risk_profile, p_dist, p_infra);

    -- Pillar 5: Strategy
    v_strategy_align := public.internal_asset_class_alignment(c_succession, c_cashflow, p_type, p_rental_yield);

    -- 5-Pillar Combination
    v_final_fit := ROUND(
        (v_return_core * 0.30) + 
        (v_risk_align * 0.30) + 
        (v_horizon_align * 0.20) + 
        (v_location_align * 0.10) + 
        (v_strategy_align * 0.10),
        2
    );

    IF v_final_fit >= 80 THEN v_label := 'Highly Suitable';
    ELSIF v_final_fit >= 60 THEN v_label := 'Suitable with Consideration';
    ELSE v_label := 'Not Recommended';
    END IF;

    -- Map to the composite type
    result_record.fit_score := v_final_fit;
    result_record.fit_label := v_label;
    result_record.financial_alignment := ROUND(v_return_core, 2);
    result_record.risk_alignment := ROUND(v_risk_align, 2);
    result_record.horizon_alignment := ROUND(v_horizon_align, 2);
    result_record.location_alignment := ROUND(v_location_align, 2);
    result_record.strategy_alignment := ROUND(v_strategy_align, 2);

    RETURN NEXT result_record;
END;
$$;
