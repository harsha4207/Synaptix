import { describe, it, expect } from 'vitest';
import { chunkDocument } from '../src/lib/rag/chunking';
import { DEFAULT_INGESTION_CONFIG } from '../src/lib/rag/validation';
import type { ExtractedSection } from '../src/lib/rag/extraction';

describe('RAG Chunking Service', () => {
  const baseConfig = {
    ...DEFAULT_INGESTION_CONFIG,
    chunkSize: 100, // 100 tokens ≈ 400 chars
    chunkOverlap: 20, // 20 tokens ≈ 80 chars
    minChunkLength: 30,
  };

  it('produces chunks with valid metadata and sequential chunk indices', () => {
    const sections: ExtractedSection[] = [
      {
        type: 'paragraph',
        content: 'This is the first paragraph with adequate length to produce a valid chunk in our test suite. It contains detailed domain information about enterprise compliance.',
        pageNumber: 1,
      },
      {
        type: 'paragraph',
        content: 'This is the second paragraph that describes subsequent procedural rules and requirements. Ensuring high accuracy in RAG operations.',
        pageNumber: 2,
      },
    ];

    const chunks = chunkDocument(
      sections,
      'doc-123',
      'workspace-finance',
      'org-synaptix',
      'financial_audit.pdf',
      baseConfig
    );

    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[1].chunkIndex).toBe(1);
    expect(chunks[0].documentId).toBe('doc-123');
    expect(chunks[0].workspaceId).toBe('workspace-finance');
    expect(chunks[0].organizationId).toBe('org-synaptix');
    expect(chunks[0].sourceRef.filename).toBe('financial_audit.pdf');
    expect(chunks[0].sourceRef.pageNumber).toBe(1);
    expect(chunks[1].sourceRef.pageNumber).toBe(2);
  });

  it('prepends heading to following paragraph section', () => {
    const sections: ExtractedSection[] = [
      {
        type: 'heading',
        content: 'SECTION 4.2: RISK CONTROLS',
      },
      {
        type: 'paragraph',
        content: 'All financial transfers exceeding $50,000 require dual authorization by independent signatories before clearing.',
        pageNumber: 4,
      },
    ];

    const chunks = chunkDocument(
      sections,
      'doc-456',
      'workspace-finance',
      'org-synaptix',
      'risk_policy.docx',
      baseConfig
    );

    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].content).toContain('SECTION 4.2: RISK CONTROLS');
    expect(chunks[0].content).toContain('dual authorization');
  });

  it('preserves small tables as coherent standalone units', () => {
    const tableContent = 'Header1 | Header2 | Header3\nVal1 | Val2 | Val3\nVal4 | Val5 | Val6';
    const sections: ExtractedSection[] = [
      {
        type: 'table',
        content: tableContent,
        pageNumber: 1,
        sheetName: 'Q3_Summary',
        rowStart: 1,
        rowEnd: 3,
      },
    ];

    const chunks = chunkDocument(
      sections,
      'doc-table',
      'workspace-finance',
      'org-synaptix',
      'sheet.xlsx',
      baseConfig
    );

    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe(tableContent);
    expect(chunks[0].sourceRef.sheetName).toBe('Q3_Summary');
    expect(chunks[0].sourceRef.rowRange).toEqual([1, 3]);
  });

  it('filters out chunks smaller than minChunkLength', () => {
    const sections: ExtractedSection[] = [
      {
        type: 'paragraph',
        content: 'Too short', // < minChunkLength (30)
      },
    ];

    const chunks = chunkDocument(
      sections,
      'doc-short',
      'workspace-finance',
      'org-synaptix',
      'notes.txt',
      baseConfig
    );

    expect(chunks.length).toBe(0);
  });
});
