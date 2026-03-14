-- Migration: Add Client Workspace Activity View
-- Description: Creates v_client_workspace_activity for the admin Reports page
-- Shows which clients are considering which projects, plus their lifecycle stage.

DROP VIEW IF EXISTS public.v_client_workspace_activity CASCADE;

CREATE OR REPLACE VIEW public.v_client_workspace_activity AS
SELECT
    c.id                        AS client_id,
    COALESCE(c.full_name, pr.email, 'Client ' || c.id::text) AS client_name,
    c.risk_profile,
    p.id                        AS project_id,
    p.name                      AS project_name,
    p.location                  AS project_location,
    p.investment_grade,
    cws.created_at              AS added_to_workspace_at,
    COALESCE(
        (SELECT stage FROM public.client_project_lifecycle
         WHERE client_id = c.id AND project_id = p.id
         ORDER BY updated_at DESC LIMIT 1),
        'considering'
    )                           AS lifecycle_stage
FROM public.client_workspace_selections cws
JOIN public.clients c  ON cws.client_id  = c.id
JOIN public.projects p ON cws.project_id = p.id
LEFT JOIN public.profiles pr ON c.user_id = pr.id
ORDER BY cws.created_at DESC;

-- Grant access to admin role only (via RLS on base tables)
GRANT SELECT ON public.v_client_workspace_activity TO authenticated;
GRANT SELECT ON public.v_client_workspace_activity TO service_role;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
