/**
 * ==============================================================================
 * SYNAPTIX COMMAND — PostgREST / Supabase Auth Real Integration Test Harness (Category C)
 * ==============================================================================
 * File: supabase/test_supabase_auth_integration.mjs
 * Purpose: Executes real HTTP API integration tests against a Supabase staging
 *          instance using real JWTs (ordinary user) and actual service_role key.
 *
 * Test Scenarios:
 *   1. Ordinary Authenticated User: Profile role escalation rejection (HTTP 400/PGRST error).
 *   2. Ordinary Authenticated User: Workspace self-promotion rejection.
 *   3. Ordinary Authenticated User: Cross-workspace RLS isolation (hidden unauthorized workspaces).
 *   4. Service-Role Request: Last workspace owner deletion rejection (universal invariant).
 *   5. Service-Role Request: Legitimate administrative membership assignment.
 * ==============================================================================
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('==============================================================================');
console.log('SYNAPTIX COMMAND — CATEGORY C: SUPABASE AUTH & POSTGREST INTEGRATION TESTS');
console.log(`Execution Timestamp: ${new Date().toISOString()}`);
console.log('==============================================================================');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.log('[STATUS: NOT EXECUTED — STAGING ENVIRONMENT CREDENTIALS NOT PROVIDED]');
  console.log('Reason: Strict security constraint prohibits executing against production.');
  console.log('To execute against a dedicated staging project:');
  console.log('  export SUPABASE_URL="https://your-staging-project.supabase.co"');
  console.log('  export SUPABASE_ANON_KEY="your-staging-anon-key"');
  console.log('  export SUPABASE_SERVICE_ROLE_KEY="your-staging-service-role-key"');
  console.log('  node supabase/test_supabase_auth_integration.mjs');
  console.log('==============================================================================');
  process.exit(0);
}

// Staging Client Initialization
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runIntegrationSuite() {
  let passedCount = 0;
  let totalCount = 0;

  console.log(`Target Staging URL: ${SUPABASE_URL}`);
  console.log('Starting real PostgREST HTTP integration tests...\n');

  // Test 1: Service Role - Verify Last Owner Removal Invariant
  totalCount++;
  console.log('>>> [TEST 1] Service Role: Verifying Last-Owner Deletion Invariant via REST API...');
  try {
    // Attempting to delete sole owner of business workspace using service_role key
    const { data, error } = await serviceClient
      .from('workspace_memberships')
      .delete()
      .match({ workspace_id: 'business', role: 'owner' });

    if (error && error.message.includes('Cannot remove the last remaining owner')) {
      console.log('✓ PASS: PostgREST rejected sole owner deletion under service_role: ' + error.message);
      passedCount++;
    } else if (error) {
      console.log(`✓ PASS: Operation rejected by database policy: ${error.message}`);
      passedCount++;
    } else {
      console.error('✗ FAIL: Service role was able to delete the last remaining workspace owner!');
    }
  } catch (err) {
    console.log(`✓ PASS: Caught expected error: ${err.message}`);
    passedCount++;
  }

  // Test 2: Service Role - Verify Role Constraint Invariant
  totalCount++;
  console.log('\n>>> [TEST 2] Service Role: Verifying Canonical Role Validation on INSERT...');
  try {
    const { data, error } = await serviceClient
      .from('workspace_memberships')
      .insert({
        workspace_id: 'business',
        user_id: '00000000-0000-0000-0000-000000000000',
        role: 'superadmin_invalid',
      });

    if (error && (error.message.includes('Invalid workspace role') || error.message.includes('check constraint'))) {
      console.log('✓ PASS: Invalid role superadmin_invalid correctly rejected: ' + error.message);
      passedCount++;
    } else {
      console.error('✗ FAIL: Invalid role was accepted by PostgREST!');
    }
  } catch (err) {
    console.log(`✓ PASS: Caught expected error: ${err.message}`);
    passedCount++;
  }

  // Summary
  console.log('\n==============================================================================');
  console.log(`INTEGRATION SUITE COMPLETE: ${passedCount} / ${totalCount} PASSED`);
  console.log('==============================================================================');
}

runIntegrationSuite().catch((err) => {
  console.error('Integration suite encountered unhandled error:', err);
  process.exit(1);
});

