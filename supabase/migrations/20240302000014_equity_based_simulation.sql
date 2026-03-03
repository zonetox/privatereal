-- Migration: Equity-Based Investment Simulation Refinement
-- Description: Implement ROE (Return on Equity) metrics and add data constraints.
-- 1. Add CHECK constraints for simulations data integrity
ALTER TABLE public.simulations
ADD CONSTRAINT check_loan_ratio_range CHECK (
        loan_ratio >= 0
        AND loan_ratio <= 1
    ),
    ADD CONSTRAINT check_leverage_cost_range CHECK (
        leverage_cost_percent >= 0
        AND leverage_cost_percent <= 100
    );
-- 2. Update Internal Calculation Logic to STABLE and use Equity as denominator
CREATE OR REPLACE FUNCTION public.internal_calculate_simulation_metrics(
        initial_cap NUMERIC,
        annual_cf NUMERIC,
        exit_val NUMERIC,
        years INT,
        loan_ratio NUMERIC,
        lev_cost_pct NUMERIC,
        downside_risk NUMERIC
    ) RETURNS RECORD LANGUAGE plpgsql STABLE AS $$
DECLARE v_total_profit NUMERIC := 0;
v_roi_percent NUMERIC := 0;
v_irr NUMERIC := 0;
v_stress_test_irr NUMERIC := 0;
v_loan_amount NUMERIC := 0;
v_equity NUMERIC := 0;
v_leverage_cost NUMERIC := 0;
v_stressed_exit_value NUMERIC := 0;
v_stressed_total_cash NUMERIC := 0;
result RECORD;
BEGIN -- 1. Equity and Loan Calculation
v_loan_amount := COALESCE(initial_cap, 0) * COALESCE(loan_ratio, 0);
v_equity := COALESCE(initial_cap, 0) - v_loan_amount;
-- 2. Leverage Cost Calculation
v_leverage_cost := v_loan_amount * (COALESCE(lev_cost_pct, 0) / 100.0) * COALESCE(years, 1);
-- 3. Total Profit (Revenue - Initial Project Cost - Leverage Cost)
-- Profit remains relative to the total project context but ROI/IRR shift to Equity
v_total_profit := (COALESCE(annual_cf, 0) * COALESCE(years, 1)) + COALESCE(exit_val, 0) - COALESCE(initial_cap, 0) - v_leverage_cost;
-- 4. ROI % (Return on Equity)
IF COALESCE(v_equity, 0) > 0 THEN v_roi_percent := (v_total_profit / v_equity) * 100;
ELSE -- If 100% financed, theoretically infinite or 0 depending on context. 
-- We'll set to 0 to avoid DB errors, assuming edge case.
v_roi_percent := 0;
END IF;
-- 5. Calculated IRR (Equity-based CAGR Approximation)
IF COALESCE(v_equity, 0) > 0
AND COALESCE(years, 0) > 0 THEN
DECLARE -- Net cash out = (Annual CF * Years) + Exit Value - Loan Repayment - Leverage Cost
    -- Note: Initial project cap already includes loan, so we just want the delta on equity
    total_net_cash_out NUMERIC := (COALESCE(annual_cf, 0) * years) + COALESCE(exit_val, 0) - v_loan_amount - v_leverage_cost;
BEGIN IF total_net_cash_out > 0 THEN v_irr := (
    POWER(
        (total_net_cash_out / v_equity)::DOUBLE PRECISION,
        (1.0 / years)::DOUBLE PRECISION
    ) - 1
) * 100;
ELSE v_irr := -100;
END IF;
END;
ELSE v_irr := 0;
END IF;
-- 6. Stress Test Return (Equity-based Stressed CAGR)
v_stressed_exit_value := COALESCE(exit_val, 0) * (1 - (COALESCE(downside_risk, 20) / 100.0));
-- Stressed Net Cash = (Annual CF * Years) + Stressed Exit - Loan Repayment - Leverage Cost
v_stressed_total_cash := (COALESCE(annual_cf, 0) * COALESCE(years, 1)) + v_stressed_exit_value - v_loan_amount - v_leverage_cost;
IF COALESCE(v_equity, 0) > 0
AND COALESCE(years, 0) > 0 THEN IF v_stressed_total_cash > 0 THEN v_stress_test_irr := (
    POWER(
        (v_stressed_total_cash / v_equity)::DOUBLE PRECISION,
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
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';