/**
 * SYNAPTIX COMMAND — Supabase Configuration
 * Resolves project URL, publishable/anon key, and development origin.
 */

// User-supplied Supabase Project Configuration
export const DEFAULT_SUPABASE_URL = 'https://mctckddnapqlbqxqydcj.supabase.co';
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YlxpiLvoIjA_2uPVL_jWqA_r-4TVB7B';

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  // Static member access so Vite's AST replacement can inline environment variables
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  const publishableKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  const isConfigured = Boolean(
    url &&
    publishableKey &&
    !publishableKey.includes('your_supabase_anon_publishable_key')
  );

  return {
    url,
    publishableKey,
    isConfigured,
  };
}

/**
 * Returns the application OAuth callback origin URL.
 * Automatically aligns with http://localhost:3000 in local development or the live origin.
 */
export function getAuthCallbackUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/`;
  }
  return 'http://localhost:3000/';
}
