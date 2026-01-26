-- Migration: Add wizard state tracking
-- Description: Adds wizard_step and wizard_data to projects table

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS wizard_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS wizard_data JSONB DEFAULT '{}'::jsonb;

-- Ensure status can handle 'draft' (if it's an enum, otherwise text is fine)
-- If status is a text column with check constraint, we might need to modify it.
-- Assuming status is text based on previous files.
