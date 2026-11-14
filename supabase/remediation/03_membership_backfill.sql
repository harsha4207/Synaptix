-- ==============================================================================
-- SYNAPTIX COMMAND — Strict Allowlist Membership Backfill Script (V3.2.2 Standard)
-- ==============================================================================
-- File: supabase/remediation/03_membership_backfill.sql
-- Target: Supabase SQL Editor (Production Database)
-- Access Mode: Transaction-Protected Write (Safe, Non-Destructive, Idempotent)
-- ==============================================================================
-- REQUIREMENTS:
-- 1. Exact Six-Account Allowlist:
--    Explicit approved identity mapping containing all six approved email addresses
--    and their exact auth.users UUIDs.
--    - Verify all six UUID/email pairs.
--    - Verify no unexpected account exists in auth.users.
--    - Verify no approved account is missing.
--    - Abort on any mismatch.
--    - Never automatically grant access to an unexpected account.
--    - Do not invent UUIDs or email addresses; extract via 01_production_preflight.sql.
-- 2. Existing Membership Conflict Inspection:
--    Inspect existing memberships in 'business' before inserting.
--    If an account has an unexpected role, report:
--      user_id, email, current_role, expected_role
--    and ABORT immediately without overwriting.
-- 3. Schema Conformance:
--    public.workspace_memberships has NO updated_at column.
--    Columns: (id, workspace_id, user_id, role, created_at)
-- 4. Conflict Handling:
--    Uses ON CONFLICT (workspace_id, user_id) DO NOTHING.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. APPROVED IDENTITY ALLOWLIST TABLE DEFINITION
-- ------------------------------------------------------------------------------
-- Create temporary transaction-bound allowlist table
CREATE TEMP TABLE approved_identity_allowlist (
  email TEXT PRIMARY KEY,
  user_id UUID,
  approved_role TEXT NOT NULL CHECK (approved_role IN ('admin', 'member'))
) ON COMMIT DROP;

-- ------------------------------------------------------------------------------
-- 2. POPULATE APPROVED IDENTITY ALLOWLIST (EXPLICIT SIX-ACCOUNT MAPPING)
-- ------------------------------------------------------------------------------
-- INSTRUCTIONS:
-- Run 01_production_preflight.sql (Query 2) to extract the exact 6 auth.users UUIDs.
-- Verify each email against the authorized organization roster, then confirm UUIDs.
-- Account 1 is authorized as 'admin' (Harsha MS).
-- Accounts 2-6 are authorized as baseline 'member's.
-- Placeholder values (<UUID_FROM_PREFLIGHT>) will cause an immediate safety gate abort.

INSERT INTO approved_identity_allowlist (email, user_id, approved_role) VALUES
  ('harsha230407@gmail.com', '<HARSHA_AUTH_USER_UUID>', 'admin'),
  ('<APPROVED_ACCOUNT_2_EMAIL>', '<MEMBER_2_UUID>', 'member'),
  ('<APPROVED_ACCOUNT_3_EMAIL>', '<MEMBER_3_UUID>', 'member'),
  ('<APPROVED_ACCOUNT_4_EMAIL>', '<MEMBER_4_UUID>', 'member'),
  ('<APPROVED_ACCOUNT_5_EMAIL>', '<MEMBER_5_UUID>', 'member'),
  ('<APPROVED_ACCOUNT_6_EMAIL>', '<MEMBER_6_UUID>', 'member');

-- ------------------------------------------------------------------------------
-- 3. STRICT SECURITY GATES & IDENTITY VERIFICATION
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_allowlist_count BIGINT;
  v_total_users BIGINT;
  v_total_profiles BIGINT;
  v_business_ws_exists BOOLEAN;
  v_rec RECORD;
