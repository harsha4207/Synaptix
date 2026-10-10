/**
 * SYNAPTIX COMMAND — Supabase Integration & Authentication Test Suite
 * Tests configuration resolution, Google OAuth sign-in flow,
 * session retrieval, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSupabaseConfig, getAuthCallbackUrl, DEFAULT_SUPABASE_URL } from '../config';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getCurrentSession, getCurrentUser } from '../auth';
import { getSupabaseClient, supabase } from '../client';

describe('Supabase Configuration', () => {
  it('resolves the configured Supabase Project URL', () => {
    const config = getSupabaseConfig();
    expect(config.url).toBe(DEFAULT_SUPABASE_URL);
    expect(config.url).toContain('https://mctckddnapqlbqxqydcj.supabase.co');
  });

  it('determines configured status based on valid publishable key presence', () => {
    const config = getSupabaseConfig();
    expect(typeof config.isConfigured).toBe('boolean');
  });

  it('returns valid auth callback URL for OAuth redirect', () => {
    const callbackUrl = getAuthCallbackUrl();
    expect(callbackUrl).toBeDefined();
    expect(callbackUrl.startsWith('http')).toBe(true);
  });
});

describe('Supabase Client Instance', () => {
  it('provides a valid Supabase client instance singleton', () => {
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client).toBe(supabase);
  });
});

describe('Supabase Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles Google OAuth sign-in gracefully when unconfigured', async () => {
    const res = await signInWithGoogle();
    if (res.error) {
      expect(res.error.message).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    } else {
      expect(res.error).toBeNull();
    }
  });

  it('signs in with email and password successfully when credentials are valid', async () => {
    const mockUser = { id: 'usr-123', email: 'test@enterprise.com', user_metadata: { full_name: 'Test User' } };
    const mockSession = { access_token: 'fake-jwt', user: mockUser };

    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { user: mockUser as any, session: mockSession as any },
      error: null,
    });

    const res = await signInWithEmail('test@enterprise.com', 'SecurePass123!');
    expect(res.error).toBeNull();
    expect(res.data?.user?.email).toBe('test@enterprise.com');
    expect(res.data?.session?.access_token).toBe('fake-jwt');
  });

  it('handles invalid credentials error during email sign-in', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthApiError', status: 400 } as any,
    });

    const res = await signInWithEmail('wrong@enterprise.com', 'wrongpassword');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toContain('Invalid login credentials');
  });

  it('signs up new user with full_name metadata passed in options', async () => {
    const mockUser = { id: 'usr-456', email: 'alex@enterprise.com', user_metadata: { full_name: 'Alex Vance' } };
    const mockSession = { access_token: 'jwt-signup', user: mockUser };

    const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: { user: mockUser as any, session: mockSession as any },
      error: null,
    });

    const res = await signUpWithEmail('alex@enterprise.com', 'SuperSecretPass123!', {
      fullName: 'Alex Vance',
      organization: 'SYNAPTIX COMMAND Enterprise',
    });

    expect(signUpSpy).toHaveBeenCalledWith({
      email: 'alex@enterprise.com',
      password: 'SuperSecretPass123!',
      options: {
        data: {
          full_name: 'Alex Vance',
          organization: 'SYNAPTIX COMMAND Enterprise',
        },
      },
    });

    expect(res.error).toBeNull();
    expect(res.requiresConfirmation).toBe(false);
    expect(res.data?.user?.email).toBe('alex@enterprise.com');
  });

  it('detects unconfirmed email signup (requiresConfirmation) when session is null', async () => {
    const mockUser = { id: 'usr-unconfirmed', email: 'unconfirmed@enterprise.com' };

    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: { user: mockUser as any, session: null },
      error: null,
    });

    const res = await signUpWithEmail('unconfirmed@enterprise.com', 'SuperSecretPass123!', {
      fullName: 'Pending User',
    });

    expect(res.error).toBeNull();
    expect(res.requiresConfirmation).toBe(true);
    expect(res.data?.session).toBeNull();
  });

  it('handles duplicate user registration error', async () => {
    vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered', name: 'AuthApiError', status: 422 } as any,
    });

    const res = await signUpWithEmail('existing@enterprise.com', 'Pass12345678!');
    expect(res.error).toBeDefined();
    expect(res.error?.message).toContain('User already registered');
  });

  it('calls supabase.auth.signOut successfully', async () => {
    vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: null });
    const res = await signOut();
    expect(res.error).toBeNull();
  });

  it('retrieves active session safely', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const session = await getCurrentSession();
    expect(session).toBeNull();
  });

  it('verifies server-side user claims safely', async () => {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
      data: { user: null },
      error: null,
    } as any);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});

