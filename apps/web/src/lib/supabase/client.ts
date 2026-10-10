/**
 * SYNAPTIX COMMAND — Supabase Client Instance
 * Configures the browser client with PKCE OAuth flow, session persistence,
 * and auto-refresh token handling.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig, DEFAULT_SUPABASE_URL } from './config';

let clientInstance: SupabaseClient<Database> | null = null;

/**
 * Cookie storage helper ensuring tokens can be read/written securely across reloads.
 */
function createCookieStorage() {
  if (typeof window === 'undefined') return undefined;

  return {
    getItem: (key: string): string | null => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        window.localStorage.setItem(key, value);
        // Also mirror session indicator in cookies for server awareness if needed
        if (key.includes('-auth-token')) {
          document.cookie = `sb-auth-active=true; path=/; max-age=2592000; SameSite=Lax`;
        }
      } catch {
        // Fallback for private browsing
      }
    },
    removeItem: (key: string): void => {
      try {
        window.localStorage.removeItem(key);
        document.cookie = `sb-auth-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      } catch {
        // Fallback
      }
    },
  };
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (clientInstance) {
    return clientInstance;
  }

  const { url, publishableKey, isConfigured } = getSupabaseConfig();

  // If not configured, provide a client with dummy key to allow import & graceful fallback
  const clientUrl = url || DEFAULT_SUPABASE_URL;
  const clientKey = isConfigured
    ? publishableKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_unconfigured_client';

  clientInstance = createClient<Database>(clientUrl, clientKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: createCookieStorage(),
    },
  });

  return clientInstance;
}

export const supabase = getSupabaseClient();
