import { describe, it, expect, beforeEach } from 'vitest';
import { ragStore } from '../src/lib/rag/store';
import { searchWorkspace } from '../src/lib/rag/retrieval';
import type { RagDocument, DocumentChunk } from '../src/lib/rag/types';

describe('RAG Workspace Isolation Enforcement', () => {
  beforeEach(() => {
    ragStore.clearMemory();
  });

  const docWs1: RagDocument = {
    id: 'doc-ws1-001',
    workspaceId: 'workspace-finance',
    organizationId: 'synaptix-enterprise',
    filename: 'finance_confidential_ledger.pdf',
    fileType: 'PDF',
    sizeBytes: 2048,
    contentHash: 'hash-ws1-ledger',
    status: 'READY',
    source: 'Upload',
    chunkCount: 1,
    ocrApplied: false,
    uploadedAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    metadata: {},
  };

  const docWs2: RagDocument = {
    id: 'doc-ws2-001',
    workspaceId: 'workspace-healthcare',
    organizationId: 'synaptix-enterprise',
    filename: 'patient_health_records.pdf',
    fileType: 'PDF',
    sizeBytes: 4096,
    contentHash: 'hash-ws2-health',
    status: 'READY',
    source: 'Upload',
    chunkCount: 1,
    ocrApplied: false,
    uploadedAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    metadata: {},
  };

  const chunkWs1: DocumentChunk = {
    id: 'chunk-ws1-001',
    documentId: 'doc-ws1-001',
    workspaceId: 'workspace-finance',
    organizationId: 'synaptix-enterprise',
    chunkIndex: 0,
    content: 'Classified Q3 Finance budget reallocation totaling $45 million approved by CFO Vance.',
    embedding: {},
    contentHash: 'chunk-hash-1',
    sourceRef: { filename: 'finance_confidential_ledger.pdf', pageNumber: 1 },
    createdAt: '2026-10-01T00:00:00Z',
  };

  const chunkWs2: DocumentChunk = {
    id: 'chunk-ws2-001',
    documentId: 'doc-ws2-001',
    workspaceId: 'workspace-healthcare',
    organizationId: 'synaptix-enterprise',
    chunkIndex: 0,
    content: 'Clinical trial patient protocol HIPAA compliance records and clinical outcomes.',
    embedding: {},
    contentHash: 'chunk-hash-2',
    sourceRef: { filename: 'patient_health_records.pdf', pageNumber: 1 },
    createdAt: '2026-10-01T00:00:00Z',
  };

  it('strictly isolates document retrieval by workspace ID', async () => {
    await ragStore.saveDocument(docWs1);
    await ragStore.saveDocument(docWs2);

    // List by workspace
    const financeDocs = await ragStore.getDocumentsByWorkspace('workspace-finance');
    const healthDocs = await ragStore.getDocumentsByWorkspace('workspace-healthcare');

    expect(financeDocs).toHaveLength(1);
    expect(financeDocs[0].id).toBe('doc-ws1-001');

    expect(healthDocs).toHaveLength(1);
    expect(healthDocs[0].id).toBe('doc-ws2-001');
  });

  it('rejects direct document ID lookup when queried from the wrong workspace', async () => {
    await ragStore.saveDocument(docWs1);

    // Valid workspace query
    const validLookup = await ragStore.getDocument('doc-ws1-001', 'workspace-finance');
    expect(validLookup).not.toBeNull();
    expect(validLookup?.filename).toBe('finance_confidential_ledger.pdf');

    // Cross-workspace unauthorized query with same document ID
    const crossLookup = await ragStore.getDocument('doc-ws1-001', 'workspace-healthcare');
    expect(crossLookup).toBeNull();
  });

  it('strictly isolates chunk storage and retrieval by workspace ID', async () => {
    await ragStore.saveChunks([chunkWs1, chunkWs2]);

    const financeChunks = await ragStore.getChunksByWorkspace('workspace-finance');
    const healthChunks = await ragStore.getChunksByWorkspace('workspace-healthcare');

    expect(financeChunks).toHaveLength(1);
    expect(financeChunks[0].id).toBe('chunk-ws1-001');

    expect(healthChunks).toHaveLength(1);
    expect(healthChunks[0].id).toBe('chunk-ws2-001');
  });

  it('prevents cross-workspace data leakage during semantic search', async () => {
    await ragStore.saveDocument(docWs1);
    await ragStore.saveDocument(docWs2);
    await ragStore.saveChunks([chunkWs1, chunkWs2]);

    // Query healthcare workspace with finance keywords
    const searchInHealthcare = await searchWorkspace({
      query: 'budget reallocation $45 million CFO Vance',
      workspaceId: 'workspace-healthcare',
      organizationId: 'synaptix-enterprise',
    });

    // Healthcare workspace must NEVER return finance chunks
    expect(searchInHealthcare).toHaveLength(0);

    // Query finance workspace with same keywords
    const searchInFinance = await searchWorkspace({
      query: 'budget reallocation $45 million CFO Vance',
      workspaceId: 'workspace-finance',
      organizationId: 'synaptix-enterprise',
    });

    expect(searchInFinance.length).toBeGreaterThanOrEqual(1);
    expect(searchInFinance[0].chunk.id).toBe('chunk-ws1-001');
    expect(searchInFinance[0].document.id).toBe('doc-ws1-001');
  });

  it('content hash lookup respects workspace boundaries', async () => {
    await ragStore.saveDocument(docWs1);

    const foundInFinance = await ragStore.findByContentHash('hash-ws1-ledger', 'workspace-finance');
    expect(foundInFinance).not.toBeNull();

    const foundInHealthcare = await ragStore.findByContentHash('hash-ws1-ledger', 'workspace-healthcare');
    expect(foundInHealthcare).toBeNull();
  });
});
