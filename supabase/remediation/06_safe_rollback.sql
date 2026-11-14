-- ==============================================================================
-- SYNAPTIX COMMAND — Complete Non-Destructive Rollback Script (V3.2 Verified)
-- ==============================================================================
-- File: supabase/remediation/06_safe_rollback.sql
--       (identical to supabase/migrations/20261102_auth_profiles_enhancement_rollback.sql)
-- Target: Supabase PostgreSQL (Postgres 15+)
--
-- Baseline Source: supabase/migrations/20261010_initial_auth_and_workspaces.sql
--
-- Verified Restoration Scope:
-- 1. Triggers Dropped:
--    - tr_enforce_workspace_role_hierarchy ON public.workspace_memberships
--    - tr_prevent_profile_tampering ON public.profiles
-- 2. Functions Dropped:
--    - public.enforce_workspace_role_hierarchy()
--    - public.prevent_profile_tampering()
--    - public.is_workspace_owner(TEXT)
--    - public.is_workspace_admin(TEXT)
-- 3. Functions & Triggers Restored:
--    - public.handle_new_user() -> exact definition from lines 112-130 of 20261010 migration
--    - on_auth_user_created trigger on auth.users -> exact definition from lines 133-136
-- 4. Policies Restored (Exact 5 baseline policies):
--    - public.profiles:
--        * "Users can view their own profile" (SELECT: auth.uid() = id)
--        * "Users can update their own profile" (UPDATE: auth.uid() = id)
--        * "Users can insert their own profile" (INSERT: auth.uid() = id)
--    - public.workspaces:
--        * "Users can view authorized workspaces" (SELECT: EXISTS in workspace_memberships)
--    - public.workspace_memberships:
--        * "Users can view their own memberships" (SELECT: auth.uid() = user_id)
-- 5. RLS State Restored:
--    - Reverted to original NO FORCE ROW LEVEL SECURITY across all three tables.
-- 6. Intentionally Retained Artifacts (Non-Destructive Guarantee):
--    - Columns public.profiles.full_name and public.profiles.phone_number are kept
--      to protect existing profile attributes from irreversible deletion.
--    - All user accounts, repaired profiles, and workspace memberships are preserved.
-- 7. Dependencies & Limitations:
--    - Dropping is_workspace_admin() and is_workspace_owner() is safe because no
--      database views, foreign keys, or client RPC queries depend on them.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. DROP V3.2 TRIGGERS & FUNCTIONS
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_enforce_workspace_role_hierarchy ON public.workspace_memberships;
DROP FUNCTION IF EXISTS public.enforce_workspace_role_hierarchy();

DROP TRIGGER IF EXISTS tr_prevent_profile_tampering ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_profile_tampering();

DROP FUNCTION IF EXISTS public.is_workspace_owner(TEXT);
DROP FUNCTION IF EXISTS public.is_workspace_admin(TEXT);

-- ------------------------------------------------------------------------------
-- 2. RESTORE EXACT BASELINE HANDLE_NEW_USER FUNCTION & TRIGGER
-- ------------------------------------------------------------------------------
-- Restores original definition from 20261010_initial_auth_and_workspaces.sql (lines 112-136)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. DROP V3.2 POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

DROP POLICY IF EXISTS "workspace_memberships_select_policy" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_insert_policy" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_update_policy" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_delete_policy" ON public.workspace_memberships;

DROP POLICY IF EXISTS "workspaces_select_policy" ON public.workspaces;

-- Clean up any obsolete intermediate policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view authorized workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Workspace admins can view workspace memberships" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Only workspace admins can add members" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Only workspace admins can update members" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Only workspace admins can remove members" ON public.workspace_memberships;

-- ------------------------------------------------------------------------------
-- 4. RESTORE EXACT BASELINE POLICIES FROM 20261010_INITIAL_AUTH_AND_WORKSPACES.SQL
-- ------------------------------------------------------------------------------

-- Exact baseline policy: public.profiles (lines 54-70)
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Exact baseline policy: public.workspaces (lines 73-83)
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

-- Exact baseline policy: public.workspace_memberships (lines 86-90)
CREATE POLICY "Users can view their own memberships"
  ON public.workspace_memberships
  FOR SELECT
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. REVERT FORCE ROW LEVEL SECURITY (RESTORES ORIGINAL 'NO FORCE' STATE)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships NO FORCE ROW LEVEL SECURITY;

COMMIT;
