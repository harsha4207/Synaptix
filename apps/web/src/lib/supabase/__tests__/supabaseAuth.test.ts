/**
 * SYNAPTIX COMMAND — Supabase Integration & Authentication Test Suite
 * Tests configuration resolution, Google OAuth sign-in flow,
 * manual email/password registration & sign-in, password recovery,
 * profile fetching & updating, and server-side JWT verification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSupabaseConfig, getAuthCallbackUrl, DEFAULT_SUPABASE_URL } from '../config';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentSession,
  getCurrentUser,
  resetPasswordForEmail,
  updatePassword,
  fetchUserProfile,
  updateUserProfile,
} from '../auth';
import { getSupabaseClient, supabase } from '../client';
import { authenticateServerRequest } from '../../../server/authMiddleware';

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

  it('handles Google OAuth sign-in gracefully', async () => {
    const signInSpy = vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/v2/auth' },
      error: null,
    });

    const res = await signInWithGoogle('http://localhost:3000/');
    expect(signInSpy).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    expect(res.error).toBeNull();
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

describe('Supabase Password Recovery & Profile Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches password reset request with redirect callback URL', async () => {
    const resetSpy = vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
      data: {} as any,
      error: null,
    });

    const res = await resetPasswordForEmail('user@enterprise.com', 'http://localhost:3000/#reset-password');
    expect(resetSpy).toHaveBeenCalledWith('user@enterprise.com', {
      redirectTo: 'http://localhost:3000/#reset-password',
    });
    expect(res.error).toBeNull();
  });

  it('updates master user password during recovery session', async () => {
    const updateSpy = vi.spyOn(supabase.auth, 'updateUser').mockResolvedValueOnce({
      data: { user: { id: 'usr-reset-1' } as any },
      error: null,
    });

    const res = await updatePassword('NewSecurePassword123!');
    expect(updateSpy).toHaveBeenCalledWith({ password: 'NewSecurePassword123!' });
    expect(res.error).toBeNull();
  });

  it('fetches linked profile record from public.profiles', async () => {
    const mockProfile = {
      id: 'usr-123',
      email: 'user@enterprise.com',
      full_name: 'Test User',
      display_name: 'Test User',
      role: 'Enterprise Specialist',
      organization: 'SYNAPTIX COMMAND',
      avatar_url: null,
      created_at: '2026-11-02T10:00:00Z',
      updated_at: '2026-11-02T10:00:00Z',
    };

    const fromSpy = vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
    } as any);

    const profile = await fetchUserProfile('usr-123');
    expect(fromSpy).toHaveBeenCalledWith('profiles');
    expect(profile?.email).toBe('user@enterprise.com');
    expect(profile?.full_name).toBe('Test User');
  });

  it('updates permitted profile fields in public.profiles', async () => {
    const updatedProfile = {
      id: 'usr-123',
      email: 'user@enterprise.com',
      display_name: 'Updated Display Name',
      full_name: 'Updated Name',
      role: 'Enterprise Specialist',
      organization: 'SYNAPTIX COMMAND',
      avatar_url: 'https://example.com/avatar.png',
      created_at: '2026-11-02T10:00:00Z',
      updated_at: '2026-11-02T10:30:00Z',
    };

    vi.spyOn(supabase, 'from').mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValueOnce({ data: updatedProfile, error: null }),
    } as any);

    const res = await updateUserProfile('usr-123', {
      display_name: 'Updated Display Name',
      full_name: 'Updated Name',
    });

    expect(res.error).toBeNull();
    expect(res.data?.display_name).toBe('Updated Display Name');
  });
});

describe('Server-Side Supabase Token Verification Middleware', () => {
  it('rejects inbound requests without authorization header', async () => {
    const mockReq = { headers: {} } as any;
    const ctx = await authenticateServerRequest(mockReq);
    expect(ctx.isAuthenticated).toBe(false);
    expect(ctx.error).toContain('No authorization header');
  });

  it('rejects malformed authorization header', async () => {
    const mockReq = { headers: { authorization: 'Basic dXNlcjpwYXNz' } } as any;
    const ctx = await authenticateServerRequest(mockReq);
    expect(ctx.isAuthenticated).toBe(false);
    expect(ctx.error).toContain('Malformed authorization header');
  });
});
