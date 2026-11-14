-- ==============================================================================
-- SYNAPTIX COMMAND — Hardened Supabase Authentication & Multi-Tenant RAG Security Migration
-- ==============================================================================
-- File: supabase/migrations/20261102_auth_profiles_enhancement.sql
--       (staged as supabase/remediation/04_v3_2_auth_profiles_enhancement.sql)
-- Revision: Final Production Security Validation Standard (V3.2 Security Audit Patch)
-- Target: Supabase PostgreSQL (Postgres 15+)
--
-- Security Guarantees:
-- 1. Fixed SECURITY DEFINER Authorization (Elimination of current_user Flaw):
--    Never uses current_user for authorization checks. Differentiates callers via:
--    - session_user IN ('postgres', 'supabase_admin') AND auth.role() IS NULL (Trusted DBA session in SQL Editor)
--    - auth.role() = 'service_role' (Backend service key)
--    - auth.role() = 'authenticated' (PostgREST ordinary user session)
--    - session_user IN ('supabase_auth_admin', 'postgres') AND pg_trigger_depth() >= 2 AND setting (Internal signup)
-- 2. Strict Role Protection (No Profile or Membership Privilege Escalation):
--    Ordinary authenticated users can NEVER alter profile roles or grant themselves admin/owner.
-- 3. Universal Last Workspace Owner Invariant (Applies to ALL callers including service_role):
--    Demotion and removal operations strictly verify >= 1 owner remains in active workspaces.
-- 4. No Silent Data Modification:
--    Verifies all existing membership roles; aborts if invalid/NULL roles are found.
-- 5. Explicit Policy Replacement (No Blind Deletion of Application Policies):
--    Drops only known baseline and obsolete policies by name; preserves unknown policies.
-- 6. Schema Conformance:
--    public.workspace_memberships strictly matches production (no updated_at column).
-- 7. FORCE ROW LEVEL SECURITY enabled across all authentication and tenant tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTEND PUBLIC.PROFILES TABLE (NON-DESTRUCTIVE)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

UPDATE public.profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. VERIFY AND HARDEN PUBLIC.WORKSPACE_MEMBERSHIPS CONSTRAINTS
-- ------------------------------------------------------------------------------
-- Safety Gate: Abort if invalid or NULL roles exist (demands explicit review)
DO $$
DECLARE
  v_invalid_roles_count BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_invalid_roles_count
  FROM public.workspace_memberships
  WHERE role IS NULL OR role NOT IN ('owner', 'admin', 'member', 'viewer');

  IF v_invalid_roles_count > 0 THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Found % row(s) in public.workspace_memberships with NULL or unsupported roles. Silent modification is prohibited. Manual decision required.', v_invalid_roles_count;
  END IF;
END $$;

ALTER TABLE public.workspace_memberships ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE public.workspace_memberships ALTER COLUMN role SET NOT NULL;

ALTER TABLE public.workspace_memberships DROP CONSTRAINT IF EXISTS workspace_memberships_role_check;
ALTER TABLE public.workspace_memberships
  ADD CONSTRAINT workspace_memberships_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

-- ------------------------------------------------------------------------------
-- 3. HARDENED HELPER FUNCTIONS: is_workspace_admin & is_workspace_owner
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_workspace_admin(target_workspace_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_memberships
    WHERE workspace_id = target_workspace_id
      AND user_id = (SELECT auth.uid())
      AND role IN ('owner', 'admin')
  );
$$;

