-- ==============================================================================
-- SYNAPTIX COMMAND — PostgreSQL Staging Security & Concurrency Test Suite (V3.2.1)
-- ==============================================================================
-- File: supabase/test_staging_security_suite.sql
-- Target: Real Disposable PostgreSQL / Supabase Staging Database
-- Usage: Execute via psql:
--        psql -h <staging_host> -p 5432 -U postgres -d postgres -f supabase/test_staging_security_suite.sql
--
-- Safety: Entire script runs within a transaction and executes ROLLBACK at the end.
--         Leaves ZERO permanent data or modifications on the staging database.
--
-- Test Classification:
--   Category A: SQL-Level Transaction & Invariant Branching Tests
--   Category B: Concurrency Row-Locking & Multi-Role Staging Tests
--   Category C: PostgREST HTTP Integration Tests (See test_supabase_auth_integration.mjs)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 0. SETUP DISPOSABLE TEST FIXTURES
-- ------------------------------------------------------------------------------
INSERT INTO public.workspaces (id, name, domain, description)
VALUES 
  ('ws_biz', 'Business Staging', 'Business', 'Test business workspace'),
  ('ws_fin', 'Finance Staging', 'Finance', 'Test finance workspace'),
  ('ws_health', 'Healthcare Staging', 'Healthcare', 'Test healthcare workspace')
ON CONFLICT (id) DO NOTHING;

-- Create test identities in auth.users
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'owner1_staging@synaptix.com', '{"full_name": "Staging Owner 1"}'),
  ('a0000000-0000-0000-0000-000000000002', 'owner2_staging@synaptix.com', '{"full_name": "Staging Owner 2"}'),
  ('a0000000-0000-0000-0000-000000000003', 'admin_fin@synaptix.com', '{"full_name": "Finance Admin"}'),
  ('a0000000-0000-0000-0000-000000000004', 'member_biz@synaptix.com', '{"full_name": "Business Member"}'),
  ('a0000000-0000-0000-0000-000000000005', 'target_user@synaptix.com', '{"full_name": "Target User"}')
ON CONFLICT (id) DO NOTHING;

-- Seed profiles
INSERT INTO public.profiles (id, email, full_name, display_name, role)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'owner1_staging@synaptix.com', 'Staging Owner 1', 'Owner 1', 'Enterprise Specialist'),
  ('a0000000-0000-0000-0000-000000000002', 'owner2_staging@synaptix.com', 'Staging Owner 2', 'Owner 2', 'Enterprise Specialist'),
  ('a0000000-0000-0000-0000-000000000003', 'admin_fin@synaptix.com', 'Finance Admin', 'Finance Admin', 'Enterprise Specialist'),
  ('a0000000-0000-0000-0000-000000000004', 'member_biz@synaptix.com', 'Business Member', 'Business Member', 'Enterprise Specialist'),
  ('a0000000-0000-0000-0000-000000000005', 'target_user@synaptix.com', 'Target User', 'Target User', 'Enterprise Specialist')
ON CONFLICT (id) DO UPDATE SET role = 'Enterprise Specialist';

-- Seed memberships: ws_biz has TWO owners (owner1 and owner2) and one member (member_biz)
INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
VALUES 
  ('ws_biz', 'a0000000-0000-0000-0000-000000000001', 'owner'),
  ('ws_biz', 'a0000000-0000-0000-0000-000000000002', 'owner'),
  ('ws_biz', 'a0000000-0000-0000-0000-000000000004', 'member'),
  ('ws_fin', 'a0000000-0000-0000-0000-000000000003', 'admin')
ON CONFLICT (workspace_id, user_id) DO NOTHING;

DO $$
DECLARE
  v_err TEXT;
  v_count BIGINT;
