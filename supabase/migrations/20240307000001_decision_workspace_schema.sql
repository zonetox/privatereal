-- Migration: Phase 1 — Decision Workspace Schema
-- Description: Schema for Workspace selections, Advisor notes, and Decision checklists.

-- 1. Client Workspace Selections
CREATE TABLE IF NOT EXISTS public.client_workspace_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(client_id, project_id)
);

-- 2. Advisor Notes (Strategic Guidance)
CREATE TABLE IF NOT EXISTS public.advisor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Decision Checklists
CREATE TABLE IF NOT EXISTS public.decision_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.client_workspace_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_checklists ENABLE ROW LEVEL SECURITY;

-- Admin: Full Access
CREATE POLICY "Admins have full access to workspace_selections" ON public.client_workspace_selections FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to advisor_notes" ON public.advisor_notes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to decision_checklists" ON public.decision_checklists FOR ALL TO authenticated USING (public.is_admin());

-- Client Policies
CREATE POLICY "Clients can manage their own selections" ON public.client_workspace_selections FOR ALL TO authenticated USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
);

CREATE POLICY "Clients can view their advisor notes" ON public.advisor_notes FOR SELECT TO authenticated USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    AND is_private = false
);

CREATE POLICY "Clients can manage their own checklists" ON public.decision_checklists FOR ALL TO authenticated USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_selections_client ON public.client_workspace_selections(client_id);
CREATE INDEX IF NOT EXISTS idx_advisor_notes_client_project ON public.advisor_notes(client_id, project_id);
CREATE INDEX IF NOT EXISTS idx_decision_checklists_client_project ON public.decision_checklists(client_id, project_id);

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
