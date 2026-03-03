-- Migration: Property Milestone Tracking System
-- Description: Adds a table to track payment, construction, document, and handover milestones for client properties.
-- 1. Create the table
CREATE TABLE IF NOT EXISTS property_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_property_id UUID NOT NULL REFERENCES client_properties(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL CHECK (
        milestone_type IN (
            'payment_due',
            'construction_update',
            'handover',
            'document_submission'
        )
    ),
    milestone_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 2. Enable RLS
ALTER TABLE property_milestones ENABLE ROW LEVEL SECURITY;
-- 3. Admin Policy: Full access
CREATE POLICY "Admins have full access to property milestones" ON property_milestones FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- 4. Client Policy: Select own property milestones
CREATE POLICY "Clients can view milestones for their own properties" ON property_milestones FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM client_properties
            WHERE id = property_milestones.client_property_id
                AND client_id IN (
                    SELECT id
                    FROM clients
                    WHERE user_id = auth.uid()
                )
        )
    );
-- 5. Indexing for performance
CREATE INDEX idx_milestones_property_id ON property_milestones(client_property_id);
CREATE INDEX idx_milestones_date ON property_milestones(milestone_date);