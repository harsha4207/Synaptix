/**
 * RAG Library — Public API
 * Central export point for the SYNAPTIX COMMAND workspace-isolated RAG system.
 */

// Types
export type {
  RagDocument,
  DocumentChunk,
  RagAnswer,
  RagCitation,
  RetrievedChunk,
  RagSearchParams,
  WorkspaceId,
  DocumentStatus,
  SupportedFileType,
  ProcessingStatusEvent,
  IngestionConfig,
  ChunkSourceRef,
} from './types';

// Store (low-level persistence)
export { ragStore } from './store';

// Ingestion pipeline
export {
  ingestDocument,
  retryIngestion,
  deleteDocument,
  listWorkspaceDocuments,
  getDocumentStatus,
} from './ingestion';

// Retrieval
export { ragQuery, searchWorkspace } from './retrieval';

// Multi-Domain & Workspace Isolation Architecture
export { domainRegistry, BUILT_IN_DOMAINS } from './domainRegistry';
export type { WorkspaceDomain } from './domainRegistry';

export { workspaceRagConfigService } from './workspaceRagConfig';
export type {
  WorkspaceRagConfig,
  RerankingConfig,
  ChunkingStrategy,
  RetrievalStrategy,
  IndexingStatus,
  WorkspaceKnowledgeBaseStatus,
} from './workspaceRagConfig';

export { multiDomainRetrieval, MultiDomainRetrievalEngine } from './multiDomainRetrieval';
export type { MultiDomainQueryParams, RetrievalDiagnosticInfo } from './multiDomainRetrieval';

export { ingestionPipeline, IngestionPipelineService } from './ingestionPipeline';
export type { IngestionJob, IngestionJobStatus, IngestionStage, IngestOptions } from './ingestionPipeline';

// React context
export { RagProvider, useRag } from './RagContext';
export type { RagDocumentWithProgress, RagProviderProps } from './RagContext';

// Validation utilities
export {
  validateFile,
  computeHash,
  generateId,
  sanitizeFilename,
  DEFAULT_INGESTION_CONFIG,
} from './validation';
