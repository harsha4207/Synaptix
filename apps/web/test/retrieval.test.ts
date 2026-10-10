import { describe, it, expect, beforeEach } from 'vitest';
import { ragStore } from '../src/lib/rag/store';
import { ragQuery, searchWorkspace } from '../src/lib/rag/retrieval';
import type { RagDocument, DocumentChunk } from '../src/lib/rag/types';

describe('RAG Retrieval & Grounded Answer Service', () => {
  beforeEach(() => {
    ragStore.clearMemory();
  });

  const testDoc: RagDocument = {
    id: 'doc-retrieval-1',
    workspaceId: 'finance',
    organizationId: 'synaptix-enterprise',
    filename: 'FY2026_Capital_Budget.pdf',
    fileType: 'PDF',
    sizeBytes: 8192,
    contentHash: 'hash-budget',
    status: 'READY',
    source: 'Upload',
    chunkCount: 2,
    ocrApplied: false,
    uploadedAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    metadata: {},
  };

  const testChunk1: DocumentChunk = {
    id: 'chunk-b1',
    documentId: 'doc-retrieval-1',
    workspaceId: 'finance',
    organizationId: 'synaptix-enterprise',
    chunkIndex: 0,
    content: 'Capital expenditure for cloud AI infrastructure is projected at $18.4 million with expected 32% efficiency improvement by Q4 2026.',
    embedding: {},
    contentHash: 'chash-1',
    sourceRef: { filename: 'FY2026_Capital_Budget.pdf', pageNumber: 3, sectionHeading: 'CapEx Allocations' },
    createdAt: '2026-10-01T00:00:00Z',
  };

  const testChunk2: DocumentChunk = {
    id: 'chunk-b2',
    documentId: 'doc-retrieval-1',
    workspaceId: 'finance',
    organizationId: 'synaptix-enterprise',
    chunkIndex: 1,
    content: 'Operating reserves are maintained at a minimum 120-day liquidity buffer adhering strictly to SOX compliance guidelines.',
    embedding: {},
    contentHash: 'chash-2',
    sourceRef: { filename: 'FY2026_Capital_Budget.pdf', pageNumber: 7, sectionHeading: 'Liquidity Policy' },
    createdAt: '2026-10-01T00:00:00Z',
  };

  it('generates grounded answers with traceable citations when evidence is found', async () => {
    await ragStore.saveDocument(testDoc);
    await ragStore.saveChunks([testChunk1, testChunk2]);

    const answer = await ragQuery({
      query: 'What is the projected capital expenditure for cloud AI infrastructure?',
      workspaceId: 'finance',
      organizationId: 'synaptix-enterprise',
    });

    expect(answer).toBeDefined();
    expect(answer.workspaceId).toBe('finance');
    expect(answer.citations.length).toBeGreaterThanOrEqual(1);
    expect(answer.citations[0].filename).toBe('FY2026_Capital_Budget.pdf');
    expect(answer.citations[0].location.pageNumber).toBe(3);
    expect(answer.citations[0].location.sectionHeading).toBe('CapEx Allocations');
    expect(answer.answer).toContain('18.4 million');
  }, 15000);

  it('correctly reports insufficient evidence when no matching chunks exist', async () => {
    await ragStore.saveDocument(testDoc);
    await ragStore.saveChunks([testChunk1, testChunk2]);

    const answer = await ragQuery({
      query: 'Explain the quantum entanglement molecular dynamics model',
      workspaceId: 'finance',
      organizationId: 'synaptix-enterprise',
    });

    expect(answer.hasSufficientEvidence).toBe(false);
    expect(answer.confidenceLevel).toBe('INSUFFICIENT');
    expect(answer.answer).toContain('No relevant evidence');
  });

  it('filters search results by document ID when requested', async () => {
    await ragStore.saveDocument(testDoc);
    await ragStore.saveChunks([testChunk1, testChunk2]);

    const results = await searchWorkspace({
      query: 'liquidity buffer SOX compliance',
      workspaceId: 'finance',
      organizationId: 'synaptix-enterprise',
      documentIdFilter: ['doc-retrieval-1'],
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].chunk.id).toBe('chunk-b2');
  });
});
