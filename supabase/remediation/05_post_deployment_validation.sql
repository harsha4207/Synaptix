-- ==============================================================================
-- SYNAPTIX COMMAND — Post-Deployment Validation Script (V3.2 Standard)
-- ==============================================================================
-- File: supabase/remediation/05_post_deployment_validation.sql
-- Target: Supabase SQL Editor (Production Database)
-- Access Mode: READ-ONLY Verification (Comprehensive Invariant Testing)
-- ==============================================================================

DO $$
DECLARE
  v_users_count BIGINT;
  v_profiles_count BIGINT;
  v_unmatched_profiles BIGINT;
  v_non_enterprise_profiles BIGINT;
  v_harsha_profile_role TEXT;
  v_harsha_user_id UUID;

  v_business_memberships BIGINT;
  v_harsha_ws_role TEXT;
  v_admin_count BIGINT;
  v_member_count BIGINT;
  v_duplicate_business_users BIGINT;
  v_unmapped_business_users BIGINT;

  v_signup_trig_enabled "char";
  v_signup_proc_secdef BOOLEAN;
  v_admin_func_secdef BOOLEAN;
  v_owner_func_secdef BOOLEAN;

  v_profiles_rls BOOLEAN;
  v_profiles_force_rls BOOLEAN;
  v_memberships_rls BOOLEAN;
  v_memberships_force_rls BOOLEAN;
  v_workspaces_rls BOOLEAN;
  v_workspaces_force_rls BOOLEAN;
  v_unknown_policies BIGINT;
  v_restricted_ws_count BIGINT;
  v_restricted_memberships BIGINT;
