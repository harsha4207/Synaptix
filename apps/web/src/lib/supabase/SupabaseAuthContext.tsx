/**
 * SYNAPTIX COMMAND — Supabase Auth React Context & Provider
 * Manages reactive user session state, OAuth redirect handling,
 * and unified sign-in/sign-out actions across the app.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './client';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  signOut as authSignOut,
  getCurrentSession,
} from './auth';
import { getSupabaseConfig, getAuthCallbackUrl } from './config';
import { saveSessionEmail, clearSessionEmail, saveUserProfile, loadUserProfile } from '../../services/profileStorage';

export interface SupabaseAuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
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
  signOut: () => Promise<void>;
  clearError: () => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConfigured } = useMemo(() => getSupabaseConfig(), []);

  // Sync profile data to profileStorage for existing views
  const syncUserProfile = useCallback((supabaseUser: User) => {
    const email = supabaseUser.email || '';
    if (!email) return;

    saveSessionEmail(email);

    // Extract metadata from OAuth or signup
    const userMeta = supabaseUser.user_metadata || {};
    const existing = loadUserProfile(email);

    const displayName =
      userMeta.full_name ||
      userMeta.name ||
      userMeta.display_name ||
      existing.displayName ||
      email.split('@')[0].replace('.', ' ');

    const avatarUrl =
      userMeta.avatar_url ||
      userMeta.picture ||
      existing.avatarUrl;

    const organization =
      userMeta.organization ||
      existing.organization ||
      'SYNAPTIX COMMAND Enterprise';

    saveUserProfile({
      name: displayName,
      email,
      role: existing.role || 'Enterprise Specialist',
      organization,
      avatarUrl,
      displayName,
    });
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
    }

    const initAuth = async () => {
      try {
        const initialSession = await getCurrentSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            syncUserProfile(initialSession.user);
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
      (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          syncUserProfile(currentSession.user);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
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
      syncUserProfile(res.data.session.user);
      setUser(res.data.session.user);
      setSession(res.data.session);
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
        syncUserProfile(res.data.session.user);
        setUser(res.data.session.user);
        setSession(res.data.session);
      }
      return {
        data: res.data,
        requiresConfirmation: res.requiresConfirmation,
        error: null,
      };
    },
    [syncUserProfile]
  );

  const handleSignOut = useCallback(async () => {
    setError(null);
    clearSessionEmail();
    setUser(null);
    setSession(null);
    await authSignOut();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: user !== null,
      isConfigured,
      error,
      signInWithGoogle: handleSignInWithGoogle,
      signInWithEmail: handleSignInWithEmail,
      signUpWithEmail: handleSignUpWithEmail,
      signOut: handleSignOut,
      clearError,
    }),
    [
      user,
      session,
      isLoading,
      isConfigured,
      error,
      handleSignInWithGoogle,
      handleSignInWithEmail,
      handleSignUpWithEmail,
      handleSignOut,
      clearError,
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
