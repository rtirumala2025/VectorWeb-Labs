-- ══════════════════════════════════════════════════════════════════════════════
-- VectorWeb Labs - AthenaGuard SQL Migration
-- Database Security Hardening: Row Level Security (RLS) Policies
-- ══════════════════════════════════════════════════════════════════════════════
-- Run this in your Supabase SQL Editor to enable RLS and secure your data.
-- ══════════════════════════════════════════════════════════════════════════════


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 1: Enable RLS on all tables
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- If you have other tables, enable RLS on them too:
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 2: Projects Table - RLS Policies
-- ──────────────────────────────────────────────────────────────────────────────

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Service role can do anything" ON projects;

-- Policy: Users can only SELECT their own projects
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only INSERT projects for themselves
CREATE POLICY "Users can insert their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own projects
CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own projects
CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Service role bypasses RLS (for backend operations)
-- Note: This uses the service_role key, not the anon key
CREATE POLICY "Service role can do anything"
ON projects FOR ALL
USING (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 3: Create Security Logs Table (Audit Trail)
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type TEXT NOT NULL, -- 'login', 'logout', 'project_create', 'payment', 'rate_limit_hit'
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can interact with security logs
CREATE POLICY "Service role only for security logs"
ON security_logs FOR ALL
USING (auth.role() = 'service_role');


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 4: Add rate_limit_tier to projects (optional enhancement)
-- ──────────────────────────────────────────────────────────────────────────────

-- Add column for tiered rate limits based on project status
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS rate_limit_tier TEXT DEFAULT 'standard' 
CHECK (rate_limit_tier IN ('standard', 'premium', 'enterprise'));


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 5: Verify RLS is enabled
-- ──────────────────────────────────────────────────────────────────────────────

-- Run this query to verify RLS status on your tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';


-- ══════════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ══════════════════════════════════════════════════════════════════════════════