BEGIN
  -- 1. Profiles audit
  SELECT pg_catalog.count(*) INTO v_users_count FROM auth.users;
  SELECT pg_catalog.count(*) INTO v_profiles_count FROM public.profiles;

  SELECT pg_catalog.count(*) INTO v_unmatched_profiles
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.id IS NULL;

  SELECT pg_catalog.count(*) INTO v_non_enterprise_profiles
  FROM public.profiles
  WHERE role IS DISTINCT FROM 'Enterprise Specialist';

  SELECT id INTO v_harsha_user_id FROM auth.users WHERE email = 'harsha230407@gmail.com';

  SELECT role INTO v_harsha_profile_role
  FROM public.profiles
  WHERE id = v_harsha_user_id;

  -- 2. Business Strategy memberships audit
  SELECT pg_catalog.count(*) INTO v_business_memberships
  FROM public.workspace_memberships
  WHERE workspace_id = 'business';

  SELECT pg_catalog.count(*) INTO v_duplicate_business_users
  FROM (
    SELECT user_id, pg_catalog.count(*) 
    FROM public.workspace_memberships 
    WHERE workspace_id = 'business' 
    GROUP BY user_id 
    HAVING pg_catalog.count(*) > 1
  ) sub;

  SELECT pg_catalog.count(*) INTO v_unmapped_business_users
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workspace_memberships wm
    WHERE wm.workspace_id = 'business' AND wm.user_id = u.id
  );

  SELECT wm.role INTO v_harsha_ws_role
  FROM public.workspace_memberships wm
  WHERE wm.workspace_id = 'business' AND wm.user_id = v_harsha_user_id;

  SELECT pg_catalog.count(*) INTO v_admin_count
  FROM public.workspace_memberships
  WHERE workspace_id = 'business' AND role = 'admin';

  SELECT pg_catalog.count(*) INTO v_member_count
  FROM public.workspace_memberships
  WHERE workspace_id = 'business' AND role = 'member';

  -- 3. Restricted workspace audit
  SELECT pg_catalog.count(*) INTO v_restricted_ws_count
  FROM public.workspaces
  WHERE id IN ('finance', 'healthcare', 'research', 'education');

  SELECT pg_catalog.count(*) INTO v_restricted_memberships
  FROM public.workspace_memberships
  WHERE workspace_id IN ('finance', 'healthcare', 'research', 'education');

  -- 4. Trigger & Function checks
  SELECT tr.tgenabled INTO v_signup_trig_enabled
  FROM pg_catalog.pg_trigger tr
  JOIN pg_catalog.pg_class rel ON rel.oid = tr.tgrelid
  WHERE tr.tgname = 'on_auth_user_created' AND rel.relname = 'users';

  SELECT prosecdef INTO v_signup_proc_secdef
  FROM pg_catalog.pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace;

  SELECT prosecdef INTO v_admin_func_secdef
  FROM pg_catalog.pg_proc WHERE proname = 'is_workspace_admin' AND pronamespace = 'public'::regnamespace;

  SELECT prosecdef INTO v_owner_func_secdef
  FROM pg_catalog.pg_proc WHERE proname = 'is_workspace_owner' AND pronamespace = 'public'::regnamespace;

  -- 5. RLS & Policy checks
  SELECT relrowsecurity, relforcerowsecurity INTO v_profiles_rls, v_profiles_force_rls
  FROM pg_catalog.pg_class WHERE relname = 'profiles' AND relnamespace = 'public'::regnamespace;

  SELECT relrowsecurity, relforcerowsecurity INTO v_memberships_rls, v_memberships_force_rls
  FROM pg_catalog.pg_class WHERE relname = 'workspace_memberships' AND relnamespace = 'public'::regnamespace;

  SELECT relrowsecurity, relforcerowsecurity INTO v_workspaces_rls, v_workspaces_force_rls
  FROM pg_catalog.pg_class WHERE relname = 'workspaces' AND relnamespace = 'public'::regnamespace;

  -- Check for unknown/unclassified policies
  SELECT pg_catalog.count(*) INTO v_unknown_policies
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'workspace_memberships', 'workspaces')
    AND policyname NOT IN (
      'profiles_select_policy',
      'profiles_update_policy',
      'profiles_insert_policy',
      'workspace_memberships_select_policy',
      'workspace_memberships_insert_policy',
      'workspace_memberships_update_policy',
      'workspace_memberships_delete_policy',
      'workspaces_select_policy'
    );

  -- Print Diagnostic Report
  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'SYNAPTIX COMMAND — V3.2 REMEDIATION VALIDATION REPORT';
  RAISE NOTICE '==============================================================================';
  RAISE NOTICE '1. PROFILES AUDIT:';
  RAISE NOTICE '   - Total auth.users:                 %', v_users_count;
  RAISE NOTICE '   - Total public.profiles:            %', v_profiles_count;
  RAISE NOTICE '   - Accounts missing profiles:        %', v_unmatched_profiles;
  RAISE NOTICE '   - Profiles with non-Enterprise role:%', v_non_enterprise_profiles;
  RAISE NOTICE '   - harsha230407@gmail.com role:      %', COALESCE(v_harsha_profile_role, 'NOT FOUND');
  RAISE NOTICE '------------------------------------------------------------------------------';
  RAISE NOTICE '2. BUSINESS STRATEGY WORKSPACE AUDIT:';
  RAISE NOTICE '   - Total "business" memberships:     %', v_business_memberships;
  RAISE NOTICE '   - Duplicate memberships in business:%', v_duplicate_business_users;
  RAISE NOTICE '   - Accounts lacking business member: %', v_unmapped_business_users;
  RAISE NOTICE '   - harsha230407@gmail.com WS role:   %', COALESCE(v_harsha_ws_role, 'NOT FOUND');
  RAISE NOTICE '   - Total Admins in business:         %', v_admin_count;
  RAISE NOTICE '   - Total Members in business:        %', v_member_count;
  RAISE NOTICE '------------------------------------------------------------------------------';
  RAISE NOTICE '3. RESTRICTED WORKSPACE AUDIT:';
  RAISE NOTICE '   - Restricted workspaces present:    %', v_restricted_ws_count;
  RAISE NOTICE '   - Restricted workspace memberships: %', v_restricted_memberships;
  RAISE NOTICE '------------------------------------------------------------------------------';
  RAISE NOTICE '4. SECURITY & POLICY HARDENING AUDIT:';
  RAISE NOTICE '   - profiles RLS / FORCE RLS:         % / %', v_profiles_rls, v_profiles_force_rls;
  RAISE NOTICE '   - workspace_memberships RLS / FORCE:% / %', v_memberships_rls, v_memberships_force_rls;
  RAISE NOTICE '   - workspaces RLS / FORCE RLS:       % / %', v_workspaces_rls, v_workspaces_force_rls;
  RAISE NOTICE '   - Unknown / Extraneous Policies:    %', v_unknown_policies;
  RAISE NOTICE '   - on_auth_user_created enabled:     % (State: %)', (v_signup_trig_enabled = 'O'), v_signup_trig_enabled;
  RAISE NOTICE '   - handle_new_user SECURITY DEFINER: %', v_signup_proc_secdef;
  RAISE NOTICE '   - is_workspace_admin SEC DEFINER:   %', v_admin_func_secdef;
  RAISE NOTICE '   - is_workspace_owner SEC DEFINER:   %', v_owner_func_secdef;
  RAISE NOTICE '==============================================================================';

  -- Hard Assertions Evaluation
  IF v_profiles_count <> 6 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: Expected 6 profiles, found %!', v_profiles_count;
  END IF;

  IF v_unmatched_profiles > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: % auth.users accounts still lack a profile record!', v_unmatched_profiles;
  END IF;

  IF v_non_enterprise_profiles > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: % profile(s) have roles other than "Enterprise Specialist"!', v_non_enterprise_profiles;
  END IF;

  IF v_business_memberships <> 6 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: Expected 6 memberships in "business" workspace, found %!', v_business_memberships;
  END IF;

  IF v_duplicate_business_users > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: Found users with duplicate memberships in "business" workspace!';
  END IF;

  IF v_unmapped_business_users > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: % user(s) lack a membership in "business" workspace!', v_unmapped_business_users;
  END IF;

  IF v_harsha_ws_role <> 'admin' THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: harsha230407@gmail.com workspace role is "%", expected "admin"!', v_harsha_ws_role;
  END IF;

  IF v_admin_count <> 1 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: Expected exactly 1 admin in "business" workspace, found %!', v_admin_count;
  END IF;

  IF v_member_count <> 5 THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: Expected exactly 5 members in "business" workspace, found %!', v_member_count;
  END IF;

  IF v_signup_trig_enabled <> 'O' THEN
    RAISE EXCEPTION 'VALIDATION FAILURE: on_auth_user_created trigger is not enabled (status: %)!', v_signup_trig_enabled;
  END IF;

  IF v_unknown_policies > 0 THEN
    RAISE WARNING 'SECURITY AUDIT: % unexpected/application-specific policy(ies) detected in catalog.', v_unknown_policies;
  END IF;

  RAISE NOTICE '>>> [ALL 10 REMEDIATION VALIDATION CHECKS PASSED SUCCESSFULLY] <<<';
END $$;

-- Display Verified Catalog Views
SELECT 
  w.id AS workspace_id,
  w.name AS workspace_name,
  u.email AS user_email,
  p.role AS profile_role,
  wm.role AS workspace_role,
  wm.created_at
FROM public.workspaces w
LEFT JOIN public.workspace_memberships wm ON wm.workspace_id = w.id
LEFT JOIN auth.users u ON u.id = wm.user_id
LEFT JOIN public.profiles p ON p.id = wm.user_id
ORDER BY w.id ASC, wm.role ASC, u.email ASC;

SELECT schemaname, tablename, policyname, permissive, cmd, roles
FROM pg_catalog.pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'workspace_memberships', 'workspaces')
ORDER BY tablename, cmd, policyname;