BEGIN
  -- Gate 0: Verify canonical 'business' workspace exists
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = 'business'
  ) INTO v_business_ws_exists;

  IF NOT v_business_ws_exists THEN
    RAISE EXCEPTION 'PRECONDITION FAILED: Canonical workspace "business" not found in public.workspaces!';
  END IF;

  -- Gate 1: Check for unpopulated template placeholders in allowlist
  SELECT pg_catalog.count(*) INTO v_allowlist_count FROM approved_identity_allowlist;
  IF v_allowlist_count <> 6 THEN
    RAISE EXCEPTION 'SECURITY GATE: approved_identity_allowlist must contain exactly 6 entries (found %)!', v_allowlist_count;
  END IF;

  IF EXISTS (
    SELECT 1 FROM approved_identity_allowlist 
    WHERE email LIKE '<%' OR email LIKE '%placeholder%' OR user_id IS NULL
  ) THEN
    RAISE EXCEPTION 'SECURITY GATE: approved_identity_allowlist contains unpopulated placeholder entries! Run 01_production_preflight.sql to obtain the exact 6 UUID/email pairs and confirm mapping before execution.';
  END IF;

  -- Gate 2: Verify auth.users count is exactly 6
  SELECT pg_catalog.count(*) INTO v_total_users FROM auth.users;
  IF v_total_users <> 6 THEN
    RAISE EXCEPTION 'SECURITY GATE: Account count mismatch! auth.users contains % accounts, expected exactly 6. Aborting to prevent unapproved account backfill.', v_total_users;
  END IF;

  -- Gate 3: Verify public.profiles count is exactly 6
  SELECT pg_catalog.count(*) INTO v_total_profiles FROM public.profiles;
  IF v_total_profiles <> 6 THEN
    RAISE EXCEPTION 'PRECONDITION FAILED: public.profiles contains % profiles, expected exactly 6. Run 02_profile_repair.sql first.', v_total_profiles;
  END IF;

  -- Gate 4: Verify all six UUID/email pairs match auth.users exactly
  FOR v_rec IN 
    SELECT a.email, a.user_id, a.approved_role, u.id AS auth_id
    FROM approved_identity_allowlist a
    LEFT JOIN auth.users u ON u.email = a.email
  LOOP
    IF v_rec.auth_id IS NULL THEN
      RAISE EXCEPTION 'SECURITY GATE: Approved account "%" does not exist in auth.users!', v_rec.email;
    END IF;
    IF v_rec.auth_id <> v_rec.user_id THEN
      RAISE EXCEPTION 'SECURITY GATE: UUID mismatch for account "%"! Allowlist UUID: %, actual auth.users UUID: %', v_rec.email, v_rec.user_id, v_rec.auth_id;
    END IF;
  END LOOP;

  -- Gate 5: Verify no unexpected account exists in auth.users
  FOR v_rec IN
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN approved_identity_allowlist a ON a.user_id = u.id AND a.email = u.email
    WHERE a.email IS NULL
  LOOP
    RAISE EXCEPTION 'SECURITY GATE: Unexpected account found in auth.users: "%" (UUID: %)! Not in approved allowlist. Aborting.', v_rec.email, v_rec.id;
  END LOOP;

  -- Gate 6: Pre-backfill membership conflict inspection
  -- If any account already has an unexpected role in 'business', report details and ABORT.
  FOR v_rec IN
    SELECT 
      wm.user_id,
      u.email,
      wm.role AS current_role,
      a.approved_role AS expected_role
    FROM public.workspace_memberships wm
    JOIN auth.users u ON u.id = wm.user_id
    JOIN approved_identity_allowlist a ON a.user_id = u.id
    WHERE wm.workspace_id = 'business'
      AND wm.role <> a.approved_role
  LOOP
    RAISE EXCEPTION 'CONFLICT DETECTED in "business" workspace! Account: % (UUID: %), Current Role: "%", Expected Role: "%". Silent role overwrite is prohibited. Aborting for administrator review.',
      v_rec.email, v_rec.user_id, v_rec.current_role, v_rec.expected_role;
  END LOOP;

  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'ALLOWLIST PRE-VERIFICATION PASSED: All 6 accounts verified against auth.users.';
  RAISE NOTICE '==============================================================================';
END $$;

-- ------------------------------------------------------------------------------
-- 4. INSERT APPROVED MEMBERSHIPS (CONFLICT-PRESERVING, SCHEMA-COMPLIANT)
-- ------------------------------------------------------------------------------
-- Schema: (id, workspace_id, user_id, role, created_at) — NO updated_at column.
-- Uses ON CONFLICT (workspace_id, user_id) DO NOTHING to preserve all existing data.

