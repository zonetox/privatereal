-- Phase 9D: Client Domain Normalization

-- 1. Create client_financials table
CREATE TABLE IF NOT EXISTS public.client_financials (
    client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
    estimated_networth NUMERIC,
    liquid_capital NUMERIC,
    annual_business_revenue NUMERIC,
    monthly_cashflow NUMERIC,
    debt_obligations NUMERIC,
    real_estate_allocation_percent NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create client_preferences table
CREATE TABLE IF NOT EXISTS public.client_preferences (
    client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
    risk_profile TEXT CHECK (risk_profile IN ('conservative', 'balanced', 'aggressive')),
    risk_score INT,
    investment_horizon TEXT,
    liquidity_preference TEXT CHECK (liquidity_preference IN ('low', 'medium', 'high')),
    leverage_preference TEXT CHECK (leverage_preference IN ('none', 'moderate', 'high')),
    target_annual_return NUMERIC,
    crash_reaction TEXT CHECK (crash_reaction IN ('panic_sell', 'hold', 'buy_more')),
    decision_style TEXT CHECK (decision_style IN ('data_driven', 'emotional', 'delegative', 'control_oriented')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create client_priorities table
CREATE TABLE IF NOT EXISTS public.client_priorities (
    client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
    succession_planning BOOLEAN DEFAULT false,
    international_exposure_interest BOOLEAN DEFAULT false,
    max_drawdown_percent INT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Data Migration Script (Move data from clients to new domain tables)
-- This is idempotent and won't affect existing data in domain tables if run twice.
INSERT INTO public.client_financials (client_id, estimated_networth, liquid_capital, annual_business_revenue, monthly_cashflow, debt_obligations, real_estate_allocation_percent)
SELECT 
    id, estimated_networth, liquid_capital, annual_business_revenue, monthly_cashflow, debt_obligations, real_estate_allocation_percent
FROM public.clients
ON CONFLICT (client_id) DO NOTHING;

INSERT INTO public.client_preferences (client_id, risk_profile, risk_score, investment_horizon, liquidity_preference, leverage_preference, target_annual_return, crash_reaction, decision_style)
SELECT 
    id, risk_profile, risk_score, investment_horizon, liquidity_preference, leverage_preference, target_annual_return, crash_reaction, decision_style
FROM public.clients
ON CONFLICT (client_id) DO NOTHING;

INSERT INTO public.client_priorities (client_id, succession_planning, international_exposure_interest, max_drawdown_percent)
SELECT 
    id, succession_planning, international_exposure_interest, max_drawdown_percent
FROM public.clients
ON CONFLICT (client_id) DO NOTHING;

-- 5. Enable RLS and Grant Permissions
ALTER TABLE public.client_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_priorities ENABLE ROW LEVEL SECURITY;

-- Admin: Full Access
CREATE POLICY "Admins have full access to client_financials" ON public.client_financials FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to client_preferences" ON public.client_preferences FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to client_priorities" ON public.client_priorities FOR ALL TO authenticated USING (public.is_admin());

-- Client: Access own data only
CREATE POLICY "Clients see their own financials" ON public.client_financials FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
CREATE POLICY "Clients see their own preferences" ON public.client_preferences FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));
CREATE POLICY "Clients see their own priorities" ON public.client_priorities FOR SELECT TO authenticated USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_financials TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_preferences TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_priorities TO authenticated, service_role;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
