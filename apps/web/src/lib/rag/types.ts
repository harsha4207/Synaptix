/**
 * RAG Type Definitions
 * Central type definitions for the SYNAPTIX COMMAND workspace-isolated RAG system.
 */

export type WorkspaceId = 'finance' | 'research' | 'healthcare' | 'education' | 'business' | string;

export type DocumentStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'EXTRACTING'
  | 'CHUNKING'
  | 'EMBEDDING'
  | 'INDEXING'
  | 'READY'
  | 'FAILED'
  | 'RETRYING';

export type SupportedFileType =
  | 'PDF'
  | 'DOCX'
  | 'XLSX'
  | 'CSV'
  | 'TXT'
  | 'MD'
  | 'JSON'
  | 'JPG'
  | 'JPEG'
  | 'PNG';

/** Represents an ingested document stored in the RAG index. */
export interface RagDocument {
  /** Unique document ID (UUID) */
  id: string;
  /** The workspace this document belongs to — enforces isolation */
  workspaceId: WorkspaceId;
  /** Organization scope (defaults to org derived from user session) */
  organizationId: string;
  /** Original filename */
  filename: string;
  /** Normalized file type */
  fileType: SupportedFileType;
  /** Human-readable file size */
  sizeBytes: number;
  /** SHA-256 content hash for deduplication */
  contentHash: string;
  /** Processing pipeline state */
  status: DocumentStatus;
  /** Error message if status is FAILED */
  errorMessage?: string;
  /** Source metadata */
  source: 'Direct Upload' | 'S3 Bucket' | 'API Sync';
  /** Number of chunks produced */
  chunkCount: number;
  /** True if OCR was applied */
  ocrApplied: boolean;
  /** Upload timestamp */
  uploadedAt: string;
  /** Last updated timestamp */
  updatedAt: string;
  /** Domain-specific metadata */
  metadata: DocumentMetadata;
}

/** Extracted metadata from document content */
export interface DocumentMetadata {
  pageCount?: number;
  sheetNames?: string[];
  rowCount?: number;
  columnNames?: string[];
  language?: string;
  title?: string;
  author?: string;
  /** Extracted section headings */
  headings?: string[];
  /** Extracted named entities */
  entities?: string[];
  /** Summary of the document content */
  summary?: string;
  /** Complete extracted text content */
  rawText?: string;
}

/** A chunk of text derived from a document, ready for embedding and retrieval */
export interface DocumentChunk {
  /** Unique chunk ID */
  id: string;
  /** Parent document ID */
  documentId: string;
  /** Workspace ID — duplicated for efficient retrieval queries */
  workspaceId: WorkspaceId;
  /** Organization ID — duplicated for security filtering */
  organizationId: string;
  /** Zero-based chunk index within the document */
  chunkIndex: number;
  /** Text content of this chunk */
  content: string;
  /** TF-IDF term frequency vector (serialized) */
  embedding: Record<string, number>;
  /** Source location metadata */
  sourceRef: ChunkSourceRef;
  /** SHA-256 hash of chunk content */
  contentHash: string;
  /** Created timestamp */
  createdAt: string;
}

/** Source location reference for a chunk */
export interface ChunkSourceRef {
  filename: string;
  /** Page number (PDF) */
  pageNumber?: number;
  /** Section heading (DOCX/MD) */
  sectionHeading?: string;
  /** Sheet name (XLSX) */
  sheetName?: string;
  /** Row range (CSV/XLSX) */
  rowRange?: [number, number];
  /** Character offset range in the original document */
  charRange?: [number, number];
}

/** A retrieved chunk with its similarity score */
export interface RetrievedChunk {
  chunk: DocumentChunk;
  document: RagDocument;
  /** Combined similarity score (0–1) */
  score: number;
  /** TF-IDF cosine similarity component */
  semanticScore: number;
  /** Keyword match overlap component */
  keywordScore: number;
}

/** A citation pointing to a real source record */
export interface RagCitation {
  documentId: string;
  filename: string;
  chunkId: string;
  /** Excerpt from the supporting chunk */
  excerpt: string;
  /** Location metadata */
  location: ChunkSourceRef;
  /** Combined relevance score */
  relevanceScore: number;
}

/** The complete RAG answer returned to the UI */
export interface RagAnswer {
  /** Unique answer/request ID */
  id: string;
  /** The original query */
  query: string;
  /** The workspace context */
  workspaceId: WorkspaceId;
  /** The generated answer text */
  answer: string;
  /** Whether there was sufficient evidence */
  hasSufficientEvidence: boolean;
  /** Source citations (traceable to real records) */
  citations: RagCitation[];
  /** Qualitative confidence indicator */
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  /** Number of chunks retrieved */
  retrievedChunkCount: number;
  /** Number of chunks used in context */
  contextChunkCount: number;
  /** Retrieval latency ms */
  retrievalMs: number;
  /** Generation latency ms */
  generationMs: number;
  /** ISO timestamp */
  timestamp: string;
}

/** Search query parameters */
export interface RagSearchParams {
  query: string;
  workspaceId: WorkspaceId;
  organizationId: string;
  /** Maximum candidates to retrieve */
  topK?: number;
  /** Minimum similarity threshold (0–1) */
  similarityThreshold?: number;
  /** Optional file type filter */
  fileTypeFilter?: SupportedFileType[];
  /** Optional document ID filter */
  documentIdFilter?: string[];
}

/** Ingestion pipeline configuration */
export interface IngestionConfig {
  /** Approximate tokens per chunk */
  chunkSize: number;
  /** Approximate overlap tokens between adjacent chunks */
  chunkOverlap: number;
  /** Minimum chunk character length to index */
  minChunkLength: number;
  /** Maximum file size in bytes */
  maxFileSizeBytes: number;
  /** Allowed file types */
  allowedTypes: SupportedFileType[];
}

/** Processing status event for UI updates */
export interface ProcessingStatusEvent {
  documentId: string;
  status: DocumentStatus;
  progress?: number;
  message?: string;
  errorMessage?: string;
}
