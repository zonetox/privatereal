-- Migration: Investment Simulation Engine
-- Description: Automated financial calculations for investment simulations.
-- 1. Create Internal Calculation Logic (Pure function)
CREATE OR REPLACE FUNCTION public.internal_calculate_simulation_metrics(
        initial_cap NUMERIC,
        annual_cf NUMERIC,
        exit_val NUMERIC,
        years INT,
        downside_risk NUMERIC -- from project
    ) RETURNS RECORD LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE v_total_profit NUMERIC := 0;
v_roi_percent NUMERIC := 0;
v_irr NUMERIC := 0;
v_stress_test NUMERIC := 0;
result RECORD;
BEGIN -- 1. Total Profit = (Cashflow * Years) + Exit Value - Initial Capital
v_total_profit := (COALESCE(annual_cf, 0) * COALESCE(years, 1)) + COALESCE(exit_val, 0) - COALESCE(initial_cap, 0);
-- 2. ROI % = (Total Profit / Initial Capital) * 100
IF COALESCE(initial_cap, 0) > 0 THEN v_roi_percent := (v_total_profit / initial_cap) * 100;
ELSE v_roi_percent := 0;
END IF;
-- 3. Calculated IRR (CAGR Approximation)
-- Formula: ((Total Cash Out / Initial Cap) ^ (1/Years)) - 1
IF COALESCE(initial_cap, 0) > 0
AND COALESCE(years, 0) > 0 THEN
DECLARE total_cash_out NUMERIC := (COALESCE(annual_cf, 0) * years) + COALESCE(exit_val, 0);
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
-- 4. Stress Test Return
-- Reduce total profit by downside risk percentage
v_stress_test := v_total_profit * (1 - (COALESCE(downside_risk, 20) / 100.0));
SELECT ROUND(v_total_profit::NUMERIC, 2) as total_profit,
    ROUND(v_roi_percent::NUMERIC, 2) as roi_percent,
    ROUND(v_irr::NUMERIC, 2) as calculated_irr,
    ROUND(v_stress_test::NUMERIC, 2) as stress_test_return INTO result;
RETURN result;
END;
$$;
-- 2. Create Trigger Function
CREATE OR REPLACE FUNCTION public.handle_simulation_metrics() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_metrics RECORD;
v_downside_risk NUMERIC := 20;
-- default
BEGIN -- Fetch downside risk from project if available
IF NEW.project_id IS NOT NULL THEN
SELECT downside_risk_percent INTO v_downside_risk
FROM public.projects
WHERE id = NEW.project_id;
END IF;
-- Calculate metrics
v_metrics := public.internal_calculate_simulation_metrics(
    NEW.initial_capital,
    NEW.annual_cashflow,
    NEW.exit_value,
    NEW.holding_years,
    v_downside_risk
);
-- Map to NEW record
NEW.total_profit := v_metrics.total_profit;
NEW.roi_percent := v_metrics.roi_percent;
NEW.calculated_irr := v_metrics.calculated_irr;
NEW.stress_test_return := v_metrics.stress_test_return;
RETURN NEW;
END;
$$;
-- 3. Create Trigger
DROP TRIGGER IF EXISTS trg_calculate_simulation_metrics ON public.simulations;
CREATE TRIGGER trg_calculate_simulation_metrics BEFORE
INSERT
    OR
UPDATE ON public.simulations FOR EACH ROW EXECUTE FUNCTION public.handle_simulation_metrics();
-- 4. Create Public API Function (The "Getter/Updater" requested)
CREATE OR REPLACE FUNCTION public.calculate_simulation_metrics(simulation_id UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_irr NUMERIC;
BEGIN -- Triggering update to fire metrics calculation
UPDATE public.simulations
SET updated_at = now()
WHERE id = simulation_id;
SELECT calculated_irr INTO v_irr
FROM public.simulations
WHERE id = simulation_id;
RETURN COALESCE(v_irr, 0);
END;
$$;
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';