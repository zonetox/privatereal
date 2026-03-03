-- Migration: Investment Strategy Simulator Extension
-- Description: Extending simulations table with detailed financial metrics for advanced modeling.
ALTER TABLE public.simulations
ADD COLUMN IF NOT EXISTS annual_cashflow NUMERIC,
    ADD COLUMN IF NOT EXISTS exit_value NUMERIC,
    ADD COLUMN IF NOT EXISTS total_profit NUMERIC,
    ADD COLUMN IF NOT EXISTS roi_percent NUMERIC,
    ADD COLUMN IF NOT EXISTS leverage_cost_percent NUMERIC,
    ADD COLUMN IF NOT EXISTS stress_test_return NUMERIC;
-- Notify PostgREST to reload schema
NOTIFY pgrst,
'reload schema';