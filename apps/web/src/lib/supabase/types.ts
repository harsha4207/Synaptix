/**
 * SYNAPTIX COMMAND — Supabase Schema & Auth Types
 * Type definitions for profiles, workspace memberships, and database tables.
 */

import type { User, Session } from '@supabase/supabase-js';

export interface UserProfileRow {
  id: string; // matches auth.users.id
  email: string;
  display_name: string | null;
  role: string | null;
  organization: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceRow {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  color_accent: string | null;
  created_at: string;
}

export interface WorkspaceMembershipRow {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfileRow;
        Insert: Partial<UserProfileRow> & { id: string; email: string };
        Update: Partial<UserProfileRow>;
      };
      workspaces: {
        Row: WorkspaceRow;
        Insert: Partial<WorkspaceRow> & { id: string; name: string };
        Update: Partial<WorkspaceRow>;
      };
      workspace_memberships: {
        Row: WorkspaceMembershipRow;
        Insert: Partial<WorkspaceMembershipRow> & { workspace_id: string; user_id: string };
        Update: Partial<WorkspaceMembershipRow>;
      };
    };
  };
}

export interface SupabaseAuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
