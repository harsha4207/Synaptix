/**
 * SYNAPTIX COMMAND — Supabase Auth React Context & Provider
 * Manages reactive user session state, OAuth redirect handling,
 * database profile synchronization, and unified sign-in/sign-out/recovery actions.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  signOut as authSignOut,
  resetPasswordForEmail as authResetPasswordForEmail,
  updatePassword as authUpdatePassword,
  fetchUserProfile,
  updateUserProfile as authUpdateUserProfile,
  getCurrentSession,
} from './auth';
import type { UserProfileRow } from './types';
import { getSupabaseConfig, getAuthCallbackUrl } from './config';
import { saveSessionEmail, clearSessionEmail, saveUserProfile, loadUserProfile } from '../../services/profileStorage';

export interface SupabaseAuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfileRow | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isPasswordRecovery: boolean;
  error: string | null;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ data?: { user: User | null; session: Session | null }; error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { fullName?: string; organization?: string }
  ) => Promise<{
    data?: { user: User | null; session: Session | null };
    requiresConfirmation?: boolean;
    error: Error | null;
  }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfileRow>) => Promise<{ data: UserProfileRow | null; error: Error | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  clearPasswordRecovery: () => void;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export interface SupabaseAuthProviderProps {
  children: React.ReactNode;
  onAuthStateChanged?: (user: User | null, session: Session | null) => void;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({
  children,
  onAuthStateChanged,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConfigured } = useMemo(() => getSupabaseConfig(), []);

  // Sync profile data to public.profiles and client-side profileStorage
  const syncUserProfile = useCallback(async (supabaseUser: User) => {
    const email = supabaseUser.email || '';
    if (!email) return;

    saveSessionEmail(email);

    // Extract metadata from OAuth or signup
    const userMeta = supabaseUser.user_metadata || {};
    const existing = loadUserProfile(email);

    const displayName =
      userMeta.display_name ||
      userMeta.full_name ||
      userMeta.name ||
      existing.displayName ||
      email.split('@')[0].replace('.', ' ');

    const fullName =
      userMeta.full_name ||
      userMeta.name ||
      existing.name ||
      displayName;

    const avatarUrl =
      userMeta.avatar_url ||
      userMeta.picture ||
      existing.avatarUrl;

    const organization =
      userMeta.organization ||
      existing.organization ||
      'SYNAPTIX COMMAND Enterprise';

    // 1. First populate local storage for instant responsiveness
    saveUserProfile({
      name: fullName,
      email,
      role: existing.role || 'Enterprise Specialist',
      organization,
      avatarUrl,
      displayName,
    });

    // 2. Fetch or initialize the linked database profile in public.profiles
    try {
      let dbProfile = await fetchUserProfile(supabaseUser.id);
      if (!dbProfile) {
        // Idempotently create profile record if trigger was delayed
        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert({
            id: supabaseUser.id,
            email,
            full_name: fullName,
            display_name: displayName,
            avatar_url: avatarUrl,
            organization,
            role: 'Enterprise Specialist',
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        dbProfile = createdProfile as UserProfileRow | null;
      }

      if (dbProfile) {
        setProfile(dbProfile);
        saveUserProfile({
          name: dbProfile.full_name || dbProfile.display_name || fullName,
          email: dbProfile.email || email,
          role: dbProfile.role || 'Enterprise Specialist',
          organization: dbProfile.organization || organization,
          avatarUrl: dbProfile.avatar_url || avatarUrl,
          displayName: dbProfile.display_name || displayName,
        });
      }
    } catch (err) {
      console.warn('Could not synchronize database profile from Supabase:', err);
    }
  }, []);

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    // Check for error in URL from OAuth redirect (e.g. error=access_denied)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error_description') || urlParams.get('error');
      if (urlError) {
        setError(decodeURIComponent(urlError));
        // Clean URL params
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      }

      // Check for recovery type in hash or search
      const hashStr = window.location.hash;
      if (hashStr.includes('type=recovery') || hashStr.includes('#reset-password')) {
        setIsPasswordRecovery(true);
      }
    }

    const initAuth = async () => {
      try {
        const initialSession = await getCurrentSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await syncUserProfile(initialSession.user);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen to Supabase auth events
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        } else if (event === 'SIGNED_IN' && currentSession?.user) {
          await syncUserProfile(currentSession.user);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          clearSessionEmail();
        }

        if (onAuthStateChanged) {
          onAuthStateChanged(currentSession?.user ?? null, currentSession);
        }
      }
    );

    return () => {
      isMounted = false;
      authSubscription?.subscription?.unsubscribe();
    };
  }, [syncUserProfile, onAuthStateChanged]);

  const handleSignInWithGoogle = useCallback(
    async (customRedirect?: string) => {
      setError(null);
      const redirectUrl = customRedirect || getAuthCallbackUrl();
      const res = await authSignInWithGoogle(redirectUrl);
      if (res.error) {
        setError(res.error.message);
        return { error: res.error };
      }
      return { error: null };
    },
    []
  );

  const handleSignInWithEmail = useCallback(async (email: string, pass: string) => {
    setError(null);
    const res = await authSignInWithEmail(email, pass);
    if (res.error) {
      setError(res.error.message);
      return { data: undefined, error: res.error };
    }
    if (res.data?.session?.user) {
      setUser(res.data.session.user);
      setSession(res.data.session);
      await syncUserProfile(res.data.session.user);
    }
    return { data: res.data, error: null };
  }, [syncUserProfile]);

  const handleSignUpWithEmail = useCallback(
    async (email: string, pass: string, meta?: { fullName?: string; organization?: string }) => {
      setError(null);
      const res = await authSignUpWithEmail(email, pass, meta);
      if (res.error) {
        setError(res.error.message);
        return { data: undefined, requiresConfirmation: false, error: res.error };
      }
      if (res.data?.session?.user) {
        setUser(res.data.session.user);
        setSession(res.data.session);
        await syncUserProfile(res.data.session.user);
      }
      return {
        data: res.data,
        requiresConfirmation: res.requiresConfirmation,
        error: null,
      };
    },
    [syncUserProfile]
  );

  const handleResetPasswordForEmail = useCallback(async (email: string) => {
    setError(null);
    const res = await authResetPasswordForEmail(email);
    if (res.error) {
      setError(res.error.message);
      return { error: res.error };
    }
    return { error: null };
  }, []);

  const handleUpdatePassword = useCallback(async (newPassword: string) => {
    setError(null);
    const res = await authUpdatePassword(newPassword);
    if (res.error) {
      setError(res.error.message);
      return { error: res.error };
    }
    setIsPasswordRecovery(false);
    return { error: null };
  }, []);

  const handleUpdateProfile = useCallback(
    async (updates: Partial<UserProfileRow>) => {
      if (!user) {
        return { data: null, error: new Error('User is not authenticated') };
      }
      const res = await authUpdateUserProfile(user.id, updates);
      if (res.data) {
        setProfile(res.data);
      }
      return res;
    },
    [user]
  );

  const handleSignOut = useCallback(async () => {
    setError(null);
    clearSessionEmail();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsPasswordRecovery(false);
    await authSignOut();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
  }, []);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: user !== null,
      isConfigured,
      isPasswordRecovery,
      error,
      signInWithGoogle: handleSignInWithGoogle,
      signInWithEmail: handleSignInWithEmail,
      signUpWithEmail: handleSignUpWithEmail,
      resetPasswordForEmail: handleResetPasswordForEmail,
      updatePassword: handleUpdatePassword,
      updateProfile: handleUpdateProfile,
      signOut: handleSignOut,
      clearError,
      clearPasswordRecovery,
    }),
    [
      user,
      session,
      profile,
      isLoading,
      isConfigured,
      isPasswordRecovery,
      error,
      handleSignInWithGoogle,
      handleSignInWithEmail,
      handleSignUpWithEmail,
      handleResetPasswordForEmail,
      handleUpdatePassword,
      handleUpdateProfile,
      handleSignOut,
      clearError,
      clearPasswordRecovery,
    ]
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

export const useSupabaseAuth = (): SupabaseAuthContextValue => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};
