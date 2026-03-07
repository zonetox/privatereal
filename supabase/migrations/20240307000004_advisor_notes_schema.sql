-- Phase 9E: Advisor Intelligence Module Schema
-- Create the advisor_client_notes table to track strategic notes and meetings.

CREATE TABLE IF NOT EXISTS public.advisor_client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    advisor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    note_type TEXT NOT NULL CHECK (note_type IN ('meeting', 'strategy', 'risk_alert', 'general')),
    content TEXT NOT NULL,
    action_items TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.advisor_client_notes ENABLE ROW LEVEL SECURITY;

-- Admins can manage all notes
CREATE POLICY "Admins can manage all advisor notes" 
ON public.advisor_client_notes 
FOR ALL 
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

-- Clients CANNOT access this table at all. It is strictly an internal advisory tool.
-- (By not creating any policy spanning other roles, access defaults to denied)

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_advisor_client_notes_client_id ON public.advisor_client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_advisor_client_notes_advisor_id ON public.advisor_client_notes(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_client_notes_created_at ON public.advisor_client_notes(created_at);
