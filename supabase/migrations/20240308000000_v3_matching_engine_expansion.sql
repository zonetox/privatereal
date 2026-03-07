-- Migration: V3 Matching Engine Expansion (Phase 9C)
-- Description: Extends matching from 3 pillars to 5 pillars by incorporating domain intelligence and financial metrics.

-- Drop existing V2 function to allow for signature changes
DROP FUNCTION IF EXISTS public.calculate_project_fit(UUID, UUID);

-- 1. Pillar 1: Financial & Return Match (30% Weight)
CREATE OR REPLACE FUNCTION public.internal_financial_alignment(client_target NUMERIC, project_total_return NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_diff NUMERIC;
BEGIN 
    -- If no target is set, assume neutral fit
    IF client_target IS NULL THEN RETURN 50; END IF;
    
    -- Target is met or exceeded
    IF project_total_return >= client_target THEN RETURN 100; END IF;
    
    -- Linear penalty for underperformance
    v_diff := client_target - project_total_return;
    IF v_diff <= 1 THEN RETURN 90;
    ELSIF v_diff <= 3 THEN RETURN 70;
    ELSIF v_diff <= 5 THEN RETURN 40;
    ELSE RETURN 10;
    END IF;
END;
$$;

-- 2. Pillar 2 (Extended): Drawdown Match (Part of Risk Pillar)
CREATE OR REPLACE FUNCTION public.internal_drawdown_alignment(client_max_drawdown INT, project_downside_risk NUMERIC, project_risk_score INT) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE 
    v_actual_risk NUMERIC;
BEGIN
    -- Fallbacks if data is missing
    IF client_max_drawdown IS NULL THEN RETURN 50; END IF;
    v_actual_risk := COALESCE(project_downside_risk, (project_risk_score * 0.5)); -- Proxy downside risk if missing

    -- If the project is safer than the client's tolerance
    IF v_actual_risk <= client_max_drawdown THEN RETURN 100;
    -- If it exceeds tolerance slightly
    ELSIF v_actual_risk <= (client_max_drawdown + 5) THEN RETURN 60;
    -- Large mismatch
    ELSE RETURN 20;
    END IF;
END;
$$;

-- 3. Pillar 3 (Extended): Liquidity Lifestyle Match (Part of Horizon Pillar)
CREATE OR REPLACE FUNCTION public.internal_liquidity_alignment(client_preference TEXT, supply_level TEXT, demand_level TEXT) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    -- High Liquidity Preference
    IF client_preference = 'high' THEN
        IF demand_level = 'high' AND supply_level != 'high' THEN RETURN 100;
        ELSIF demand_level = 'medium' THEN RETURN 70;
        ELSE RETURN 30;
        END IF;
    -- Medium Liquidity Preference
    ELSIF client_preference = 'medium' THEN
        IF demand_level = 'high' THEN RETURN 80;
        ELSIF demand_level = 'medium' THEN RETURN 100;
        ELSE RETURN 60;
        END IF;
    -- Low Liquidity / Buy & Hold Life
    ELSIF client_preference = 'low' THEN
        RETURN 100; -- Tolerant of any liquidity state
    -- Default
    ELSE 
        RETURN 50;
    END IF;
END;
$$;

-- 4. Pillar 4: Location & Infrastructure Match (10% Weight)
CREATE OR REPLACE FUNCTION public.internal_location_strategy_alignment(client_risk_profile TEXT, distance_to_cbd NUMERIC, infra_score NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    -- Conservative clients prefer established areas (close to CBD)
    IF client_risk_profile = 'conservative' THEN
        IF distance_to_cbd <= 5 THEN RETURN 100;
        ELSIF distance_to_cbd <= 10 THEN RETURN 80;
        ELSE RETURN 40;
        END IF;
    -- Aggressive clients prefer emerging areas (high infra score)
    ELSIF client_risk_profile = 'aggressive' THEN
        IF infra_score >= 80 THEN RETURN 100;
        ELSIF infra_score >= 60 THEN RETURN 70;
        ELSE RETURN 30;
        END IF;
    -- Balanced clients are flexible
    ELSE
        RETURN 75;
    END IF;
END;
$$;

-- 5. Pillar 5: Asset Class Strategy Match (10% Weight)
CREATE OR REPLACE FUNCTION public.internal_asset_class_alignment(client_succession BOOLEAN, client_cashflow NUMERIC, project_type TEXT, rental_yield NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    v_score NUMERIC := 50;
BEGIN
    -- Succession Strategy
    IF client_succession = TRUE THEN
        IF project_type IN ('land', 'villa', 'townhouse') THEN v_score := 100;
        ELSE v_score := 50; -- Apartments are less ideal for multi-generational land banking in many cultures
        END IF;
        RETURN v_score;
    END IF;

    -- Cashflow Strategy
    IF COALESCE(client_cashflow, 0) > 0 THEN
        IF COALESCE(rental_yield, 0) >= 5 THEN v_score := 100;
        ELSIF COALESCE(rental_yield, 0) >= 3 THEN v_score := 80;
        ELSE v_score := 40;
        END IF;
        RETURN v_score;
    END IF;

    RETURN 75; -- Neutral fit
END;
$$;

-- Create the required composite return type
DO $$ BEGIN
    CREATE TYPE project_fit_result AS (
        fit_score NUMERIC,
        fit_label TEXT,
        financial_alignment NUMERIC,
        risk_alignment NUMERIC,
        horizon_alignment NUMERIC,
        location_alignment NUMERIC,
        strategy_alignment NUMERIC
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 6. Main Fit Function (V3)
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

    -- Project & Intelligence data
    p_risk_score INT;
    p_growth_rate NUMERIC;
    p_horizon_rec INT;
    p_downside NUMERIC;
    p_type TEXT;
    
    m_rental_yield NUMERIC := 0;
    m_demand TEXT := 'medium';
    m_supply TEXT := 'medium';
    
    l_dist NUMERIC := 10;
    l_infra NUMERIC := 50;

    -- Calculated scores
    v_risk_core NUMERIC;
    v_risk_drawdown NUMERIC;
    v_risk_align NUMERIC; -- Pillar 2 Final

    v_return_core NUMERIC; -- Pillar 1 Final

    v_horizon_core NUMERIC;
    v_horizon_liquid NUMERIC;
    v_horizon_align NUMERIC; -- Pillar 3 Final

    v_location_align NUMERIC; -- Pillar 4 Final
    v_strategy_align NUMERIC; -- Pillar 5 Final

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

    -- Fetch Project Data
    SELECT risk_score, expected_growth_rate, holding_period_recommendation, downside_risk_percent, property_type
    INTO p_risk_score, p_growth_rate, p_horizon_rec, p_downside, p_type
    FROM public.projects WHERE id = p_project_id;

    -- Fetch Market Intel (Safely handle nulls)
    SELECT COALESCE(rental_yield, 0), COALESCE(demand_level, 'medium'), COALESCE(supply_level, 'medium')
    INTO m_rental_yield, m_demand, m_supply
    FROM public.project_market_intelligence WHERE project_id = p_project_id LIMIT 1;

    -- Fetch Location Intel
    SELECT COALESCE(distance_to_cbd, 10), COALESCE(infrastructure_pipeline_score, 50)
    INTO l_dist, l_infra
    FROM public.project_location_intelligence WHERE project_id = p_project_id LIMIT 1;

    -- Pillar Calculations
    -- Pillar 1: Financial (Total Return: Growth + Yield)
    v_return_core := public.internal_financial_alignment(c_target_return, COALESCE(p_growth_rate, 0) + m_rental_yield);

    -- Pillar 2: Risk (Profile + Drawdown Tolerance)
    v_risk_core := public.internal_risk_alignment(c_risk_profile, p_risk_score);
    v_risk_drawdown := public.internal_drawdown_alignment(c_max_drawdown, p_downside, p_risk_score);
    v_risk_align := (v_risk_core * 0.7) + (v_risk_drawdown * 0.3); -- Weighted internal risk pillars

    -- Pillar 3: Horizon (Time + Liquidity)
    v_horizon_core := public.internal_horizon_alignment(c_years, p_horizon_rec);
    v_horizon_liquid := public.internal_liquidity_alignment(c_liquidity, m_supply, m_demand);
    v_horizon_align := (v_horizon_core * 0.6) + (v_horizon_liquid * 0.4);

    -- Pillar 4: Location
    v_location_align := public.internal_location_strategy_alignment(c_risk_profile, l_dist, l_infra);

    -- Pillar 5: Strategy
    v_strategy_align := public.internal_asset_class_alignment(c_succession, c_cashflow, p_type, m_rental_yield);

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

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