INSERT INTO public.workspace_memberships (
  workspace_id,
  user_id,
  role,
  created_at
)
SELECT
  'business',
  a.user_id,
  a.approved_role,
  pg_catalog.timezone('utc', pg_catalog.now())
FROM approved_identity_allowlist a
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. POST-BACKFILL INTEGRITY ASSERTIONS
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_harsha_role TEXT;
  v_business_memberships BIGINT;
  v_admin_count BIGINT;
  v_member_count BIGINT;
  v_unmapped_users BIGINT;
BEGIN
  -- Verify Harsha's role in 'business' is admin
  SELECT wm.role INTO v_harsha_role
  FROM public.workspace_memberships wm
  JOIN auth.users u ON u.id = wm.user_id
  WHERE wm.workspace_id = 'business' AND u.email = 'harsha230407@gmail.com';

  IF v_harsha_role IS NULL OR v_harsha_role <> 'admin' THEN
    RAISE EXCEPTION 'ASSERTION FAILED: harsha230407@gmail.com role in "business" is "%", expected "admin"!', COALESCE(v_harsha_role, 'NULL');
  END IF;

  -- Verify total memberships in 'business' is exactly 6
  SELECT pg_catalog.count(*) INTO v_business_memberships
  FROM public.workspace_memberships
  WHERE workspace_id = 'business';

  IF v_business_memberships <> 6 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: Expected exactly 6 memberships in "business" workspace, found %!', v_business_memberships;
  END IF;

  -- Verify role distribution: exactly 1 admin, exactly 5 members
  SELECT pg_catalog.count(*) INTO v_admin_count
  FROM public.workspace_memberships
  WHERE workspace_id = 'business' AND role = 'admin';

  SELECT pg_catalog.count(*) INTO v_member_count
  FROM public.workspace_memberships
  WHERE workspace_id = 'business' AND role = 'member';

  IF v_admin_count <> 1 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: Expected exactly 1 admin in "business" workspace, found %!', v_admin_count;
  END IF;

  IF v_member_count <> 5 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: Expected exactly 5 members in "business" workspace, found %!', v_member_count;
  END IF;

  -- Verify no account in auth.users lacks a 'business' membership
  SELECT pg_catalog.count(*) INTO v_unmapped_users
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workspace_memberships wm
    WHERE wm.workspace_id = 'business' AND wm.user_id = u.id
  );

  IF v_unmapped_users > 0 THEN
    RAISE EXCEPTION 'ASSERTION FAILED: % auth.users account(s) lack a "business" workspace membership!', v_unmapped_users;
  END IF;

  RAISE NOTICE '==============================================================================';
  RAISE NOTICE 'MEMBERSHIP BACKFILL AUDIT (V3.2.2 FINAL STANDARD):';
  RAISE NOTICE 'Total "business" memberships:    %', v_business_memberships;
  RAISE NOTICE 'harsha230407@gmail.com role:     %', v_harsha_role;
  RAISE NOTICE 'Total admins in "business":      %', v_admin_count;
  RAISE NOTICE 'Total members in "business":     %', v_member_count;
  RAISE NOTICE 'Unmapped accounts in "business": %', v_unmapped_users;
  RAISE NOTICE '==============================================================================';
  RAISE NOTICE '[SUCCESS] Membership backfill verified: 1 admin, 5 members, zero overwrites.';
END $$;

COMMIT;

-- ------------------------------------------------------------------------------
-- 6. DISPLAY VERIFIED BUSINESS WORKSPACE MEMBERSHIPS
-- ------------------------------------------------------------------------------
SELECT 
  wm.workspace_id,
  w.name AS workspace_name,
  u.email AS user_email,
  p.display_name,
  p.role AS profile_role,
  wm.role AS workspace_role,
  wm.created_at
FROM public.workspace_memberships wm
JOIN public.workspaces w ON w.id = wm.workspace_id
JOIN auth.users u ON u.id = wm.user_id
JOIN public.profiles p ON p.id = wm.user_id
WHERE wm.workspace_id = 'business'
ORDER BY wm.role ASC, u.email ASC;
