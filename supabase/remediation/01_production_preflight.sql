-- ==============================================================================
-- SYNAPTIX COMMAND — Production Preflight Read-Only Audit & Safety Gate (V3.2.2 Standard)
-- ==============================================================================
-- File: supabase/remediation/01_production_preflight.sql
-- Target: Supabase SQL Editor (Production Database)
-- Access Mode: STRICT READ-ONLY (Zero writes, zero modifications)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RECORD COUNT INVENTORY
-- ------------------------------------------------------------------------------
SELECT 
  (SELECT pg_catalog.count(*) FROM auth.users) AS total_auth_users,
  (SELECT pg_catalog.count(*) FROM public.profiles) AS total_profiles,
  (SELECT pg_catalog.count(*) FROM public.workspaces) AS total_workspaces,
  (SELECT pg_catalog.count(*) FROM public.workspace_memberships) AS total_workspace_memberships;

-- ------------------------------------------------------------------------------
-- 2. EXACT ACCOUNT & IDENTITY INVENTORY (VERIFY SIX ACCOUNTS)
-- ------------------------------------------------------------------------------
SELECT 
  u.id AS auth_user_id,
  u.email,
  u.created_at AS user_created_at,
  COALESCE(u.raw_app_meta_data->>'provider', 'email') AS auth_provider,
  u.raw_user_meta_data->>'full_name' AS meta_full_name,
  u.raw_user_meta_data->>'display_name' AS meta_display_name,
  p.role AS current_profile_role,
  CASE 
    WHEN p.id IS NULL THEN 'MISSING PROFILE (REMEDIATION REQUIRED)'
    ELSE 'PROFILE PRESENT'
  END AS profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY profile_status DESC, u.created_at ASC;

-- ------------------------------------------------------------------------------
-- 3. WORKSPACE MEMBERSHIP ROLE AUDIT (INSPECTION FOR NULL OR UNKNOWN ROLES)
-- ------------------------------------------------------------------------------
SELECT 
  wm.id AS membership_id,
  wm.workspace_id,
  w.name AS workspace_name,
  wm.user_id,
  u.email AS user_email,
  wm.role AS current_role,
  CASE 
    WHEN wm.role IS NULL THEN 'INVALID: ROLE IS NULL'
    WHEN wm.role NOT IN ('owner', 'admin', 'member', 'viewer') THEN 'INVALID: UNSUPPORTED ROLE (' || wm.role || ')'
    ELSE 'VALID CANONICAL ROLE'
  END AS role_classification,
  wm.created_at
FROM public.workspace_memberships wm
LEFT JOIN public.workspaces w ON w.id = wm.workspace_id
LEFT JOIN auth.users u ON u.id = wm.user_id
ORDER BY role_classification DESC, wm.workspace_id, wm.role;

-- ------------------------------------------------------------------------------
-- 4. RLS POLICY INVENTORY & CLASSIFICATION
-- ------------------------------------------------------------------------------
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE
    WHEN policyname IN (
      'Users can view their own profile',
      'Users can update their own profile',
      'Users can insert their own profile',
      'Users can view authorized workspaces',
      'Users can view their own memberships'
    ) THEN 'REQUIRED BASELINE POLICY'
    WHEN policyname IN (
      'profiles_select_policy',
      'profiles_update_policy',
      'profiles_insert_policy',
      'workspace_memberships_select_policy',
      'workspace_memberships_insert_policy',
      'workspace_memberships_update_policy',
      'workspace_memberships_delete_policy',
      'workspaces_select_policy'
    ) THEN 'HARDENED V3.2.2 POLICY'
    WHEN policyname IN (
      'Workspace admins can view workspace memberships',
      'Only workspace admins can add members',
      'Only workspace admins can update members',
      'Only workspace admins can remove members'
    ) THEN 'OBSOLETE INTERMEDIATE POLICY'
    ELSE 'UNKNOWN / APPLICATION-SPECIFIC POLICY (REQUIRES EXPLICIT REVIEW)'
  END AS policy_classification
FROM pg_catalog.pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'workspace_memberships', 'workspaces')
ORDER BY tablename, policy_classification, policyname;

-- ------------------------------------------------------------------------------
-- 5. SCHEMA CONSTRAINTS & COLUMNS VERIFICATION
-- ------------------------------------------------------------------------------
-- Check columns on public.workspace_memberships (Verifying absence of updated_at)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'workspace_memberships'
ORDER BY ordinal_position;

-- ------------------------------------------------------------------------------
-- 6. PREFLIGHT SAFETY GATES EVALUATION (READ-ONLY)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_users_count BIGINT;
  v_profiles_count BIGINT;
  v_missing_profiles_count BIGINT;
  v_harsha_user_exists BOOLEAN;
  v_harsha_profile_exists BOOLEAN;
  v_workspaces_count BIGINT;
  v_memberships_count BIGINT;
  v_invalid_roles_count BIGINT;
  v_unknown_policies_count BIGINT;
  v_has_wm_updated_at BOOLEAN;
  v_has_wm_unique_constraint BOOLEAN;

  v_gate_1_passed BOOLEAN := false;
  v_gate_2_passed BOOLEAN := false;
  v_gate_3_passed BOOLEAN := false;
  v_gate_4_passed BOOLEAN := false;
  v_gate_5_passed BOOLEAN := false;
  v_gate_6_passed BOOLEAN := false;
