/**
 * Document Ingestion Service
 * Orchestrates the full ingestion pipeline with status tracking and idempotency.
 *
 * Pipeline:
 *   UPLOADED → VALIDATING → EXTRACTING → CHUNKING → EMBEDDING → INDEXING → READY
 */

import type {
  RagDocument,
  DocumentChunk,
  WorkspaceId,
  ProcessingStatusEvent,
  SupportedFileType,
} from './types';
import { ragStore } from './store';
import { validateFile, computeHash, generateId, sanitizeFilename, DEFAULT_INGESTION_CONFIG } from './validation';
import { extractTextFromFile } from './extraction';
import { chunkDocument } from './chunking';
import { computeChunkEmbedding } from './embedding';

export type StatusCallback = (event: ProcessingStatusEvent) => void;

const MAX_RETRY_ATTEMPTS = 3;

/**
 * Ingest a file into the workspace RAG system.
 * Returns the document ID.
 */
export async function ingestDocument(
  file: File,
  workspaceId: WorkspaceId,
  organizationId: string,
  onStatus?: StatusCallback,
  retryAttempt = 0
): Promise<string> {
  const safeFilename = sanitizeFilename(file.name);

  // ── Stage 1: Validate ──────────────────────────────────────────────────────
  let docId = generateId();

  const emit = (
    status: ProcessingStatusEvent['status'],
    extra?: Partial<ProcessingStatusEvent>
  ) => {
    onStatus?.({ documentId: docId, status, ...extra });
  };

  emit('VALIDATING', { message: 'Validating file type and size...' });

  const validation = validateFile(file);
  if (!validation.valid || !validation.fileType) {
    emit('FAILED', { errorMessage: validation.error ?? 'Validation failed' });
    throw new Error(validation.error ?? 'Validation failed');
  }

  const fileType = validation.fileType as SupportedFileType;

  // ── Stage 2: Check idempotency & duplicate handling ──────────────────────
  emit('UPLOADED', { message: 'Computing content hash...' });

  const arrayBuffer = await file.arrayBuffer();
  const contentHash = await computeHash(arrayBuffer);

  const existingByHash = await ragStore.findByContentHash(contentHash, workspaceId);
  if (existingByHash && existingByHash.status === 'READY') {
    // Idempotent: same content already indexed
    await ragStore.cleanupDuplicates(workspaceId);
    emit('READY', { message: `Document already indexed (${existingByHash.filename})` });
    return existingByHash.id;
  }

  // Check if an existing document record exists for this filename (e.g., previous failed/retrying attempt)
  const existingByFilename = await ragStore.findByFilename(safeFilename, workspaceId);
  if (existingByFilename) {
    docId = existingByFilename.id;
    // Clean up old chunks first to prevent orphaned records
    await ragStore.deleteChunksByDocument(docId, workspaceId);
  }

  // ── Stage 3: Create / Update document record ──────────────────────────────
  const now = new Date().toISOString();
  const doc: RagDocument = {
    id: docId,
    workspaceId,
    organizationId,
    filename: safeFilename,
    fileType,
    sizeBytes: file.size,
    contentHash,
    status: 'EXTRACTING',
    source: 'Direct Upload',
    chunkCount: 0,
    ocrApplied: false,
    uploadedAt: existingByFilename ? existingByFilename.uploadedAt : now,
    updatedAt: now,
    metadata: {},
  };

  await ragStore.saveDocument(doc);
  emit('EXTRACTING', { message: `Extracting text from ${fileType}...`, progress: 20 });

  try {
    // ── Stage 4: Extract text ────────────────────────────────────────────────
    const extraction = await extractTextFromFile(new File([arrayBuffer], safeFilename, { type: file.type }), fileType);

    if (extraction.error && !extraction.text) {
      throw new Error(extraction.error);
    }

    if (!extraction.text || extraction.text.trim().length === 0) {
      throw new Error('No readable text could be extracted from this document.');
    }

    // Update document with extracted metadata
    await ragStore.updateDocumentStatus(docId, workspaceId, 'CHUNKING', {
      metadata: extraction.metadata,
      ocrApplied: extraction.ocrApplied,
    });
    emit('CHUNKING', { message: 'Splitting into indexed chunks...', progress: 40 });

    // ── Stage 5: Chunk ───────────────────────────────────────────────────────
    const rawChunks = chunkDocument(
      extraction.sections.length > 0
        ? extraction.sections
        : [{ type: 'paragraph', content: extraction.text }],
      docId,
      workspaceId,
      organizationId,
      safeFilename,
      DEFAULT_INGESTION_CONFIG
    );

    if (rawChunks.length === 0) {
      if (extraction.text && extraction.text.trim().length > 0) {
        rawChunks.push({
          id: generateId(),
          documentId: docId,
          workspaceId,
          organizationId,
          chunkIndex: 0,
          content: extraction.text.trim(),
          sourceRef: { filename: safeFilename },
          createdAt: new Date().toISOString(),
        });
      } else {
        throw new Error('Document produced no indexable chunks after processing.');
      }
    }

    // ── Stage 6: Embed ───────────────────────────────────────────────────────
    await ragStore.updateDocumentStatus(docId, workspaceId, 'EMBEDDING');
    emit('EMBEDDING', { message: 'Computing embeddings...', progress: 60 });

    // Get existing chunk contents for corpus-level IDF
    const existingChunks = await ragStore.getChunksByWorkspace(workspaceId);
    const existingContents = existingChunks.map((c) => c.content);

    const chunks: DocumentChunk[] = await Promise.all(
      rawChunks.map(async (raw) => {
        const embedding = computeChunkEmbedding(
          raw.content,
          [...existingContents, raw.content]
        );
        const chunkHash = await computeHash(
          new TextEncoder().encode(raw.content).buffer as ArrayBuffer
        );
        return {
          ...raw,
          embedding,
          contentHash: chunkHash,
        };
      })
    );

    // ── Stage 7: Index ───────────────────────────────────────────────────────
    await ragStore.updateDocumentStatus(docId, workspaceId, 'INDEXING');
    emit('INDEXING', { message: 'Persisting to workspace index...', progress: 80 });

    await ragStore.saveChunks(chunks);

    // ── Stage 8: Ready ───────────────────────────────────────────────────────
    await ragStore.updateDocumentStatus(docId, workspaceId, 'READY', {
      chunkCount: chunks.length,
    });
    emit('READY', { message: `Indexed ${chunks.length} chunks`, progress: 100 });

    return docId;

  } catch (err) {
    const errorMessage = (err as Error).message;

    // Retry logic for transient errors
    const isPermanentError = errorMessage.includes('Validation failed') ||
      errorMessage.includes('No readable text') ||
      errorMessage.includes('Invalid JSON');

    if (!isPermanentError && retryAttempt < MAX_RETRY_ATTEMPTS) {
      await ragStore.updateDocumentStatus(docId, workspaceId, 'RETRYING', {
        errorMessage: `Attempt ${retryAttempt + 1} failed: ${errorMessage}. Retrying...`,
      });
      emit('RETRYING', {
        errorMessage: `Retrying (attempt ${retryAttempt + 2}/${MAX_RETRY_ATTEMPTS + 1})...`,
      });
      return ingestDocument(file, workspaceId, organizationId, onStatus, retryAttempt + 1);
    }

    await ragStore.updateDocumentStatus(docId, workspaceId, 'FAILED', {
      errorMessage,
    });
    emit('FAILED', { errorMessage });
    throw err;
  }
}

