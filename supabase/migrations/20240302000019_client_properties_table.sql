-- Migration: Client Properties Table
-- Description: Track client property ownership linked to projects.
CREATE TABLE IF NOT EXISTS public.client_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
        unit_code TEXT,
        purchase_date DATE,
        contract_value NUMERIC,
        payment_schedule TEXT,
        current_status TEXT CHECK (
            current_status IN (
                'reserved',
                'contract_signed',
                'paid',
                'transferred'
            )
        ),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Index for fast client lookups
CREATE INDEX IF NOT EXISTS idx_client_properties_client_id ON public.client_properties(client_id);
CREATE INDEX IF NOT EXISTS idx_client_properties_project_id ON public.client_properties(project_id);
-- Enable RLS
ALTER TABLE public.client_properties ENABLE ROW LEVEL SECURITY;
-- Admin: full access
CREATE POLICY "Admins have full access to client_properties" ON public.client_properties FOR ALL TO authenticated USING (public.is_admin());
-- Client: SELECT only their own
CREATE POLICY "Clients can view their own properties" ON public.client_properties FOR
SELECT TO authenticated USING (
        client_id IN (
            SELECT id
            FROM public.clients
            WHERE user_id = auth.uid()
        )
    );
-- Notify PostgREST
NOTIFY pgrst,
'reload schema';