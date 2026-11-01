-- ==============================================================================
-- SYNAPTIX COMMAND — Multi-Domain, Workspace-Isolated RAG Architecture Migration
-- ==============================================================================
-- Implements multi-domain configurations, workspace-isolated RAG metadata,
-- knowledge bases, document versioning, ingestion job queues, retrieval auditing,
-- and strict Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. WORKSPACE DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  terminology_synonyms JSONB NOT NULL DEFAULT '[]'::jsonb,
  system_prompt_instruction TEXT NOT NULL,
  compliance_frameworks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. WORKSPACE RAG CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS public.workspace_rag_configs (
  workspace_id TEXT PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  domain_id TEXT REFERENCES public.workspace_domains(id) ON DELETE RESTRICT NOT NULL,
  domain_name TEXT NOT NULL,
  domain_description TEXT,
  knowledge_base_id TEXT NOT NULL,
  embedding_model TEXT NOT NULL DEFAULT 'synaptix-tf-idf-vector-v2',
  embedding_dimension INTEGER NOT NULL DEFAULT 512,
  chunking_strategy TEXT NOT NULL DEFAULT 'semantic' CHECK (chunking_strategy IN ('semantic', 'fixed', 'hierarchical')),
  chunk_size INTEGER NOT NULL DEFAULT 600,
  chunk_overlap INTEGER NOT NULL DEFAULT 100,
  retrieval_strategy TEXT NOT NULL DEFAULT 'hybrid' CHECK (retrieval_strategy IN ('hybrid', 'semantic_only', 'keyword_only')),
  top_k INTEGER NOT NULL DEFAULT 5,
  similarity_threshold NUMERIC(4, 3) NOT NULL DEFAULT 0.050,
  reranking_configuration JSONB NOT NULL DEFAULT '{"enabled": true, "method": "reciprocal_rank_fusion", "minScore": 0.05}'::jsonb,
  supported_file_types JSONB NOT NULL DEFAULT '["PDF","DOCX","XLSX","CSV","TXT","MD","JSON","JPG","PNG"]'::jsonb,
  indexing_status TEXT NOT NULL DEFAULT 'READY' CHECK (indexing_status IN ('IDLE', 'INDEXING', 'READY', 'FAILED', 'OUTDATED')),
  knowledge_version INTEGER NOT NULL DEFAULT 1,
  configuration_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. KNOWLEDGE BASES TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_bases (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  domain_id TEXT REFERENCES public.workspace_domains(id) ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  document_count INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  total_bytes BIGINT NOT NULL DEFAULT 0,
  last_indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(workspace_id, name)
);

-- 4. DOCUMENT VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.document_versions (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  content_hash TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(document_id, version_number)
);

-- 5. INGESTION JOBS TABLE (ASYNC PROCESSING)
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING')),
  stage TEXT NOT NULL DEFAULT 'UPLOADED',
  progress_pct INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. RETRIEVAL AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.retrieval_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  retrieved_chunk_count INTEGER NOT NULL DEFAULT 0,
  context_chunk_count INTEGER NOT NULL DEFAULT 0,
  top_similarity_score NUMERIC(5, 4) DEFAULT 0.0,
  retrieval_latency_ms INTEGER NOT NULL DEFAULT 0,
  generation_latency_ms INTEGER NOT NULL DEFAULT 0,
  has_sufficient_evidence BOOLEAN NOT NULL DEFAULT false,
  confidence_level TEXT NOT NULL DEFAULT 'INSUFFICIENT' CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. KNOWLEDGE SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  uri TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'SYNCING', 'ERROR')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. EVIDENCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.evidence_records (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  chunk_id TEXT REFERENCES public.document_chunks(id) ON DELETE CASCADE NOT NULL,
  evidence_grade TEXT NOT NULL DEFAULT 'G1' CHECK (evidence_grade IN ('G0', 'G1', 'G2')),
  verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'PROVISIONAL', 'CONTRADICTED', 'STALE')),
  contradiction_notes TEXT,
  verified_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR RETRIEVAL, AUDIT & ISOLATION ENFORCEMENT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_rag_configs_domain ON public.workspace_rag_configs(domain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_workspace ON public.knowledge_bases(workspace_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_active ON public.document_versions(document_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_workspace_status ON public.ingestion_jobs(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_workspace_time ON public.retrieval_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_records_workspace_grade ON public.evidence_records(workspace_id, evidence_grade);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.workspace_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_rag_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrieval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;

-- Workspace Domains: Viewable by all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view domains" ON public.workspace_domains;
CREATE POLICY "Authenticated users can view domains"
  ON public.workspace_domains
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Workspace RAG Configs: Viewable and manageable only by workspace members
DROP POLICY IF EXISTS "Members can view workspace rag config" ON public.workspace_rag_configs;
CREATE POLICY "Members can view workspace rag config"
  ON public.workspace_rag_configs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.workspace_rag_configs.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update workspace rag config" ON public.workspace_rag_configs;
CREATE POLICY "Admins can update workspace rag config"
  ON public.workspace_rag_configs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.workspace_rag_configs.workspace_id
      AND workspace_memberships.user_id = auth.uid()
      AND workspace_memberships.role IN ('owner', 'admin')
    )
  );

-- Knowledge Bases RLS
DROP POLICY IF EXISTS "Members can view workspace knowledge bases" ON public.knowledge_bases;
CREATE POLICY "Members can view workspace knowledge bases"
  ON public.knowledge_bases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.knowledge_bases.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

-- Ingestion Jobs RLS
DROP POLICY IF EXISTS "Members can view workspace ingestion jobs" ON public.ingestion_jobs;
CREATE POLICY "Members can view workspace ingestion jobs"
  ON public.ingestion_jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.ingestion_jobs.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

-- Retrieval Logs RLS
DROP POLICY IF EXISTS "Members can view workspace retrieval logs" ON public.retrieval_logs;
CREATE POLICY "Members can view workspace retrieval logs"
  ON public.retrieval_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.retrieval_logs.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

-- Evidence Records RLS
DROP POLICY IF EXISTS "Members can view workspace evidence records" ON public.evidence_records;
CREATE POLICY "Members can view workspace evidence records"
  ON public.evidence_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_memberships
      WHERE workspace_memberships.workspace_id = public.evidence_records.workspace_id
      AND workspace_memberships.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- DEFAULT DOMAINS SEED DATA
-- ==============================================================================
INSERT INTO public.workspace_domains (id, name, code, description, terminology_synonyms, system_prompt_instruction, compliance_frameworks, is_custom)
VALUES
  (
    'domain-healthcare',
    'Healthcare',
    'HEALTHCARE',
    'Clinical protocols, hospital administrative operations, and HIPAA-compliant patient care analytics',
    '["clinical", "patient", "hipaa", "diagnosis", "protocol", "pharmaceutical", "physician", "ehr", "emr", "trial", "hospital", "fda"]'::jsonb,
    'You are an expert healthcare operations and medical intelligence assistant. Answer questions using only verified healthcare workspace evidence. Maintain strict privacy, respect clinical boundaries, and preserve medical and protocol terminology accurately.',
    '["HIPAA", "HITECH", "FDA 21 CFR Part 11", "SOC2 Type II"]'::jsonb,
    false
  ),
  (
    'domain-finance',
    'Finance',
    'FINANCE',
    'Financial intelligence, revenue modeling, expenditure auditing, and corporate regulatory compliance',
    '["ebitda", "revenue", "pnl", "margin", "expenditure", "audit", "sox", "gaap", "balance_sheet", "cash_flow", "procurement", "ledger"]'::jsonb,
    'You are a senior financial analyst and audit assistant for the Finance workspace. Answer questions about revenue, budgets, variance, and financial procedures using only retrieved evidence. Preserve numerical values, fiscal quarters, currency notations, and percentages exactly.',
    '["SOX", "GAAP", "IFRS", "SEC Regulations"]'::jsonb,
    false
  ),
  (
    'domain-education',
    'Education',
    'EDUCATION',
    'Academic curriculum standards, institutional policies, student learning outcomes, and accreditation',
    '["curriculum", "accreditation", "syllabus", "faculty", "gpa", "student_outcome", "pedagogy", "grading", "enrollment", "coursework"]'::jsonb,
    'You are an academic intelligence assistant for the Education workspace. Answer questions regarding curriculum, institutional policies, and student assessment metrics using only authorized workspace records.',
    '["FERPA", "Title IX", "Regional Accreditation Standards"]'::jsonb,
    false
  ),
  (
    'domain-manufacturing',
    'Manufacturing',
    'MANUFACTURING',
    'Industrial production engineering, quality assurance SOPs, supply chain logistics, and ISO compliance',
    '["sop", "six_sigma", "quality_control", "iso9001", "assembly", "yield", "defect_rate", "cnc", "procurement", "inventory", "supply_chain"]'::jsonb,
    'You are an industrial manufacturing operations engineer assistant. Answer questions on operational workflows, equipment manuals, and quality specifications using only indexed workspace records.',
    '["ISO 9001", "ISO 14001", "OSHA Safety Guidelines"]'::jsonb,
    false
  ),
  (
    'domain-research',
    'Research',
    'RESEARCH',
    'Scientific literature synthesis, hypothesis testing, clinical trial evaluation, and experimental methodology',
    '["hypothesis", "methodology", "literature", "peer_review", "statistical_significance", "p_value", "findings", "experiment", "dataset"]'::jsonb,
    'You are a scientific research intelligence assistant for the Research workspace. Analyze literature, methodologies, and findings based strictly on retrieved research evidence. Clearly distinguish established results from tentative findings.',
    '["Good Laboratory Practice (GLP)", "Open Science Framework"]'::jsonb,
    false
  ),
  (
    'domain-business',
    'Business Strategy',
    'BUSINESS',
    'Enterprise competitive positioning, strategic go-to-market planning, vendor management, and organizational policy',
    '["strategy", "market_share", "gtm", "vendor", "contract", "merger", "stakeholder", "governance", "procurement", "kpi", "okr"]'::jsonb,
    'You are an enterprise strategic advisor assistant for the Business workspace. Deliver strategic and operational insights grounded solely in authorized corporate policy and strategy documents.',
    '["Corporate Governance Framework", "SOC2"]'::jsonb,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  terminology_synonyms = EXCLUDED.terminology_synonyms,
  system_prompt_instruction = EXCLUDED.system_prompt_instruction,
  compliance_frameworks = EXCLUDED.compliance_frameworks,
  updated_at = TIMEZONE('utc', NOW());

