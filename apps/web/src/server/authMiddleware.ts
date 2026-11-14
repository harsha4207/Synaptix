/**
 * SYNAPTIX COMMAND — Server-Side Supabase Token Verification & Authorization Middleware
 *
 * Authenticates inbound HTTP requests using Supabase-issued JWT access tokens.
 * Validates cryptographic signature, expiry, and identity via supabase.auth.getUser(token).
 * Extracts verified user UUID, email, and metadata to prevent header spoofing.
 */

import * as http from 'http';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

let serverAuthClient: SupabaseClient | null = null;

function getServerSupabaseClient(): SupabaseClient {
  if (serverAuthClient) return serverAuthClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://mctckddnapqlbqxqydcj.supabase.co';

  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'sb_publishable_YlxpiLvoIjA_2uPVL_jWqA_r-4TVB7B';

  serverAuthClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverAuthClient;
}

export interface AuthenticatedUserContext {
  isAuthenticated: boolean;
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  error?: string | null;
}

/**
 * Extracts and verifies the Bearer access token from incoming HTTP headers.
 */
export async function authenticateServerRequest(
  req: http.IncomingMessage
): Promise<AuthenticatedUserContext> {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return {
      isAuthenticated: false,
      user: null,
      userId: null,
      userEmail: null,
      error: 'No authorization header provided',
    };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return {
      isAuthenticated: false,
      user: null,
      userId: null,
      userEmail: null,
      error: 'Malformed authorization header. Expected: Bearer <token>',
    };
  }

  const token = parts[1];
  try {
    const client = getServerSupabaseClient();
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      return {
        isAuthenticated: false,
        user: null,
        userId: null,
        userEmail: null,
        error: error?.message || 'Invalid or expired Supabase access token',
      };
    }

    return {
      isAuthenticated: true,
      user: data.user,
      userId: data.user.id,
      userEmail: data.user.email || null,
      error: null,
    };
  } catch (err: any) {
    return {
      isAuthenticated: false,
      user: null,
      userId: null,
      userEmail: null,
      error: err?.message || 'Server-side JWT verification error',
    };
  }
}

