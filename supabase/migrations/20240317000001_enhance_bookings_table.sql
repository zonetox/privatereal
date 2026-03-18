-- =========================================
-- ENHANCE BOOKINGS TABLE FOR CLIENT CRM
-- =========================================

-- Add new columns for Client Bookings (Advisory CRM)
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS visit_date DATE,
ADD COLUMN IF NOT EXISTS visit_time TEXT,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS note TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Mới đặt lịch',
ADD COLUMN IF NOT EXISTS crm_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure lead_id is nullable (it probably already is, but just in case)
ALTER TABLE public.bookings ALTER COLUMN lead_id DROP NOT NULL;

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_project_id ON public.bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Update RLS Policies for Client Access
-- Clients can read and insert their own bookings
CREATE POLICY "Clients can view their own bookings" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (
    client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Clients can insert their own bookings" 
ON public.bookings FOR INSERT 
TO authenticated 
WITH CHECK (
    client_id IN (
        SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
);

-- Note: Admins already have full access from the original bookings table policies

-- Activity Log integration
-- Ensuring bookings status transitions can be tracked if needed
