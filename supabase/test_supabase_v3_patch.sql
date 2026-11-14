-- ==============================================================================
-- SYNAPTIX COMMAND — Live PostgreSQL Integration Test Script for V3.1 Security Patch
-- ==============================================================================
-- File: supabase/test_supabase_v3_patch.sql
-- Usage: Execute in disposable local PostgreSQL / Supabase instance:
--        psql -h localhost -p 54322 -U postgres -d postgres -f supabase/test_supabase_v3_patch.sql
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. SETUP TEST FIXTURES
-- ------------------------------------------------------------------------------
INSERT INTO public.workspaces (id, name, domain, description)
VALUES ('test_ws', 'Test Workspace', 'Business', 'Test sandbox workspace')
ON CONFLICT (id) DO NOTHING;

-- Create test identities in auth.users
INSERT INTO auth.users (id, email)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'owner1@synaptix.com'),
  ('22222222-2222-2222-2222-222222222222', 'owner2@synaptix.com'),
  ('33333333-3333-3333-3333-333333333333', 'admin1@synaptix.com'),
  ('44444444-4444-4444-4444-444444444444', 'member1@synaptix.com')
ON CONFLICT (id) DO NOTHING;

-- Seed memberships
INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
VALUES 
  ('test_ws', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('test_ws', '33333333-3333-3333-3333-333333333333', 'admin'),
  ('test_ws', '44444444-4444-4444-4444-444444444444', 'member')
ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;

DO $$
DECLARE
  v_err_caught BOOLEAN := false;
  v_rec RECORD;
BEGIN
  -- ----------------------------------------------------------------------------
  -- TEST 1: service_role last-owner DELETE rejection
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 1: service_role last-owner DELETE rejection...';
  SET LOCAL ROLE service_role;
  BEGIN
    DELETE FROM public.workspace_memberships
    WHERE workspace_id = 'test_ws' AND user_id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST 1 FAILED: service_role was able to delete the sole owner!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Cannot remove the last remaining owner%' THEN
      RAISE NOTICE 'TEST 1 PASSED: service_role DELETE correctly blocked: %', SQLERRM;
    ELSE
      RAISE;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 2: service_role last-owner demotion rejection
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 2: service_role last-owner demotion rejection...';
  BEGIN
    UPDATE public.workspace_memberships
    SET role = 'member'
    WHERE workspace_id = 'test_ws' AND user_id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST 2 FAILED: service_role was able to demote the sole owner!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Cannot demote the last remaining owner%' THEN
      RAISE NOTICE 'TEST 2 PASSED: service_role demotion correctly blocked: %', SQLERRM;
    ELSE
      RAISE;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 3: service_role NULL role rejection on INSERT
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 3: service_role NULL role rejection on INSERT...';
  BEGIN
    INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
    VALUES ('test_ws', '22222222-2222-2222-2222-222222222222', NULL);
    RAISE EXCEPTION 'TEST 3 FAILED: service_role was able to insert a NULL role!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Invalid workspace role%' OR SQLERRM LIKE '%null value in column%' THEN
      RAISE NOTICE 'TEST 3 PASSED: NULL role INSERT correctly rejected: %', SQLERRM;
    ELSE
      RAISE;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 4: service_role invalid role rejection ('superadmin')
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 4: service_role invalid role rejection...';
  BEGIN
    INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
    VALUES ('test_ws', '22222222-2222-2222-2222-222222222222', 'superadmin');
    RAISE EXCEPTION 'TEST 4 FAILED: service_role was able to insert invalid role superadmin!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Invalid workspace role%' OR SQLERRM LIKE '%check constraint%' THEN
      RAISE NOTICE 'TEST 4 PASSED: Invalid role correctly rejected: %', SQLERRM;
    ELSE
      RAISE;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 5: service_role ownership transfer (successor promotion then predecessor demotion)
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 5: service_role ownership transfer...';
  INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
  VALUES ('test_ws', '22222222-2222-2222-2222-222222222222', 'owner')
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = 'owner';

  UPDATE public.workspace_memberships
  SET role = 'admin'
  WHERE workspace_id = 'test_ws' AND user_id = '11111111-1111-1111-1111-111111111111';

  RAISE NOTICE 'TEST 5 PASSED: Ownership transfer succeeded without error.';

  -- Reset ownership back to user 1 for subsequent tests
  UPDATE public.workspace_memberships SET role = 'owner' WHERE workspace_id = 'test_ws' AND user_id = '11111111-1111-1111-1111-111111111111';
  DELETE FROM public.workspace_memberships WHERE workspace_id = 'test_ws' AND user_id = '22222222-2222-2222-2222-222222222222';

  -- ----------------------------------------------------------------------------
  -- TEST 6: Authenticated owner last-owner DELETE rejection
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 6: Authenticated owner last-owner DELETE rejection...';
  PERFORM set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111", "role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  BEGIN
    DELETE FROM public.workspace_memberships
    WHERE workspace_id = 'test_ws' AND user_id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST 6 FAILED: Authenticated owner was able to delete the sole owner!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Cannot remove the last remaining owner%' THEN
      RAISE NOTICE 'TEST 6 PASSED: Authenticated owner DELETE correctly blocked: %', SQLERRM;
    ELSE
      RAISE;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 7: Authenticated administrator attempting to remove owner rejection
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 7: Authenticated admin attempting to remove owner...';
  PERFORM set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333", "role":"authenticated"}', true);
  BEGIN
    DELETE FROM public.workspace_memberships
    WHERE workspace_id = 'test_ws' AND user_id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION 'TEST 7 FAILED: Admin was able to remove owner!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Only an existing workspace owner can remove a workspace owner%' THEN
      RAISE NOTICE 'TEST 7 PASSED: Admin owner removal correctly blocked: %', SQLERRM;
    ELSE
      RAISE;
    END IF;
  END;

  -- ----------------------------------------------------------------------------
  -- TEST 8: Workspace deletion cascading membership deletion
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 8: Workspace deletion cascading check...';
  RESET ROLE;
  SET LOCAL ROLE service_role;
  INSERT INTO public.workspaces (id, name, domain) VALUES ('cascade_ws', 'Cascade Workspace', 'Business')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.workspace_memberships (workspace_id, user_id, role)
  VALUES ('cascade_ws', '11111111-1111-1111-1111-111111111111', 'owner');

  DELETE FROM public.workspaces WHERE id = 'cascade_ws';
  SELECT COUNT(*) INTO v_rec FROM public.workspace_memberships WHERE workspace_id = 'cascade_ws';
  IF v_rec.count = 0 THEN
    RAISE NOTICE 'TEST 8 PASSED: ON DELETE CASCADE cleaned up all memberships automatically.';
  ELSE
    RAISE EXCEPTION 'TEST 8 FAILED: Cascade deletion failed!';
  END IF;

  -- ----------------------------------------------------------------------------
  -- TEST 9: Signup Trigger execution with COALESCE (auth.users trigger)
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 9: Signup profile creation via handle_new_user()...';
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    '55555555-5555-5555-5555-555555555555',
    'signup_test@synaptix.com',
    '{"full_name":"Signup Test User", "organization":"Synaptix Corp"}'::jsonb
  );

  SELECT * INTO v_rec FROM public.profiles WHERE id = '55555555-5555-5555-5555-555555555555';
  IF v_rec.full_name = 'Signup Test User' AND v_rec.role = 'Enterprise Specialist' THEN
    RAISE NOTICE 'TEST 9 PASSED: handle_new_user() executed cleanly with COALESCE: % (Role: %)', v_rec.full_name, v_rec.role;
  ELSE
    RAISE EXCEPTION 'TEST 9 FAILED: Profile not created as expected!';
  END IF;

  -- ----------------------------------------------------------------------------
  -- TEST 10: Client Profile Privilege Escalation Blocked
  -- ----------------------------------------------------------------------------
  RAISE NOTICE '>>> TEST 10: Client profile role escalation rejection...';
  PERFORM set_config('request.jwt.claims', '{"sub":"55555555-5555-5555-5555-555555555555", "role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = '55555555-5555-5555-5555-555555555555';

  SELECT role INTO v_rec FROM public.profiles WHERE id = '55555555-5555-5555-5555-555555555555';
  IF v_rec.role = 'Enterprise Specialist' THEN
    RAISE NOTICE 'TEST 10 PASSED: Attempted role escalation silently neutralized to %', v_rec.role;
  ELSE
    RAISE EXCEPTION 'TEST 10 FAILED: User was able to escalate role to %!', v_rec.role;
  END IF;

END $$;

RESET ROLE;
ROLLBACK;
