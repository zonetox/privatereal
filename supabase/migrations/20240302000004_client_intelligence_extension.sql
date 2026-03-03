-- Migration: Client Intelligence System Extension
-- Description: Extending clients table with financial, risk, and strategic intelligence fields.
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS liquid_capital NUMERIC,
    ADD COLUMN IF NOT EXISTS annual_business_revenue NUMERIC,
    ADD COLUMN IF NOT EXISTS debt_obligations NUMERIC,
    ADD COLUMN IF NOT EXISTS real_estate_allocation_percent NUMERIC,
    ADD COLUMN IF NOT EXISTS max_drawdown_percent INT,
    ADD COLUMN IF NOT EXISTS liquidity_preference TEXT CHECK (liquidity_preference IN ('low', 'medium', 'high')),
    ADD COLUMN IF NOT EXISTS crash_reaction TEXT CHECK (
        crash_reaction IN ('panic_sell', 'hold', 'buy_more')
    ),
    ADD COLUMN IF NOT EXISTS leverage_preference TEXT CHECK (
        leverage_preference IN ('none', 'moderate', 'high')
    ),
    ADD COLUMN IF NOT EXISTS target_annual_return NUMERIC,
    ADD COLUMN IF NOT EXISTS succession_planning BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS international_exposure_interest BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS decision_style TEXT CHECK (
        decision_style IN (
            'data_driven',
            'emotional',
            'delegative',
            'control_oriented'
        )
    ),
    ADD COLUMN IF NOT EXISTS risk_score INT;
-- Indexing for performance on risk-based querying
CREATE INDEX IF NOT EXISTS idx_clients_risk_score ON public.clients(risk_score);
-- Notify pgrst to reload schema if needed (though Supabase usually handles this)
NOTIFY pgrst,
'reload schema';