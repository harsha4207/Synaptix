-- ==============================================================================
-- SYNAPTIX COMMAND — Minimum Compatible Supabase Schema & Auth Migrations
-- ==============================================================================
-- This migration creates the core user profile and workspace authorization tables
-- required for enterprise authentication and workspace isolation.
-- Does NOT disable RLS or create unrestricted policies.
-- ==============================================================================

-- 1. PROFILES TABLE
-- Extends auth.users with display metadata and organizational affiliation
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'Enterprise Specialist',
  organization TEXT DEFAULT 'SYNAPTIX COMMAND Enterprise',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. WORKSPACES TABLE
-- Stores canonical workspaces (Finance, Research, Healthcare, Education, Business Strategy)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  color_accent TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. WORKSPACE MEMBERSHIPS TABLE
-- Governs workspace access control (Zero-Trust Workspace Isolation)
CREATE TABLE IF NOT EXISTS public.workspace_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(workspace_id, user_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;

-- Profiles Policies: User can only access/modify their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workspaces Policies: Users can view workspaces they have an authorized membership in
DROP POLICY IF EXISTS "Users can view authorized workspaces" ON public.workspaces;
CREATE POLICY "Users can view authorized workspaces"
  ON public.workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.workspaces.id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

-- Workspace Memberships Policies: Users can view their own memberships
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.workspace_memberships;
CREATE POLICY "Users can view their own memberships"
  ON public.workspace_memberships
  FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. SEED INITIAL WORKSPACES
-- ==============================================================================
INSERT INTO public.workspaces (id, name, domain, description, color_accent)
VALUES
  ('finance', 'Finance', 'Finance', 'Financial intelligence, revenue modeling & operational auditing', '#1769E0'),
  ('research', 'Research', 'Research', 'Scientific synthesis, paper analysis & knowledge extraction', '#2496FF'),
  ('healthcare', 'Healthcare', 'Healthcare', 'Patient outcome analytics & HIPAA-compliant evidence reasoning', '#0D9488'),
  ('education', 'Education', 'Education', 'Curriculum optimization, learning insights & student outcome modeling', '#8B5CF6'),
  ('business', 'Business Strategy', 'Business', 'Market positioning, competitor reasoning & strategic execution', '#F59E0B')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  description = EXCLUDED.description,
  color_accent = EXCLUDED.color_accent;

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
-- When a user registers via email/password or logs in via Google OAuth, automatically initialize profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, organization)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'organization', 'SYNAPTIX COMMAND Enterprise')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