ALTER FUNCTION public.is_workspace_admin(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_workspace_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_admin(TEXT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(target_workspace_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_memberships
    WHERE workspace_id = target_workspace_id
      AND user_id = (SELECT auth.uid())
      AND role = 'owner'
  );
$$;

ALTER FUNCTION public.is_workspace_owner(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_workspace_owner(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_workspace_owner(TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. HARDENED TRIGGER FUNCTION: handle_new_user (ZERO-TRUST INITIAL ONBOARDING)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_full_name TEXT;
  v_display_name TEXT;
  v_avatar_url TEXT;
  v_org TEXT;
BEGIN
  -- Establish transaction-local signup authorization context
  PERFORM pg_catalog.set_config('synaptix.internal_auth_signup', 'true', true);

  -- Extract display metadata from signup or OAuth claims
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    pg_catalog.split_part(NEW.email, '@', 1)
  );

  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    v_full_name
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  v_org := COALESCE(
    NEW.raw_user_meta_data->>'organization',
    'SYNAPTIX COMMAND Enterprise'
  );

  -- Idempotently insert profile with default unprivileged role
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    avatar_url,
    organization,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_display_name,
    v_avatar_url,
    v_org,
    'Enterprise Specialist',
    pg_catalog.timezone('utc', pg_catalog.now()),
    pg_catalog.timezone('utc', pg_catalog.now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    organization = COALESCE(EXCLUDED.organization, public.profiles.organization),
    updated_at = pg_catalog.timezone('utc', pg_catalog.now());

  -- Baseline workspace onboarding: Only general 'business' workspace with 'member' role
  -- Conforms to production schema: (id, workspace_id, user_id, role, created_at)
  INSERT INTO public.workspace_memberships (
    workspace_id,
    user_id,
    role,
    created_at
  )
  VALUES (
    'business',
    NEW.id,
    'member',
    pg_catalog.timezone('utc', pg_catalog.now())
  )
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Clear transaction-local context
  PERFORM pg_catalog.set_config('synaptix.internal_auth_signup', '', true);

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. HARDENED TRIGGER FUNCTION: prevent_profile_tampering (V3.2 AUDITED)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_user TEXT;
  v_trigger_depth INTEGER;
  v_auth_role TEXT;
  v_auth_uid UUID;
  v_is_internal_auth BOOLEAN;
  v_is_dba BOOLEAN;
  v_is_service_role BOOLEAN;
BEGIN
  -- NEVER inspect current_user inside SECURITY DEFINER! Use session_user & JWT claims.
  v_session_user := session_user;
  v_trigger_depth := pg_catalog.pg_trigger_depth();
  v_auth_role := (SELECT auth.role());
  v_auth_uid := (SELECT auth.uid());

  -- 1. Trusted DBA in Supabase SQL Editor:
  -- Initiated directly as postgres/supabase_admin without an authenticated client JWT
  v_is_dba := (v_session_user IN ('postgres', 'supabase_admin')) AND (v_auth_role IS NULL);

  -- 2. Trusted service_role (backend services with secret service key):
  v_is_service_role := (v_auth_role IS NOT DISTINCT FROM 'service_role');

  -- 3. Trusted internal signup trigger:
  -- Depth >= 2 AND session_user is supabase_auth_admin or postgres AND transaction setting active
  v_is_internal_auth := (v_trigger_depth >= 2) AND 
                        (v_session_user IN ('supabase_auth_admin', 'postgres')) AND
                        (pg_catalog.current_setting('synaptix.internal_auth_signup', true) = 'true');

  -- ----------------------------------------------------------------------------
  -- INSERT OPERATION GUARD
  -- ----------------------------------------------------------------------------
  IF TG_OP = 'INSERT' THEN
    IF v_is_dba OR v_is_service_role THEN
      NEW.created_at := COALESCE(NEW.created_at, pg_catalog.timezone('utc', pg_catalog.now()));
      NEW.updated_at := pg_catalog.timezone('utc', pg_catalog.now());
      RETURN NEW;
    END IF;

    IF v_is_internal_auth THEN
      NEW.role := 'Enterprise Specialist';
      NEW.created_at := COALESCE(NEW.created_at, pg_catalog.timezone('utc', pg_catalog.now()));
      NEW.updated_at := pg_catalog.timezone('utc', pg_catalog.now());
      RETURN NEW;
    END IF;

    -- Ordinary authenticated client:
    IF v_auth_uid IS NULL THEN
      RAISE EXCEPTION 'Unauthenticated profile insertion prohibited';
    END IF;

    IF NEW.id IS DISTINCT FROM v_auth_uid THEN
      RAISE EXCEPTION 'Primary account identity (id) must match authenticated user';
    END IF;

    -- Strict role escalation rejection: force role to Enterprise Specialist
    NEW.role := 'Enterprise Specialist';
    NEW.created_at := COALESCE(NEW.created_at, pg_catalog.timezone('utc', pg_catalog.now()));
    NEW.updated_at := pg_catalog.timezone('utc', pg_catalog.now());
    RETURN NEW;
  END IF;

  -- ----------------------------------------------------------------------------
  -- UPDATE OPERATION GUARD
  -- ----------------------------------------------------------------------------
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Primary account identity (id) cannot be modified';
    END IF;

    -- Email modification guard: ordinary users must use Supabase Auth email change flow
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      IF NOT v_is_internal_auth AND NOT v_is_dba AND NOT v_is_service_role THEN
        RAISE EXCEPTION 'Profile email must be updated via Supabase Auth email change verification';
      END IF;
    END IF;

    -- Profile role escalation guard: ordinary users CANNOT alter profile roles
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT v_is_dba AND NOT v_is_service_role THEN
        RAISE EXCEPTION 'Profile role modification prohibited for ordinary authenticated users (attempted change: "%" -> "%")', OLD.role, NEW.role;
      END IF;
    END IF;

    NEW.updated_at := pg_catalog.timezone('utc', pg_catalog.now());
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unsupported operation % on public.profiles', TG_OP;
END;
$$;

ALTER FUNCTION public.prevent_profile_tampering() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.prevent_profile_tampering() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prevent_profile_tampering() TO authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS tr_prevent_profile_tampering ON public.profiles;
CREATE TRIGGER tr_prevent_profile_tampering
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_tampering();

-- ------------------------------------------------------------------------------
-- 6. HARDENED TRIGGER FUNCTION: enforce_workspace_role_hierarchy (V3.2 AUDITED)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_workspace_role_hierarchy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_user TEXT;
  v_trigger_depth INTEGER;
  v_auth_role TEXT;
  v_caller_id UUID;
  v_is_dba BOOLEAN;
  v_is_service_role BOOLEAN;
  v_is_internal_auth BOOLEAN;
  v_is_admin BOOLEAN;
  v_is_owner BOOLEAN;
  v_remaining_owners BIGINT;
  v_ws_exists BOOLEAN;
  v_user_exists BOOLEAN;
BEGIN
  -- NEVER inspect current_user inside SECURITY DEFINER! Use session_user & JWT claims.
  v_session_user := session_user;
  v_trigger_depth := pg_catalog.pg_trigger_depth();
  v_auth_role := (SELECT auth.role());
  v_caller_id := (SELECT auth.uid());

  v_is_dba := (v_session_user IN ('postgres', 'supabase_admin')) AND (v_auth_role IS NULL);
  v_is_service_role := (v_auth_role IS NOT DISTINCT FROM 'service_role');

  v_is_internal_auth := (v_trigger_depth >= 2) AND 
                        (v_session_user IN ('supabase_auth_admin', 'postgres')) AND
                        (pg_catalog.current_setting('synaptix.internal_auth_signup', true) = 'true');

  -- ----------------------------------------------------------------------------
  -- 1. INSERT OPERATION
  -- ----------------------------------------------------------------------------
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS NULL OR NEW.role NOT IN ('owner', 'admin', 'member', 'viewer') THEN
      RAISE EXCEPTION 'Invalid workspace role: role cannot be null and must be one of owner, admin, member, viewer (received: %)', COALESCE(NEW.role, 'NULL');
    END IF;

    IF v_is_internal_auth THEN
      IF NEW.workspace_id <> 'business' OR NEW.role <> 'member' THEN
        RAISE EXCEPTION 'Internal signup trigger is restricted to baseline business member insertion';
      END IF;
      RETURN NEW;
    END IF;

    IF v_is_dba OR v_is_service_role THEN
      RETURN NEW;
    END IF;

    -- Ordinary authenticated client checks:
    IF v_caller_id IS NULL THEN
      RAISE EXCEPTION 'Unauthenticated workspace membership operations prohibited';
    END IF;

    -- Caller must be an admin of the target workspace
    v_is_admin := public.is_workspace_admin(NEW.workspace_id);
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Access denied: caller does not possess administrative privileges in workspace %', NEW.workspace_id;
    END IF;

    -- Self-assignment of administrative or owner role is strictly prohibited
    IF NEW.user_id = v_caller_id AND NEW.role IN ('admin', 'owner') THEN
      RAISE EXCEPTION 'Users cannot assign themselves administrative or owner roles in workspace %', NEW.workspace_id;
    END IF;

    -- Promoting anyone to 'owner' requires caller to be an existing owner
    IF NEW.role = 'owner' THEN
      v_is_owner := public.is_workspace_owner(NEW.workspace_id);
      IF NOT v_is_owner THEN
        RAISE EXCEPTION 'Only an existing workspace owner can grant the owner role in workspace %', NEW.workspace_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- ----------------------------------------------------------------------------
  -- 2. UPDATE OPERATION
  -- ----------------------------------------------------------------------------
  IF TG_OP = 'UPDATE' THEN
    IF NEW.workspace_id IS DISTINCT FROM OLD.workspace_id THEN
      RAISE EXCEPTION 'Workspace ID cannot be modified on an existing membership';
    END IF;

    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'User ID cannot be modified on an existing membership';
    END IF;

    IF NEW.role IS NULL OR NEW.role NOT IN ('owner', 'admin', 'member', 'viewer') THEN
      RAISE EXCEPTION 'Invalid workspace role: role cannot be null and must be one of owner, admin, member, viewer (received: %)', COALESCE(NEW.role, 'NULL');
    END IF;

    -- CRITICAL LAST-OWNER DEMOTION INVARIANT:
    -- Applies to EVERYONE, including service_role, DBA, and workspace owners!
    IF OLD.role = 'owner' AND NEW.role IS DISTINCT FROM 'owner' THEN
      SELECT EXISTS (SELECT 1 FROM public.workspaces WHERE id = OLD.workspace_id) INTO v_ws_exists;
      IF NOT v_ws_exists THEN
        RETURN NEW; -- Parent workspace is being deleted
      END IF;

      IF NOT v_is_dba AND NOT v_is_service_role THEN
        IF v_caller_id IS NULL THEN
          RAISE EXCEPTION 'Unauthenticated workspace membership operations prohibited';
        END IF;

        v_is_owner := public.is_workspace_owner(OLD.workspace_id);
        IF NOT v_is_owner THEN
          RAISE EXCEPTION 'Only an existing workspace owner can demote a workspace owner in workspace %', OLD.workspace_id;
        END IF;
      END IF;

      -- Acquire row-level serialization lock on parent workspace
      PERFORM 1
      FROM public.workspaces
      WHERE id = OLD.workspace_id
      FOR UPDATE;

      -- Verify at least one other owner remains in the workspace
      SELECT pg_catalog.count(*)
      INTO v_remaining_owners
      FROM public.workspace_memberships
      WHERE workspace_id = OLD.workspace_id
        AND role = 'owner'
        AND user_id <> OLD.user_id;

      IF v_remaining_owners < 1 THEN
        RAISE EXCEPTION 'Cannot demote the last remaining owner of workspace %. A workspace must retain at least one owner (enforced across all callers including service_role).', OLD.workspace_id;
      END IF;

      RETURN NEW;
    END IF;

    IF v_is_dba OR v_is_service_role THEN
      RETURN NEW;
    END IF;

    -- Ordinary authenticated client checks:
    IF v_caller_id IS NULL THEN
      RAISE EXCEPTION 'Unauthenticated workspace membership operations prohibited';
    END IF;

    v_is_admin := public.is_workspace_admin(OLD.workspace_id);
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Access denied: caller does not possess administrative privileges in workspace %', OLD.workspace_id;
    END IF;

    -- Non-owners cannot modify their own workspace role
    IF NEW.user_id = v_caller_id AND NEW.role IS DISTINCT FROM OLD.role THEN
      IF OLD.role IS DISTINCT FROM 'owner' THEN
        RAISE EXCEPTION 'Users cannot modify their own workspace membership role in workspace %', OLD.workspace_id;
      END IF;
    END IF;

    -- Promoting anyone to 'owner' requires caller to be an existing owner
    IF NEW.role = 'owner' AND OLD.role IS DISTINCT FROM 'owner' THEN
      v_is_owner := public.is_workspace_owner(OLD.workspace_id);
      IF NOT v_is_owner THEN
        RAISE EXCEPTION 'Only an existing workspace owner can promote a user to owner in workspace %', OLD.workspace_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- ----------------------------------------------------------------------------
  -- 3. DELETE OPERATION
  -- ----------------------------------------------------------------------------
  IF TG_OP = 'DELETE' THEN
    -- Cascade deletion safety: allow deletion if parent workspace is already deleted
    SELECT EXISTS (SELECT 1 FROM public.workspaces WHERE id = OLD.workspace_id) INTO v_ws_exists;
    IF NOT v_ws_exists THEN
      RETURN OLD;
    END IF;

    -- Cascade deletion safety: allow deletion if parent user is already deleted from auth.users
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.user_id) INTO v_user_exists;
    IF NOT v_user_exists THEN
      RETURN OLD;
    END IF;

    -- CRITICAL LAST-OWNER REMOVAL INVARIANT:
    -- Applies to EVERYONE, including service_role, DBA, and workspace owners!
    IF OLD.role = 'owner' THEN
      IF NOT v_is_dba AND NOT v_is_service_role THEN
        IF v_caller_id IS NULL THEN
          RAISE EXCEPTION 'Unauthenticated workspace membership operations prohibited';
        END IF;

        v_is_owner := public.is_workspace_owner(OLD.workspace_id);
        IF NOT v_is_owner THEN
          RAISE EXCEPTION 'Only an existing workspace owner can remove a workspace owner from workspace %', OLD.workspace_id;
        END IF;
      END IF;

      -- Acquire row-level serialization lock on parent workspace
      PERFORM 1
      FROM public.workspaces
      WHERE id = OLD.workspace_id
      FOR UPDATE;

      -- Verify at least one other owner remains in the workspace
      SELECT pg_catalog.count(*)
      INTO v_remaining_owners
      FROM public.workspace_memberships
      WHERE workspace_id = OLD.workspace_id
        AND role = 'owner'
        AND user_id <> OLD.user_id;

      IF v_remaining_owners < 1 THEN
        RAISE EXCEPTION 'Cannot remove the last remaining owner of workspace %. A workspace must retain at least one owner (enforced across all callers including service_role).', OLD.workspace_id;
      END IF;

      RETURN OLD;
    END IF;

    IF v_is_dba OR v_is_service_role THEN
      RETURN OLD;
    END IF;

    -- Ordinary authenticated client checks:
    IF v_caller_id IS NULL THEN
      RAISE EXCEPTION 'Unauthenticated workspace membership operations prohibited';
    END IF;

    v_is_admin := public.is_workspace_admin(OLD.workspace_id);
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'Access denied: caller does not possess administrative privileges in workspace %', OLD.workspace_id;
    END IF;

    RETURN OLD;
  END IF;

  RAISE EXCEPTION 'Unsupported operation % on public.workspace_memberships', TG_OP;
END;
$$;

ALTER FUNCTION public.enforce_workspace_role_hierarchy() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.enforce_workspace_role_hierarchy() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_workspace_role_hierarchy() TO authenticated, service_role, postgres;

DROP TRIGGER IF EXISTS tr_enforce_workspace_role_hierarchy ON public.workspace_memberships;
CREATE TRIGGER tr_enforce_workspace_role_hierarchy
  BEFORE INSERT OR UPDATE OR DELETE ON public.workspace_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_workspace_role_hierarchy();

-- ------------------------------------------------------------------------------
-- 7. EXPLICIT POLICY REPLACEMENT (PRESERVES UNKNOWN APPLICATION POLICIES)
-- ------------------------------------------------------------------------------
-- Explicitly drops only known baseline and obsolete policies by name
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Workspace admins can view workspace memberships" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Only workspace admins can add members" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Only workspace admins can update members" ON public.workspace_memberships;
DROP POLICY IF EXISTS "Only workspace admins can remove members" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_select_policy" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_insert_policy" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_update_policy" ON public.workspace_memberships;
DROP POLICY IF EXISTS "workspace_memberships_delete_policy" ON public.workspace_memberships;

DROP POLICY IF EXISTS "Users can view authorized workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_policy" ON public.workspaces;

-- ------------------------------------------------------------------------------
-- 8. RECREATE ROW LEVEL SECURITY POLICIES ON PUBLIC.PROFILES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  USING (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    (SELECT auth.uid()) = id
  );

CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  USING (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    (SELECT auth.uid()) = id
  )
  WITH CHECK (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    (SELECT auth.uid()) = id
  );

CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    (
      (SELECT auth.uid()) = id AND
      (role IS NULL OR role = 'Enterprise Specialist')
    )
  );

-- ------------------------------------------------------------------------------
-- 9. RECREATE NON-RECURSIVE RLS POLICIES ON PUBLIC.WORKSPACE_MEMBERSHIPS
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY "workspace_memberships_select_policy"
  ON public.workspace_memberships
  FOR SELECT
  USING (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    (SELECT auth.uid()) = user_id OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "workspace_memberships_insert_policy"
  ON public.workspace_memberships
  FOR INSERT
  WITH CHECK (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "workspace_memberships_update_policy"
  ON public.workspace_memberships
  FOR UPDATE
  USING (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    public.is_workspace_admin(workspace_id)
  )
  WITH CHECK (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "workspace_memberships_delete_policy"
  ON public.workspace_memberships
  FOR DELETE
  USING (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

-- ------------------------------------------------------------------------------
-- 10. RECREATE ROW LEVEL SECURITY POLICIES ON PUBLIC.WORKSPACES
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;

CREATE POLICY "workspaces_select_policy"
  ON public.workspaces
  FOR SELECT
  USING (
    (SELECT auth.role()) IS NOT DISTINCT FROM 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.workspaces.id
        AND workspace_memberships.user_id = (SELECT auth.uid())
    )
  );
