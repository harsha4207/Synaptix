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
