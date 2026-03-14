-- =========================================
-- PERFORMANCE OPTIMIZATION INDEXING
-- =========================================

-- 1. Indexing for Project Discovery
-- Speeds up queries filtering by active status and visibility
CREATE INDEX IF NOT EXISTS idx_projects_status_visibility 
ON public.projects(status, visible_to_clients);

-- 2. Indexing for Workspace & Comparisons
-- Speeds up membership checks and joins between clients and projects
CREATE INDEX IF NOT EXISTS idx_workspace_selections_composite
ON public.client_workspace_selections(client_id, project_id);

-- 3. Indexing for Lead Management
-- Speeds up dashboard metrics and filtering
CREATE INDEX IF NOT EXISTS idx_leads_status_created 
ON public.leads(status, created_at DESC);

-- 4. Cluster on high-read indices (optional optimization for specific loads)
-- CLUSTER public.projects USING idx_projects_status_visibility;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