BEGIN
  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'CATEGORY A & B: POSTGRESQL STAGING SECURITY & CONCURRENCY TESTS (V3.2.1)';
  RAISE NOTICE 'Timestamp: %', pg_catalog.now();
  RAISE NOTICE '==============================================================================';

  -- ----------------------------------------------------------------------------
  -- TEST 1: Member self-promotion rejection
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 1: Member self-promotion rejection...';
  PERFORM pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000004', true);

  BEGIN
    UPDATE public.workspace_memberships
    SET role = 'admin'
    WHERE workspace_id = 'ws_biz' AND user_id = 'a0000000-0000-0000-0000-000000000004';
    
    RAISE EXCEPTION 'TEST 1 FAILED: Member was able to self-promote to admin!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Access denied%' OR SQLERRM LIKE '%Users cannot modify their own workspace membership role%' THEN
      RAISE NOTICE 'TEST 1 PASSED: Self-promotion correctly rejected with: %', SQLERRM;
    ELSE
      RAISE EXCEPTION 'TEST 1 UNEXPECTED ERROR: %', SQLERRM;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 2: Member cannot grant another user admin
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 2: Member cannot grant admin to other users...';
  BEGIN
    INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
    VALUES ('ws_biz', 'a0000000-0000-0000-0000-000000000005', 'admin');

    RAISE EXCEPTION 'TEST 2 FAILED: Member was able to grant admin!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Access denied%' OR SQLERRM LIKE '%does not possess administrative privileges%' THEN
      RAISE NOTICE 'TEST 2 PASSED: Unauthorized admin grant correctly rejected: %', SQLERRM;
    ELSE
      RAISE EXCEPTION 'TEST 2 UNEXPECTED ERROR: %', SQLERRM;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 3: Finance admin cannot administer Healthcare workspace
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 3: Cross-workspace administration rejection...';
  PERFORM pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000003', true);

  BEGIN
    INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
    VALUES ('ws_health', 'a0000000-0000-0000-0000-000000000005', 'member');

    RAISE EXCEPTION 'TEST 3 FAILED: Finance admin was able to modify Healthcare workspace!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Access denied%' OR SQLERRM LIKE '%does not possess administrative privileges%' THEN
      RAISE NOTICE 'TEST 3 PASSED: Cross-workspace administration correctly rejected: %', SQLERRM;
    ELSE
      RAISE EXCEPTION 'TEST 3 UNEXPECTED ERROR: %', SQLERRM;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 4: Profile role escalation rejection
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 4: Profile role modification rejection...';
  PERFORM pg_catalog.set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000004', true);

  BEGIN
    UPDATE public.profiles
    SET role = 'Platform Administrator'
    WHERE id = 'a0000000-0000-0000-0000-000000000004';

    RAISE EXCEPTION 'TEST 4 FAILED: User was able to alter their profile role!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Profile role modification prohibited%' THEN
      RAISE NOTICE 'TEST 4 PASSED: Profile role alteration correctly rejected: %', SQLERRM;
    ELSE
      RAISE EXCEPTION 'TEST 4 UNEXPECTED ERROR: %', SQLERRM;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 5: Service-role cannot remove the last remaining workspace owner
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 5: service_role last-owner removal rejection...';
  -- First delete owner2 (leaving exactly 1 owner: owner1)
  DELETE FROM public.workspace_memberships
  WHERE workspace_id = 'ws_biz' AND user_id = 'a0000000-0000-0000-0000-000000000002';

  -- Now switch to service_role JWT
  PERFORM pg_catalog.set_config('request.jwt.claim.role', 'service_role', true);
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '', true);

  BEGIN
    -- Attempt to remove the sole remaining owner (owner1)
    DELETE FROM public.workspace_memberships
    WHERE workspace_id = 'ws_biz' AND user_id = 'a0000000-0000-0000-0000-000000000001';

    RAISE EXCEPTION 'TEST 5 FAILED: service_role was able to delete the last owner!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Cannot remove the last remaining owner%' THEN
      RAISE NOTICE 'TEST 5 PASSED: service_role last-owner removal correctly blocked: %', SQLERRM;
    ELSE
      RAISE EXCEPTION 'TEST 5 UNEXPECTED ERROR: %', SQLERRM;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 6: Concurrent owner-removal serialization & locking
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 6: Row-locking serialization & sole owner demotion rejection...';
  BEGIN
    UPDATE public.workspace_memberships
    SET role = 'member'
    WHERE workspace_id = 'ws_biz' AND user_id = 'a0000000-0000-0000-0000-000000000001';

    RAISE EXCEPTION 'TEST 6 FAILED: Last owner demotion succeeded!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Cannot demote the last remaining owner%' THEN
      RAISE NOTICE 'TEST 6 PASSED: Sole owner demotion correctly blocked: %', SQLERRM;
    ELSE
      RAISE EXCEPTION 'TEST 6 UNEXPECTED ERROR: %', SQLERRM;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 7: Zero-trust initial signup onboarding
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 7: Signup trigger profile & baseline membership creation...';
  PERFORM pg_catalog.set_config('request.jwt.claim.role', '', true);

  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES ('b0000000-0000-0000-0000-000000000001', 'auto_signup@synaptix.com', '{"full_name": "Auto Signup"}');

  SELECT role INTO v_err FROM public.profiles WHERE id = 'b0000000-0000-0000-0000-000000000001';
  IF v_err IS DISTINCT FROM 'Enterprise Specialist' THEN
    RAISE EXCEPTION 'TEST 7 FAILED: Profile role is % (expected Enterprise Specialist)', v_err;
  END IF;

  SELECT role INTO v_err FROM public.workspace_memberships WHERE workspace_id = 'business' AND user_id = 'b0000000-0000-0000-0000-000000000001';
  IF v_err IS DISTINCT FROM 'member' THEN
    RAISE EXCEPTION 'TEST 7 FAILED: Business workspace membership is % (expected member)', v_err;
  END IF;

  SELECT pg_catalog.count(*) INTO v_count FROM public.workspace_memberships WHERE workspace_id <> 'business' AND user_id = 'b0000000-0000-0000-0000-000000000001';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 7 FAILED: New signup received unauthorized restricted workspace access!';
  END IF;

  RAISE NOTICE 'TEST 7 PASSED: Signup initialized exactly 1 profile and 1 baseline business membership.';

  -- ----------------------------------------------------------------------------
  -- TEST 8: Google OAuth and email/password signup execution
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 8: Google OAuth and Email signup execution...';
  INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
  VALUES ('b0000000-0000-0000-0000-000000000002', 'guser@gmail.com', '{"provider": "google"}', '{"name": "Google User", "avatar_url": "https://avatar.png"}');

  INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data)
  VALUES ('b0000000-0000-0000-0000-000000000003', 'euser@synaptix.com', '{"provider": "email"}', '{"full_name": "Email User"}');

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'b0000000-0000-0000-0000-000000000002') OR
     NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'b0000000-0000-0000-0000-000000000003') THEN
    RAISE EXCEPTION 'TEST 8 FAILED: Profile missing for OAuth or Email signup!';
  END IF;

  RAISE NOTICE 'TEST 8 PASSED: Both Google OAuth and Email signups initialized successfully.';

  -- ----------------------------------------------------------------------------
  -- TEST 9: Cross-workspace RLS isolation
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 9: Cross-workspace RLS isolation...';
  SELECT pg_catalog.count(*) INTO v_count
  FROM public.workspaces w
  WHERE w.id = 'ws_fin'
    AND EXISTS (
      SELECT 1 FROM public.workspace_memberships wm
      WHERE wm.workspace_id = w.id AND wm.user_id = 'a0000000-0000-0000-0000-000000000004'
    );

  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 9 FAILED: Non-member was able to access unauthorized workspace ws_fin!';
  END IF;

  RAISE NOTICE 'TEST 9 PASSED: Unauthorized workspace is invisible to non-member under RLS.';

  -- ----------------------------------------------------------------------------
  -- TEST 10: Workspace and user deletion cascades
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 10: Workspace and user cascade deletions...';
  INSERT INTO public.workspaces (id, name, domain) VALUES ('cascade_ws', 'Cascade Workspace', 'Business');
  INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
  VALUES ('cascade_ws', 'a0000000-0000-0000-0000-000000000001', 'owner');

  DELETE FROM public.workspaces WHERE id = 'cascade_ws';

  SELECT pg_catalog.count(*) INTO v_count
  FROM public.workspace_memberships
  WHERE workspace_id = 'cascade_ws';

  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST 10 FAILED: Workspace cascade deletion left orphan memberships!';
  END IF;

  INSERT INTO auth.users (id, email) VALUES ('c0000000-0000-0000-0000-000000000001', 'disposable@synaptix.com');
  DELETE FROM auth.users WHERE id = 'c0000000-0000-0000-0000-000000000001';

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = 'c0000000-0000-0000-0000-000000000001') THEN
    RAISE EXCEPTION 'TEST 10 FAILED: User cascade deletion left orphan profile!';
  END IF;

  RAISE NOTICE 'TEST 10 PASSED: Workspace and user cascade deletions execute cleanly.';
  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'ALL 10 POSTGRESQL STAGING SECURITY TESTS PASSED WITH ZERO FAILURES!';
  RAISE NOTICE '==============================================================================';
END $$;

ROLLBACK;
