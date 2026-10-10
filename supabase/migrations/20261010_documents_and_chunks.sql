-- ==============================================================================
-- SYNAPTIX COMMAND — Documents & Vector Chunks Persistent Schema
-- ==============================================================================
-- Stores persisted document records and chunk vector indices across all workspaces.
-- Enforces Row Level Security (RLS) for tenant and workspace isolation.
-- ==============================================================================

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  organization_id TEXT NOT NULL DEFAULT 'SYNAPTIX COMMAND Enterprise',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  content_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('UPLOADED', 'VALIDATING', 'EXTRACTING', 'CHUNKING', 'EMBEDDING', 'INDEXING', 'READY', 'FAILED', 'RETRYING')),
  source TEXT NOT NULL DEFAULT 'Direct Upload',
  chunk_count INTEGER NOT NULL DEFAULT 0,
  ocr_applied BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. DOCUMENT CHUNKS TABLE
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  organization_id TEXT NOT NULL DEFAULT 'SYNAPTIX COMMAND Enterprise',
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  source_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR RETRIEVAL & LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_workspace_status ON public.documents(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON public.documents(content_hash, workspace_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document_index ON public.document_chunks(document_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_chunks_workspace ON public.document_chunks(workspace_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Documents RLS: Authorized workspace members can view and manage documents
DROP POLICY IF EXISTS "Users can view documents in authorized workspaces" ON public.documents;
CREATE POLICY "Users can view documents in authorized workspaces"
  ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.documents.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    ) OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can insert documents into authorized workspaces" ON public.documents;
CREATE POLICY "Users can insert documents into authorized workspaces"
  ON public.documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.documents.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    ) OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can update documents in authorized workspaces" ON public.documents;
CREATE POLICY "Users can update documents in authorized workspaces"
  ON public.documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.documents.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    ) OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can delete documents in authorized workspaces" ON public.documents;
CREATE POLICY "Users can delete documents in authorized workspaces"
  ON public.documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.documents.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    ) OR auth.uid() = user_id
  );

-- Chunks RLS
DROP POLICY IF EXISTS "Users can view chunks in authorized workspaces" ON public.document_chunks;
CREATE POLICY "Users can view chunks in authorized workspaces"
  ON public.document_chunks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.document_chunks.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert chunks into authorized workspaces" ON public.document_chunks;
CREATE POLICY "Users can insert chunks into authorized workspaces"
  ON public.document_chunks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.document_chunks.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    ) OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can delete chunks in authorized workspaces" ON public.document_chunks;
CREATE POLICY "Users can delete chunks in authorized workspaces"
  ON public.document_chunks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.document_chunks.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );
