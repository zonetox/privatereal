-- =========================================
-- BOOKINGS TABLE & RLS
-- =========================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    google_event_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- Admin Policy (Full Access)
CREATE POLICY "Admins have full access to bookings" ON public.bookings FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- Client Policy (No Access - By default RLS blocks access, but we can explicitly deny or just not add a policy)
-- To be absolutely sure:
-- CREATE POLICY "Clients cannot access bookings" ON public.bookings FOR ALL TO authenticated USING (FALSE);
-- Indexing
CREATE INDEX IF NOT EXISTS idx_bookings_lead_id ON public.bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON public.bookings(scheduled_at);