-- Migration: Refine Investment Simulation Engine Accuracy
-- Description: Implement stressed CAGR, leverage cost subtraction, and pure getter refactor.
-- 1. Update Internal Calculation Logic
CREATE OR REPLACE FUNCTION public.internal_calculate_simulation_metrics(
        initial_cap NUMERIC,
        annual_cf NUMERIC,
        exit_val NUMERIC,
        years INT,
        loan_ratio NUMERIC,
        lev_cost_pct NUMERIC,
        downside_risk NUMERIC
    ) RETURNS RECORD LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_total_profit NUMERIC := 0;
v_roi_percent NUMERIC := 0;
v_irr NUMERIC := 0;
v_stress_test_irr NUMERIC := 0;
v_loan_amount NUMERIC := 0;
v_leverage_cost NUMERIC := 0;
v_stressed_exit_value NUMERIC := 0;
v_stressed_total_cash NUMERIC := 0;
result RECORD;
BEGIN -- 1. Leverage Cost Calculation
IF COALESCE(loan_ratio, 0) > 0 THEN v_loan_amount := COALESCE(initial_cap, 0) * loan_ratio;
v_leverage_cost := v_loan_amount * (COALESCE(lev_cost_pct, 0) / 100.0) * COALESCE(years, 1);
END IF;
-- 2. Total Profit (Subtracting Leverage Cost)
v_total_profit := (COALESCE(annual_cf, 0) * COALESCE(years, 1)) + COALESCE(exit_val, 0) - COALESCE(initial_cap, 0) - v_leverage_cost;
-- 3. ROI %
IF COALESCE(initial_cap, 0) > 0 THEN v_roi_percent := (v_total_profit / initial_cap) * 100;
ELSE v_roi_percent := 0;
END IF;
-- 4. Calculated IRR (CAGR Approximation)
IF COALESCE(initial_cap, 0) > 0
AND COALESCE(years, 0) > 0 THEN
DECLARE total_cash_out NUMERIC := (COALESCE(annual_cf, 0) * years) + COALESCE(exit_val, 0) - v_leverage_cost;
BEGIN IF total_cash_out > 0 THEN v_irr := (
    POWER(
        (total_cash_out / initial_cap)::DOUBLE PRECISION,
        (1.0 / years)::DOUBLE PRECISION
    ) - 1
) * 100;
ELSE v_irr := -100;
END IF;
END;
ELSE v_irr := 0;
END IF;
-- 5. Stress Test Return (Financial-grade CAGR)
v_stressed_exit_value := COALESCE(exit_val, 0) * (1 - (COALESCE(downside_risk, 20) / 100.0));
v_stressed_total_cash := (COALESCE(annual_cf, 0) * COALESCE(years, 1)) + v_stressed_exit_value - v_leverage_cost;
IF COALESCE(initial_cap, 0) > 0
AND COALESCE(years, 0) > 0 THEN IF v_stressed_total_cash > 0 THEN v_stress_test_irr := (
    POWER(
        (v_stressed_total_cash / initial_cap)::DOUBLE PRECISION,
        (1.0 / years)::DOUBLE PRECISION
    ) - 1
) * 100;
ELSE v_stress_test_irr := -100;
END IF;
ELSE v_stress_test_irr := 0;
END IF;
SELECT ROUND(v_total_profit::NUMERIC, 2) as total_profit,
    ROUND(v_roi_percent::NUMERIC, 2) as roi_percent,
    ROUND(v_irr::NUMERIC, 2) as calculated_irr,
    ROUND(v_stress_test_irr::NUMERIC, 2) as stress_test_return INTO result;
RETURN result;
END;
$$;
-- 2. Update Trigger Function
CREATE OR REPLACE FUNCTION public.handle_simulation_metrics() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_metrics RECORD;
v_downside_risk NUMERIC := 20;
BEGIN -- Fetch downside risk from project
IF NEW.project_id IS NOT NULL THEN
SELECT downside_risk_percent INTO v_downside_risk
FROM public.projects
WHERE id = NEW.project_id;
END IF;
-- Calculate metrics with all parameters
v_metrics := public.internal_calculate_simulation_metrics(
    NEW.initial_capital,
    NEW.annual_cashflow,
    NEW.exit_value,
    NEW.holding_years,
    NEW.loan_ratio,
    NEW.leverage_cost_percent,
    v_downside_risk
);
-- Map to record
NEW.total_profit := v_metrics.total_profit;
NEW.roi_percent := v_metrics.roi_percent;
NEW.calculated_irr := v_metrics.calculated_irr;
NEW.stress_test_return := v_metrics.stress_test_return;
RETURN NEW;
END;
$$;
-- 3. Refactor calculate_simulation_metrics to be a pure getter
CREATE OR REPLACE FUNCTION public.calculate_simulation_metrics(simulation_id UUID) RETURNS NUMERIC LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_irr NUMERIC;
BEGIN
SELECT calculated_irr INTO v_irr
FROM public.simulations
WHERE id = simulation_id;
RETURN COALESCE(v_irr, 0);
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';