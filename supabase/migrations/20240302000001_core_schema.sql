-- 1. Profiles (Ensure it exists and has correct fields)
-- This table is often created initially but we ensure it matches the required structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT CHECK (role IN ('admin', 'client')) DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 2. Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    capital_range TEXT,
    monthly_cashflow_range TEXT,
    occupation TEXT,
    objective TEXT,
    investment_horizon TEXT,
    lead_score INT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 3. Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE
    SET NULL,
        company_name TEXT,
        industry TEXT,
        estimated_networth NUMERIC,
        monthly_cashflow NUMERIC,
        risk_profile TEXT,
        investment_horizon TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 4. Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    location TEXT,
    developer TEXT,
    price_per_m2 NUMERIC,
    legal_score INT,
    location_score INT,
    infrastructure_score INT,
    liquidity_score INT,
    growth_score INT,
    risk_score INT,
    investment_grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 5. Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    capital_allocated NUMERIC,
    leverage_ratio NUMERIC,
    expected_IRR NUMERIC,
    expected_exit_year INT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 6. Simulations
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    initial_capital NUMERIC,
    loan_ratio NUMERIC,
    expected_growth_rate NUMERIC,
    holding_years INT,
    calculated_IRR NUMERIC,
    downside_IRR NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 7. Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT,
    file_url TEXT,
    generated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 8. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    file_url TEXT,
    type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 9. Activities
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    type TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 10. Market Snapshots
CREATE TABLE IF NOT EXISTS public.market_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area TEXT,
    avg_price NUMERIC,
    supply_index NUMERIC,
    absorption_rate NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- =========================================
-- RLS CONFIGURATION
-- =========================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_snapshots ENABLE ROW LEVEL SECURITY;
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN (
        SELECT role
        FROM public.profiles
        WHERE id = auth.uid()
    ) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ADMIN POLICIES (Full Access)
-- Profiles
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL TO authenticated USING (is_admin());
-- Leads
CREATE POLICY "Admins have full access to leads" ON leads FOR ALL TO authenticated USING (is_admin());
-- Clients
CREATE POLICY "Admins have full access to clients" ON clients FOR ALL TO authenticated USING (is_admin());
-- Projects
CREATE POLICY "Admins have full access to projects" ON projects FOR ALL TO authenticated USING (is_admin());
-- Portfolios
CREATE POLICY "Admins have full access to portfolios" ON portfolios FOR ALL TO authenticated USING (is_admin());
-- Simulations
CREATE POLICY "Admins have full access to simulations" ON simulations FOR ALL TO authenticated USING (is_admin());
-- Reports
CREATE POLICY "Admins have full access to reports" ON reports FOR ALL TO authenticated USING (is_admin());
-- Documents
CREATE POLICY "Admins have full access to documents" ON documents FOR ALL TO authenticated USING (is_admin());
-- Activities
CREATE POLICY "Admins have full access to activities" ON activities FOR ALL TO authenticated USING (is_admin());
-- Market Snapshots
CREATE POLICY "Admins have full access to market_snapshots" ON market_snapshots FOR ALL TO authenticated USING (is_admin());
-- CLIENT POLICIES
-- Profiles: Clients can read their own profile
CREATE POLICY "Clients can view own profile" ON profiles FOR
SELECT TO authenticated USING (auth.uid() = id);
-- Projects: Clients can read all projects
CREATE POLICY "Clients can view all projects" ON projects FOR
SELECT TO authenticated USING (TRUE);
-- Market Snapshots: Clients can read all market snapshots
CREATE POLICY "Clients can view all market_snapshots" ON market_snapshots FOR
SELECT TO authenticated USING (TRUE);
-- Clients: Clients can read their own client profile
CREATE POLICY "Clients can view own client profile" ON clients FOR
SELECT TO authenticated USING (user_id = auth.uid());
-- Portfolios: Clients can read their own portfolios
CREATE POLICY "Clients can view own portfolios" ON portfolios FOR
SELECT TO authenticated USING (
        client_id IN (
            SELECT id
            FROM clients
            WHERE user_id = auth.uid()
        )
    );
-- Simulations: Clients can read their own simulations
CREATE POLICY "Clients can view own simulations" ON simulations FOR
SELECT TO authenticated USING (
        client_id IN (
            SELECT id
            FROM clients
            WHERE user_id = auth.uid()
        )
    );
-- Reports: Clients can read their own reports
CREATE POLICY "Clients can view own reports" ON reports FOR
SELECT TO authenticated USING (
        client_id IN (
            SELECT id
            FROM clients
            WHERE user_id = auth.uid()
        )
    );
-- Documents: Clients can read their own documents
CREATE POLICY "Clients can view own documents" ON documents FOR
SELECT TO authenticated USING (
        client_id IN (
            SELECT id
            FROM clients
            WHERE user_id = auth.uid()
        )
    );
-- Activities: Clients can read their own activities
CREATE POLICY "Clients can view own activities" ON activities FOR
SELECT TO authenticated USING (
        client_id IN (
            SELECT id
            FROM clients
            WHERE user_id = auth.uid()
        )
    );
-- =========================================
-- INDEX OPTIMIZATION
-- =========================================
-- Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_client_id ON portfolios(client_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_project_id ON portfolios(project_id);
CREATE INDEX IF NOT EXISTS idx_simulations_client_id ON simulations(client_id);
CREATE INDEX IF NOT EXISTS idx_simulations_project_id ON simulations(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON reports(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
-- Performance Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
CREATE INDEX IF NOT EXISTS idx_projects_grade ON projects(investment_grade);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_area ON market_snapshots(area);
CREATE INDEX IF NOT EXISTS idx_market_snapshots_recorded_at ON market_snapshots(recorded_at);