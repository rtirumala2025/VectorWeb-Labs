-- Migration: Add ai_risks column to projects table
-- Run this in the Supabase Dashboard -> SQL Editor

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS ai_risks TEXT[] DEFAULT '{}';

COMMENT ON COLUMN projects.ai_risks IS 'List of risks identified by the AI estimator';
