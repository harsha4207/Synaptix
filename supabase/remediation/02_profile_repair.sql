-- ==============================================================================
-- SYNAPTIX COMMAND — Safe Profile Repair Script (V3.2.1 Standard)
-- ==============================================================================
-- File: supabase/remediation/02_profile_repair.sql
-- Target: Supabase SQL Editor (Production Database)
-- Access Mode: Transaction-Protected Write (Safe, Non-Destructive, Idempotent)
-- ==============================================================================

BEGIN;

-- 1. Non-destructively add extended columns if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 2. Non-destructively populate full_name ONLY where full_name is NULL
-- Existing full_name, display_name, email, organization, and roles are preserved.
UPDATE public.profiles
SET full_name = display_name
WHERE full_name IS NULL 
  AND display_name IS NOT NULL;

-- 3. Idempotently insert ONLY genuinely missing profiles (specifically harsha230407@gmail.com)
-- Does NOT touch, overwrite, or mutate any pre-existing profile record.
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
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    pg_catalog.split_part(u.email, '@', 1)
  ) AS full_name,
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    pg_catalog.split_part(u.email, '@', 1)
  ) AS display_name,
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ) AS avatar_url,
  COALESCE(
    u.raw_user_meta_data->>'organization',
    'SYNAPTIX COMMAND Enterprise'
  ) AS organization,
  'Enterprise Specialist' AS role,
  COALESCE(u.created_at, pg_catalog.timezone('utc', pg_catalog.now())) AS created_at,
  pg_catalog.timezone('utc', pg_catalog.now()) AS updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. Programmatic Assertions
DO $$
DECLARE
  v_users_count BIGINT;
  v_profiles_count BIGINT;
  v_missing_profiles BIGINT;
  v_harsha_role TEXT;
BEGIN
  SELECT pg_catalog.count(*) INTO v_users_count FROM auth.users;
  SELECT pg_catalog.count(*) INTO v_profiles_count FROM public.profiles;

  SELECT pg_catalog.count(*) INTO v_missing_profiles
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.id IS NULL;

  SELECT role INTO v_harsha_role
  FROM public.profiles
  WHERE email = 'harsha230407@gmail.com';

  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'PROFILE REPAIR AUDIT (V3.2.1):';
  RAISE NOTICE 'Total auth.users:                 %', v_users_count;
  RAISE NOTICE 'Total public.profiles:            %', v_profiles_count;
  RAISE NOTICE 'Missing profiles remaining:       %', v_missing_profiles;
  RAISE NOTICE 'harsha230407@gmail.com role:      %', COALESCE(v_harsha_role, 'NOT FOUND');
  RAISE NOTICE '==============================================================================';

  IF v_missing_profiles > 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: % auth.users accounts still lack a profile record!', v_missing_profiles;
  END IF;

  IF v_harsha_role IS NULL THEN
    RAISE EXCEPTION 'ASSERTION FAILED: Profile for harsha230407@gmail.com was not created!';
  END IF;

  IF v_harsha_role <> 'Enterprise Specialist' THEN
    RAISE EXCEPTION 'SECURITY INVARIANT VIOLATION: harsha230407@gmail.com role is "%", expected "Enterprise Specialist"!', v_harsha_role;
  END IF;

  RAISE NOTICE '[SUCCESS] Profile repair verified: All accounts have profiles with Enterprise Specialist role.';
END $$;

COMMIT;

-- 5. Display Repaired Profiles
SELECT id, email, display_name, full_name, role, organization, created_at, updated_at
FROM public.profiles
ORDER BY created_at ASC;
