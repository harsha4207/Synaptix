import { describe, it, expect } from 'vitest';
import {
  embedChunks,
  searchChunks,
  computeChunkEmbedding,
} from '../src/lib/rag/embedding';
import type { DocumentChunk, RagDocument } from '../src/lib/rag/types';

describe('TF-IDF Embedding and Vector Search Service', () => {
  const dummyDoc: RagDocument = {
    id: 'doc-1',
    workspaceId: 'ws-finance',
    organizationId: 'org-1',
    filename: 'quarterly_financials.pdf',
    fileType: 'PDF',
    sizeBytes: 1024,
    contentHash: 'hash-1',
    status: 'READY',
    source: 'Upload',
    chunkCount: 3,
    ocrApplied: false,
    uploadedAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    metadata: {},
  };

  const chunks: DocumentChunk[] = [
    {
      id: 'chunk-1',
      documentId: 'doc-1',
      workspaceId: 'ws-finance',
      organizationId: 'org-1',
      chunkIndex: 0,
      content: 'The company reported total quarterly revenue of $42.5 million with gross margin expanding to 68.4%.',
      embedding: {},
      contentHash: 'hash-c1',
      sourceRef: { filename: 'quarterly_financials.pdf', pageNumber: 1 },
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'chunk-2',
      documentId: 'doc-1',
      workspaceId: 'ws-finance',
      organizationId: 'org-1',
      chunkIndex: 1,
      content: 'Operating expenditures reached $12 million primarily driven by research and cloud infrastructure scaling.',
      embedding: {},
      contentHash: 'hash-c2',
      sourceRef: { filename: 'quarterly_financials.pdf', pageNumber: 2 },
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'chunk-3',
      documentId: 'doc-1',
      workspaceId: 'ws-finance',
      organizationId: 'org-1',
      chunkIndex: 2,
      content: 'Regulatory audit by KPMG confirmed compliance with international accounting standards without exceptions.',
      embedding: {},
      contentHash: 'hash-c3',
      sourceRef: { filename: 'quarterly_financials.pdf', pageNumber: 3 },
      createdAt: '2026-10-01T00:00:00Z',
    },
  ];

  it('embedChunks generates non-empty TF-IDF vectors for documents', () => {
    const vectors = embedChunks(chunks);
    expect(vectors).toHaveLength(3);
    expect(Object.keys(vectors[0]).length).toBeGreaterThan(0);
    expect(vectors[0]['revenue']).toBeDefined();
    expect(vectors[0]['quarterly']).toBeDefined();
  });

  it('searchChunks accurately retrieves the most relevant chunk for a query', () => {
    const docMap = new Map<string, RagDocument>([['doc-1', dummyDoc]]);
    const results = searchChunks('what was total quarterly revenue and margin?', chunks, docMap, {
      topK: 2,
      similarityThreshold: 0.05,
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].chunk.id).toBe('chunk-1');
    expect(results[0].score).toBeGreaterThan(0.2);
    expect(results[0].document.id).toBe('doc-1');
  });

  it('searchChunks correctly retrieves audit and compliance chunks', () => {
    const docMap = new Map<string, RagDocument>([['doc-1', dummyDoc]]);
    const results = searchChunks('KPMG regulatory audit compliance standards', chunks, docMap, {
      topK: 1,
    });

    expect(results).toHaveLength(1);
    expect(results[0].chunk.id).toBe('chunk-3');
    expect(results[0].chunk.content).toContain('KPMG');
  });

  it('ignores chunks from documents that are not in READY status', () => {
    const notReadyDoc: RagDocument = {
      ...dummyDoc,
      status: 'PROCESSING',
    };
    const docMap = new Map<string, RagDocument>([['doc-1', notReadyDoc]]);
    const results = searchChunks('quarterly revenue', chunks, docMap);

    expect(results).toHaveLength(0);
  });

  it('computeChunkEmbedding generates consistent vector for an individual chunk', () => {
    const vector = computeChunkEmbedding(chunks[0].content, chunks.map((c) => c.content));
    expect(vector['revenue']).toBeGreaterThan(0);
    expect(vector['million']).toBeGreaterThan(0);
  });
});
