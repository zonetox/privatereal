-- =========================================
-- DATABASE HARDENING MIGRATION
-- =========================================
-- 1. Update is_admin function for stability and security
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$ BEGIN RETURN (
        SELECT role
        FROM public.profiles
        WHERE id = auth.uid()
    ) = 'admin';
END;
$$;
-- 2. Improve clients.user_id foreign key (Change from SET NULL to CASCADE)
-- First, find and drop the existing constraint
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'clients_user_id_fkey'
) THEN
ALTER TABLE public.clients DROP CONSTRAINT clients_user_id_fkey;
END IF;
END $$;
ALTER TABLE public.clients
ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
-- 3. Add CHECK constraints for data validation
-- Leads status
ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check CHECK (
        status IN ('new', 'qualified', 'rejected', 'converted')
    );
-- Clients risk profile
ALTER TABLE public.clients
ADD CONSTRAINT clients_risk_profile_check CHECK (
        risk_profile IN ('conservative', 'balanced', 'aggressive')
    );
-- Portfolios status
ALTER TABLE public.portfolios
ADD CONSTRAINT portfolios_status_check CHECK (status IN ('active', 'exited'));
-- Documents type
ALTER TABLE public.documents
ADD CONSTRAINT documents_type_check CHECK (
        type IN ('contract', 'legal', 'payment', 'other')
    );
-- Projects investment grade
ALTER TABLE public.projects
ADD CONSTRAINT projects_investment_grade_check CHECK (investment_grade IN ('A', 'B', 'C', 'D'));
-- 4. Add UNIQUE constraint to leads.email
ALTER TABLE public.leads
ADD CONSTRAINT leads_email_unique UNIQUE (email);
-- 5. Add Index on profiles.role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
-- 6. Refine Admin Policies with WITH CHECK
-- We need to drop and re-create policies to add WITH CHECK
-- Profiles
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Leads
DROP POLICY IF EXISTS "Admins have full access to leads" ON leads;
CREATE POLICY "Admins have full access to leads" ON leads FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Clients
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;
CREATE POLICY "Admins have full access to clients" ON clients FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Projects
DROP POLICY IF EXISTS "Admins have full access to projects" ON projects;
CREATE POLICY "Admins have full access to projects" ON projects FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Portfolios
DROP POLICY IF EXISTS "Admins have full access to portfolios" ON portfolios;
CREATE POLICY "Admins have full access to portfolios" ON portfolios FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Simulations
DROP POLICY IF EXISTS "Admins have full access to simulations" ON simulations;
CREATE POLICY "Admins have full access to simulations" ON simulations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Reports
DROP POLICY IF EXISTS "Admins have full access to reports" ON reports;
CREATE POLICY "Admins have full access to reports" ON reports FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Documents
DROP POLICY IF EXISTS "Admins have full access to documents" ON documents;
CREATE POLICY "Admins have full access to documents" ON documents FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Activities
DROP POLICY IF EXISTS "Admins have full access to activities" ON activities;
CREATE POLICY "Admins have full access to activities" ON activities FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Market Snapshots
DROP POLICY IF EXISTS "Admins have full access to market_snapshots" ON market_snapshots;
CREATE POLICY "Admins have full access to market_snapshots" ON market_snapshots FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());