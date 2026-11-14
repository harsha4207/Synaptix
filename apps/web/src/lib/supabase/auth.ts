/**
 * SYNAPTIX COMMAND — Supabase Authentication Service
 * Implements Google OAuth PKCE flow, email credentials, session retrieval,
 * and state change subscriptions.
 */

import { supabase } from './client';
import { getAuthCallbackUrl, getSupabaseConfig } from './config';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import type { UserProfileRow } from './types';

export interface AuthResult<T = void> {
  data?: T;
  error: AuthError | Error | null;
  requiresConfirmation?: boolean;
}

/**
 * Initiates Google OAuth sign-in via Supabase.
 * Uses PKCE flow with the application origin as the redirect URL.
 */
export async function signInWithGoogle(customRedirectUrl?: string): Promise<AuthResult> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      error: new Error(
        'Supabase is not fully configured. Please provide your NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.'
      ),
    };
  }

  try {
    const redirectTo = customRedirectUrl || getAuthCallbackUrl();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign in using email and password credentials.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      error: new Error(
        'Supabase is not fully configured. Please provide your NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { data, error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Register a new enterprise user using email and password.
 * Passes full name in options.data.full_name for profile provisioning.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { fullName?: string; organization?: string }
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      error: new Error(
        'Supabase is not fully configured. Please provide your NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.'
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName,
          organization: metadata?.organization,
        },
      },
    });

    if (error) {
      return { error };
    }

    // When email confirmation is enabled in Supabase, data.session is null
    const requiresConfirmation = !data.session && !!data.user;

    return { data, requiresConfirmation, error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Terminates the active session and clears storage tokens.
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error };
    }
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Returns the currently active session from memory or secure storage.
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Fetches the currently authenticated user with server-verified claims.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Subscribes to authentication state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.).
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Initiates the password recovery flow via Supabase Auth.
 * Dispatches a password reset email containing a secure token.
 */
export async function resetPasswordForEmail(
  email: string,
  customRedirectUrl?: string
): Promise<AuthResult> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      error: new Error(
        'Supabase is not fully configured. Please provide your NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.'
      ),
    };
  }

  try {
    const redirectTo = customRedirectUrl || `${getAuthCallbackUrl()}#reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Updates the authenticated user's password using the active session or recovery session.
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Retrieves the user profile record from public.profiles linked to auth.users.id.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfileRow | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as UserProfileRow;
  } catch {
    return null;
  }
}

/**
 * Updates permitted profile fields in public.profiles.
 * Enforces RLS: users can only update their own profile row.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfileRow>
): Promise<{ data: UserProfileRow | null; error: Error | null }> {
  try {
    // Sanitize updates to prevent unauthorized field mutation
    const permitted: Record<string, any> = {};
    if (updates.display_name !== undefined) permitted.display_name = updates.display_name;
    if (updates.full_name !== undefined) permitted.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) permitted.avatar_url = updates.avatar_url;
    if (updates.organization !== undefined) permitted.organization = updates.organization;
    if (updates.phone_number !== undefined) permitted.phone_number = updates.phone_number;
    permitted.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(permitted)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as UserProfileRow, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}
