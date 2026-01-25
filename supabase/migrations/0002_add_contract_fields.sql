-- ══════════════════════════════════════════════════════════════════════════════
-- VectorWeb Labs - Schema Upgrade: Contract Support
-- Migration: 0002_add_contract_fields
-- ══════════════════════════════════════════════════════════════════════════════

-- Add new columns to projects table for contract generation
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS website_type TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS project_scope JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.projects.client_phone IS 'Client phone number for invoice header';
COMMENT ON COLUMN public.projects.website_type IS 'Type of website (e.g., E-commerce, Portfolio, Landing Page)';
COMMENT ON COLUMN public.projects.target_audience IS 'Target audience description for AI context';
COMMENT ON COLUMN public.projects.deposit_paid IS 'Whether the 50% deposit has been paid';
COMMENT ON COLUMN public.projects.project_scope IS 'JSONB containing pages and features for the contract';