BEGIN
  -- Data gathering
  SELECT pg_catalog.count(*) INTO v_users_count FROM auth.users;
  SELECT pg_catalog.count(*) INTO v_profiles_count FROM public.profiles;
  
  SELECT pg_catalog.count(*) INTO v_missing_profiles_count
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.id IS NULL;

  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'harsha230407@gmail.com'
  ) INTO v_harsha_user_exists;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'harsha230407@gmail.com'
  ) INTO v_harsha_profile_exists;

  SELECT pg_catalog.count(*) INTO v_workspaces_count FROM public.workspaces;
  SELECT pg_catalog.count(*) INTO v_memberships_count FROM public.workspace_memberships;

  SELECT pg_catalog.count(*) INTO v_invalid_roles_count
  FROM public.workspace_memberships
  WHERE role IS NULL OR role NOT IN ('owner', 'admin', 'member', 'viewer');

  SELECT pg_catalog.count(*) INTO v_unknown_policies_count
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'workspace_memberships', 'workspaces')
    AND policyname NOT IN (
      'Users can view their own profile',
      'Users can update their own profile',
      'Users can insert their own profile',
      'Users can view authorized workspaces',
      'Users can view their own memberships',
      'profiles_select_policy',
      'profiles_update_policy',
      'profiles_insert_policy',
      'workspace_memberships_select_policy',
      'workspace_memberships_insert_policy',
      'workspace_memberships_update_policy',
      'workspace_memberships_delete_policy',
      'workspaces_select_policy',
      'Workspace admins can view workspace memberships',
      'Only workspace admins can add members',
      'Only workspace admins can update members',
      'Only workspace admins can remove members'
    );

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'workspace_memberships' AND column_name = 'updated_at'
  ) INTO v_has_wm_updated_at;

  SELECT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public' 
      AND rel.relname = 'workspace_memberships'
      AND con.contype IN ('u', 'p')
      AND pg_catalog.pg_get_constraintdef(con.oid, true) LIKE '%workspace_id, user_id%'
  ) INTO v_has_wm_unique_constraint;

  -- Evaluate Gates
  v_gate_1_passed := (v_users_count = 6 AND v_harsha_user_exists);
  v_gate_2_passed := (v_missing_profiles_count = 1 AND NOT v_harsha_profile_exists) OR (v_missing_profiles_count = 0 AND v_harsha_profile_exists);
  v_gate_3_passed := (v_invalid_roles_count = 0);
  v_gate_4_passed := (v_unknown_policies_count = 0);
  v_gate_5_passed := (NOT v_has_wm_updated_at);
  v_gate_6_passed := (v_has_wm_unique_constraint AND v_workspaces_count = 5);

  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'SYNAPTIX COMMAND — PRODUCTION PREFLIGHT SAFETY GATES SCORECARD (V3.2.2)';
  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'GATE 1 [Account Count & Harsha Identity]:   % (auth.users: %, harsha: %)', 
    CASE WHEN v_gate_1_passed THEN 'PASSED' ELSE 'BLOCKED' END, v_users_count, v_harsha_user_exists;
  
  RAISE NOTICE 'GATE 2 [Profiles State & Expected Missing]: % (Missing profiles: %, Harsha profile: %)', 
    CASE WHEN v_gate_2_passed THEN 'PASSED' ELSE 'BLOCKED' END, v_missing_profiles_count, v_harsha_profile_exists;
  
  RAISE NOTICE 'GATE 3 [Membership Canonical Roles]:        % (Invalid/NULL roles: %)', 
    CASE WHEN v_gate_3_passed THEN 'PASSED' ELSE 'BLOCKED' END, v_invalid_roles_count;
  
  RAISE NOTICE 'GATE 4 [Policy Inventory Known State]:      % (Unknown policies: %)', 
    CASE WHEN v_gate_4_passed THEN 'PASSED' ELSE 'BLOCKED' END, v_unknown_policies_count;
  
  RAISE NOTICE 'GATE 5 [Schema Schema-Match - No updated_at]:% (workspace_memberships.updated_at exists: %)', 
    CASE WHEN v_gate_5_passed THEN 'PASSED' ELSE 'BLOCKED' END, v_has_wm_updated_at;
  
  RAISE NOTICE 'GATE 6 [Unique Constraints & Workspaces]:   % (UNIQUE(ws, user): %, Workspaces: %)', 
    CASE WHEN v_gate_6_passed THEN 'PASSED' ELSE 'BLOCKED' END, v_has_wm_unique_constraint, v_workspaces_count;
  RAISE NOTICE '------------------------------------------------------------------------------';

  IF NOT (v_gate_1_passed AND v_gate_2_passed AND v_gate_3_passed AND v_gate_4_passed AND v_gate_5_passed AND v_gate_6_passed) THEN
    RAISE NOTICE '>>> PREFLIGHT SAFETY VERDICT: BLOCKED. One or more critical safety gates require review. <<<';
  ELSE
    RAISE NOTICE '>>> PREFLIGHT SAFETY VERDICT: ALL GATES PASSED. Ready for Step 02 (Profile Repair). <<<';
  END IF;
  RAISE NOTICE '==============================================================================';
END $$;
