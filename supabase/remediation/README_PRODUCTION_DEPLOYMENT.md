# SYNAPTIX COMMAND — Production Remediation Runbook (V3.2 Security Audited)
**Target System:** Synaptix Command Supabase Database (`https://mctckddnapqlbqxqydcj.supabase.co`)  
**Revision:** V3.2 Security Audit & Remediation Standard  
**Execution Context:** Supabase Dashboard SQL Editor (Run as `postgres`)

---

## 1. Approved Access Matrix & Security Guarantees

| Account / Subject | Identity Provider | `public.profiles.role` | Workspace: `business` Role | Workspaces: `finance`, `healthcare`, `research`, `education` |
| :--- | :--- | :--- | :--- | :--- |
| **`harsha230407@gmail.com`** | Google OAuth | `Enterprise Specialist` | **`admin`** | **No automatic access** (0 records) |
| **Account 2** (`analyst@...`) | Email / Password | `Enterprise Specialist` | **`member`** | **No automatic access** (0 records) |
| **Account 3** (`strategist@...`) | Google OAuth | `Enterprise Specialist` | **`member`** | **No automatic access** (0 records) |
| **Account 4** (`operator@...`) | Google OAuth | `Enterprise Specialist` | **`member`** | **No automatic access** (0 records) |
| **Account 5** (`auditor@...`) | Google OAuth | `Enterprise Specialist` | **`member`** | **No automatic access** (0 records) |
| **Account 6** (`consultant@...`) | Email / Password | `Enterprise Specialist` | **`member`** | **No automatic access** (0 records) |
| **Future Signups** | Google / Email | `Enterprise Specialist` | **`member`** (Auto) | **No automatic access** (0 records) |

> [!IMPORTANT]
> **V3.2 Security Invariants Enforced:**
> 1. **Fixed `SECURITY DEFINER` Vulnerability:** Never makes authorization decisions based on `current_user` inside `SECURITY DEFINER` functions. All checks rely on `session_user` and verified JWT claims (`auth.role()`).
> 2. **Role Modification Gate:** Ordinary users cannot modify their own profile role or escalate privileges (`prevent_profile_tampering`).
> 3. **Membership Administration Gate:** Ordinary users cannot promote themselves or grant administrative access to others (`enforce_workspace_role_hierarchy`).
> 4. **Universal Last-Owner Protection:** No caller, including `service_role` and DBA, can demote or delete the last remaining owner in an active workspace.
> 5. **Schema Conformance:** Strictly conforms to production schema: `(id, workspace_id, user_id, role, created_at)`. No `updated_at` column is referenced or added.
> 6. **Zero Silent Modifications:** All membership and profile backfills use conflict-preserving semantics (`DO NOTHING`). No memberships in restricted workspaces are deleted or modified.
> 7. **Explicit Policy Purge:** Does not dynamically delete unknown policies; drops only specifically named baseline and obsolete policies.

---

## 2. Remediation Script Execution Sequence

```text
supabase/remediation/
├── 01_production_preflight.sql              # Step 1: Read-only inventory & policy classification
├── 02_profile_repair.sql                    # Step 2: Idempotent profile creation (harsha account)
├── 03_membership_backfill.sql               # Step 3: Conflict-preserving Business Strategy backfill
├── 04_v3_2_auth_profiles_enhancement.sql    # Step 4: Security functions, policy replacement & RLS
├── 05_post_deployment_validation.sql        # Step 5: Comprehensive 10-point programmatic validation
├── 06_safe_rollback.sql                     # Fallback: Non-destructive restoration to baseline
└── README_PRODUCTION_DEPLOYMENT.md          # Complete runbook & manual verification checklist
```

### Step 1: Preflight Audit (Read-Only)
- **Script:** [`01_production_preflight.sql`](file:///C:/Users/Harsha%20MS/Synaptix/supabase/remediation/01_production_preflight.sql)
- **Goal:** Verify 6 accounts in `auth.users`, 5 in `public.profiles`, 0 in `workspace_memberships`, and classify all existing RLS policies.

### Step 2: Profile Repair (Transaction-Protected)
- **Script:** [`02_profile_repair.sql`](file:///C:/Users/Harsha%20MS/Synaptix/supabase/remediation/02_profile_repair.sql)
- **Goal:** Non-destructively add `full_name` and `phone_number` columns. Insert profile for `harsha230407@gmail.com` with role `Enterprise Specialist`. Use `ON CONFLICT (id) DO NOTHING`.

### Step 3: Membership Backfill (Transaction-Protected)
- **Script:** [`03_membership_backfill.sql`](file:///C:/Users/Harsha%20MS/Synaptix/supabase/remediation/03_membership_backfill.sql)
- **Goal:** Assign Harsha `admin` in `business` and the 5 other users `member` in `business` using `ON CONFLICT (workspace_id, user_id) DO NOTHING`. Aborts if existing memberships conflict with the approved matrix. Does not delete any records in other workspaces.

### Step 4: Security Migration V3.2
- **Script:** [`04_v3_2_auth_profiles_enhancement.sql`](file:///C:/Users/Harsha%20MS/Synaptix/supabase/remediation/04_v3_2_auth_profiles_enhancement.sql)
- **Goal:** Deploy hardened `handle_new_user()`, `prevent_profile_tampering()`, `enforce_workspace_role_hierarchy()`, non-recursive RLS helpers, explicitly replace obsolete policies, and recreate restrictive RLS policies with `FORCE ROW LEVEL SECURITY`.

### Step 5: Post-Deployment Validation
- **Script:** [`05_post_deployment_validation.sql`](file:///C:/Users/Harsha%20MS/Synaptix/supabase/remediation/05_post_deployment_validation.sql)
- **Goal:** Programmatically assert all 10 invariants pass, display verified membership matrix, and verify policy inventory.

---

## 3. Staging Security Test Suite

- **Script:** [`supabase/test_staging_security_suite.sql`](file:///C:/Users/Harsha%20MS/Synaptix/supabase/test_staging_security_suite.sql)
- **Goal:** Standalone integration test suite verifying all 10 authorization scenarios (privilege escalation, cross-workspace isolation, service_role last-owner invariant, cascades, OAuth and email signup) on a real PostgreSQL / staging instance.
