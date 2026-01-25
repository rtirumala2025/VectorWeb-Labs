-- ══════════════════════════════════════════════════════════════════════════════
-- VectorWeb Labs - Initial Schema
-- Migration: 0001_initial_schema
-- ══════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────────
-- USERS TABLE (linked to auth.users)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- ──────────────────────────────────────────────────────────────────────────────
-- PROJECTS TABLE (Wizard Data)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    vibe_style TEXT NOT NULL CHECK (vibe_style IN ('modern', 'classic', 'bold')),
    domain_choice TEXT NOT NULL,
    ai_price_quote NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'paid', 'building')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
    ON public.projects
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
    ON public.projects
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- CONTRACTS TABLE
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    signature_url TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Users can view contracts for their own projects
CREATE POLICY "Users can view own contracts"
    ON public.contracts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = contracts.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Users can insert contracts for their own projects
CREATE POLICY "Users can insert own contracts"
    ON public.contracts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = contracts.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- ──────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON public.contracts(project_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- AUTOMATIC UPDATED_AT TRIGGER
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
