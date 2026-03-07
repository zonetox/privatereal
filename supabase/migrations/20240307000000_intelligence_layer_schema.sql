-- Migration: Intelligence Layer Schema Update
-- Description: Adding Curation and Domain Intelligence tables for Project and Opportunity analysis.

-- 1. Opportunity Cards (Curation Layer)
CREATE TABLE IF NOT EXISTS public.opportunity_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    investment_grade TEXT,
    key_strengths TEXT[],
    risk_indicators TEXT[],
    thesis_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Project Location Intelligence
CREATE TABLE IF NOT EXISTS public.project_location_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    distance_to_cbd NUMERIC,
    metro_access_score NUMERIC,
    highway_access_score NUMERIC,
    infrastructure_pipeline_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Project Market Intelligence
CREATE TABLE IF NOT EXISTS public.project_market_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    avg_price_area NUMERIC,
    price_growth_3y NUMERIC,
    rental_yield NUMERIC,
    supply_level TEXT,
    demand_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Project Risk Intelligence
CREATE TABLE IF NOT EXISTS public.project_risk_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    legal_risk NUMERIC,
    construction_risk NUMERIC,
    supply_risk NUMERIC,
    market_risk NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Project Investment Thesis
CREATE TABLE IF NOT EXISTS public.project_investment_thesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    thesis_summary TEXT,
    growth_drivers TEXT[],
    key_risks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. RLS Policies
ALTER TABLE public.opportunity_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_location_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risk_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_investment_thesis ENABLE ROW LEVEL SECURITY;

-- Admin: Full Access
CREATE POLICY "Admins have full access to opportunity_cards" ON public.opportunity_cards FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to project_location_intelligence" ON public.project_location_intelligence FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to project_market_intelligence" ON public.project_market_intelligence FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to project_risk_intelligence" ON public.project_risk_intelligence FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to project_investment_thesis" ON public.project_investment_thesis FOR ALL TO authenticated USING (public.is_admin());

-- Client: Select only (All authenticated users can see intelligence for active projects)
CREATE POLICY "Clients can view opportunity_cards" ON public.opportunity_cards FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Clients can view project_location_intel" ON public.project_location_intelligence FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Clients can view project_market_intel" ON public.project_market_intelligence FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Clients can view project_risk_intel" ON public.project_risk_intelligence FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Clients can view project_investment_thesis" ON public.project_investment_thesis FOR SELECT TO authenticated USING (TRUE);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_cards_project_id ON public.opportunity_cards(project_id);
CREATE INDEX IF NOT EXISTS idx_project_location_project_id ON public.project_location_intelligence(project_id);
CREATE INDEX IF NOT EXISTS idx_project_market_project_id ON public.project_market_intelligence(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risk_project_id ON public.project_risk_intelligence(project_id);
CREATE INDEX IF NOT EXISTS idx_project_thesis_project_id ON public.project_investment_thesis(project_id);

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