/**
 * Retry a failed document ingestion by document ID.
 * The original file must be re-supplied (browser security: cannot re-read without user gesture).
 */
export async function retryIngestion(
  file: File,
  documentId: string,
  workspaceId: WorkspaceId,
  organizationId: string,
  onStatus?: StatusCallback
): Promise<string> {
  // Delete old chunks and reset status
  await ragStore.deleteChunksByDocument(documentId, workspaceId);
  await ragStore.updateDocumentStatus(documentId, workspaceId, 'UPLOADED');

  return ingestDocument(file, workspaceId, organizationId, onStatus);
}

/**
 * Delete a document and all its chunks from a workspace.
 * Validates workspace membership before deletion.
 */
export async function deleteDocument(
  documentId: string,
  workspaceId: WorkspaceId,
  organizationId: string
): Promise<void> {
  const doc = await ragStore.getDocument(documentId, workspaceId);
  if (!doc) throw new Error('Document not found or unauthorized');
  if (doc.organizationId !== organizationId) throw new Error('Unauthorized: organization mismatch');
  await ragStore.deleteDocument(documentId, workspaceId);
}

/**
 * Get all documents for a workspace with authorization check.
 */
export async function listWorkspaceDocuments(
  workspaceId: WorkspaceId,
  organizationId: string
): Promise<RagDocument[]> {
  await ragStore.cleanupDuplicates(workspaceId);
  const docs = await ragStore.getDocumentsByWorkspace(workspaceId);
  return docs.filter((d) => d.organizationId === organizationId);
}

/**
 * Get document status with authorization check.
 */
export async function getDocumentStatus(
  documentId: string,
  workspaceId: WorkspaceId,
  organizationId: string
): Promise<RagDocument | null> {
  const doc = await ragStore.getDocument(documentId, workspaceId);
  if (!doc) return null;
  if (doc.organizationId !== organizationId) return null; // Don't reveal existence
  return doc;
}
