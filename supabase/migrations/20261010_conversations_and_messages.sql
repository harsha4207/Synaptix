-- ==============================================================================
-- SYNAPTIX COMMAND — Conversations & Messages Persistence Schema
-- ==============================================================================
-- Stores persistent conversations and assistant responses across Command Center,
-- text chat, voice assistant, RAG queries, analytics, and workflow planning.
-- Enforces Row Level Security (RLS) for tenant and workspace isolation.
-- ==============================================================================

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id TEXT DEFAULT 'SYNAPTIX COMMAND Enterprise',
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant', 'system', 'tool')) NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'streaming', 'completed', 'failed', 'cancelled')) NOT NULL DEFAULT 'completed',
  provider TEXT DEFAULT 'google',
  model TEXT DEFAULT 'gemini-2.5-flash',
  routing_tier TEXT CHECK (routing_tier IN ('TIER_1_SIMPLE', 'TIER_2_MODERATE', 'TIER_3_COMPLEX', 'TIER_4_CONSEQUENTIAL')),
  intent TEXT,
  request_id TEXT UNIQUE,
  latency_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  citations JSONB DEFAULT '[]'::jsonb NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE CHRONOLOGICAL RETRIEVAL & LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_conversations_user_workspace ON public.conversations(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS: User can only select, insert, update, or delete their own conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
CREATE POLICY "Users can insert their own conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
CREATE POLICY "Users can delete their own conversations"
  ON public.conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Messages RLS: User can only select, insert, update, or delete their own messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
CREATE POLICY "Users can insert their own messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = user_id);
