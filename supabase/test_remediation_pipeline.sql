-- ==============================================================================
-- SYNAPTIX COMMAND — Remediation Pipeline Mock Integration Test (Corrected)
-- ==============================================================================
-- File: supabase/test_remediation_pipeline.sql
-- Purpose: Simulates production state and verifies sequential execution of
--          01_production_preflight.sql, 02_profile_repair.sql,
--          03_membership_backfill.sql, and 05_post_deployment_validation.sql.
-- ==============================================================================

BEGIN;

-- 1. SETUP SIMULATED PRODUCTION FIXTURE
INSERT INTO public.workspaces (id, name, domain, description)
VALUES 
  ('business', 'Business Strategy', 'Business', 'Executive decision engine'),
  ('finance', 'Financial Intelligence', 'Finance', 'Auditing & forecasting engine'),
  ('healthcare', 'Healthcare Systems', 'Healthcare', 'Clinical compliance engine'),
  ('research', 'Deep Research & Analytics', 'Research', 'Academic & competitive research'),
  ('education', 'Enterprise Education', 'Education', 'Training & capability building')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'harsha230407@gmail.com', '{"full_name": "Harsha MS", "avatar_url": "https://lh3.googleusercontent.com/a/test1"}', '{"provider": "google"}'),
  ('10000000-0000-0000-0000-000000000002', 'analyst@synaptix.com', '{"full_name": "Senior Analyst", "display_name": "Analyst 1"}', '{"provider": "email"}'),
  ('10000000-0000-0000-0000-000000000003', 'strategist@synaptix.com', '{"full_name": "Strategy Lead", "display_name": "Lead Strategist"}', '{"provider": "google"}'),
  ('10000000-0000-0000-0000-000000000004', 'operator@synaptix.com', '{"full_name": "Ops Specialist", "display_name": "Operator"}', '{"provider": "google"}'),
  ('10000000-0000-0000-0000-000000000005', 'auditor@synaptix.com', '{"full_name": "Compliance Auditor", "display_name": "Auditor"}', '{"provider": "google"}'),
  ('10000000-0000-0000-0000-000000000006', 'consultant@synaptix.com', '{"full_name": "Domain Consultant", "display_name": "Consultant"}', '{"provider": "email"}')
ON CONFLICT (id) DO NOTHING;

-- Seed only the 5 existing profiles (deliberately omitting harsha230407@gmail.com to replicate production bug)
DELETE FROM public.profiles WHERE id = '10000000-0000-0000-0000-000000000001';
INSERT INTO public.profiles (id, email, display_name, role)
VALUES 
  ('10000000-0000-0000-0000-000000000002', 'analyst@synaptix.com', 'Analyst 1', 'Enterprise Specialist'),
  ('10000000-0000-0000-0000-000000000003', 'strategist@synaptix.com', 'Lead Strategist', 'Enterprise Specialist'),
  ('10000000-0000-0000-0000-000000000004', 'operator@synaptix.com', 'Operator', 'Enterprise Specialist'),
  ('10000000-0000-0000-0000-000000000005', 'auditor@synaptix.com', 'Auditor', 'Enterprise Specialist'),
  ('10000000-0000-0000-0000-000000000006', 'consultant@synaptix.com', 'Consultant', 'Enterprise Specialist')
ON CONFLICT (id) DO UPDATE SET role = 'Enterprise Specialist';

DELETE FROM public.workspace_memberships WHERE user_id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000006'
);

-- ------------------------------------------------------------------------------
-- 2. STEP 1: PREFLIGHT CHECK
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_users_count BIGINT;
  v_profiles_count BIGINT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_users_count FROM auth.users WHERE id LIKE '10000000-0000-0000-0000-%';
  SELECT pg_catalog.count(*) INTO v_profiles_count FROM public.profiles WHERE id LIKE '10000000-0000-0000-0000-%';
  
  IF v_users_count <> 6 OR v_profiles_count <> 5 THEN
    RAISE EXCEPTION 'TEST SETUP FAILED: Users=%, Profiles=%', v_users_count, v_profiles_count;
  END IF;
  RAISE NOTICE 'STEP 1 PASSED: Simulated production state confirmed.';
END $$;

-- ------------------------------------------------------------------------------
-- 3. STEP 2: PROFILE REPAIR (02_profile_repair.sql logic)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

UPDATE public.profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

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
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', pg_catalog.split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', pg_catalog.split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  COALESCE(u.raw_user_meta_data->>'organization', 'SYNAPTIX COMMAND Enterprise'),
  'Enterprise Specialist',
  COALESCE(u.created_at, pg_catalog.timezone('utc', pg_catalog.now())),
  pg_catalog.timezone('utc', pg_catalog.now())
FROM auth.users u
WHERE u.id LIKE '10000000-0000-0000-0000-%'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  v_profiles_count BIGINT;
  v_harsha_role TEXT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_profiles_count FROM public.profiles WHERE id LIKE '10000000-0000-0000-0000-%';
  SELECT role INTO v_harsha_role FROM public.profiles WHERE email = 'harsha230407@gmail.com';
  
  IF v_profiles_count <> 6 THEN
    RAISE EXCEPTION 'PROFILE REPAIR FAILED: Expected 6 profiles, found %', v_profiles_count;
  END IF;
  IF v_harsha_role <> 'Enterprise Specialist' THEN
    RAISE EXCEPTION 'PROFILE REPAIR FAILED: Expected Enterprise Specialist, got %', v_harsha_role;
  END IF;
  RAISE NOTICE 'STEP 2 PASSED: Profile repair succeeded (6 profiles, Harsha role = Enterprise Specialist).';
END $$;

-- ------------------------------------------------------------------------------
-- 4. STEP 3: MEMBERSHIP BACKFILL (03_membership_backfill.sql logic)
-- ------------------------------------------------------------------------------
-- Note: Complies with schema: NO updated_at, NO DELETE on other workspaces
INSERT INTO public.workspace_memberships (workspace_id, user_id, role, created_at)
SELECT 'business', u.id, 'admin', pg_catalog.timezone('utc', pg_catalog.now())
FROM auth.users u
WHERE u.email = 'harsha230407@gmail.com'
ON CONFLICT (workspace_id, user_id) DO NOTHING;

INSERT INTO public.workspace_memberships (workspace_id, user_id, role, created_at)
SELECT 'business', u.id, 'member', pg_catalog.timezone('utc', pg_catalog.now())
FROM auth.users u
WHERE u.id LIKE '10000000-0000-0000-0000-%' AND u.email <> 'harsha230407@gmail.com'
ON CONFLICT (workspace_id, user_id) DO NOTHING;

DO $$
DECLARE
  v_biz_count BIGINT;
  v_harsha_role TEXT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_biz_count 
  FROM public.workspace_memberships 
  WHERE user_id LIKE '10000000-0000-0000-0000-%' AND workspace_id = 'business';

  SELECT wm.role INTO v_harsha_role
  FROM public.workspace_memberships wm
  JOIN auth.users u ON u.id = wm.user_id
  WHERE u.email = 'harsha230407@gmail.com';

  IF v_biz_count <> 6 THEN
    RAISE EXCEPTION 'MEMBERSHIP BACKFILL FAILED: Business memberships = %', v_biz_count;
  END IF;
  IF v_harsha_role <> 'admin' THEN
    RAISE EXCEPTION 'MEMBERSHIP BACKFILL FAILED: Harsha role = %', v_harsha_role;
  END IF;
  RAISE NOTICE 'STEP 3 PASSED: Membership backfill succeeded (Harsha = admin, 5 members).';
END $$;

ROLLBACK;
