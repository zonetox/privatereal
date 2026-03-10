-- Migration: Add Phone Column to Clients
-- Description: Adds a phone number field to the clients table for CRM and contact purposes.

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN public.clients.phone IS 'Primary contact phone number for the client.';
