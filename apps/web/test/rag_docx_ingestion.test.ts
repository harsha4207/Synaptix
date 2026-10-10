import { describe, it, expect, beforeEach } from 'vitest';
import { ingestDocument } from '../src/lib/rag/ingestion';
import { ragStore } from '../src/lib/rag/store';
import { ragQuery } from '../src/lib/rag/retrieval';
import { validateFile, detectFileType } from '../src/lib/rag/validation';
import { chunkDocument } from '../src/lib/rag/chunking';
import { DEFAULT_INGESTION_CONFIG } from '../src/lib/rag/validation';

describe('DOCX & Evaluation Sheet Ingestion Fix Verification', () => {
  const orgId = 'synaptix-enterprise';

  beforeEach(() => {
    ragStore.clearMemory();
  });

  it('correctly classifies .docx files as DOCX regardless of browser MIME type', () => {
    const docxFileWithMime = new File(['dummy'], 'Project_Review-3 Evaluation Sheet.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(detectFileType(docxFileWithMime)).toBe('DOCX');
    expect(validateFile(docxFileWithMime).fileType).toBe('DOCX');

    const docxFileWithoutMime = new File(['dummy'], 'Project_Review-3 Evaluation Sheet.docx', {
      type: '',
    });
    expect(detectFileType(docxFileWithoutMime)).toBe('DOCX');
    expect(validateFile(docxFileWithoutMime).fileType).toBe('DOCX');
  });

  it('chunks evaluation sheets with short lines, criteria, and scores without dropping them', () => {
    const sections = [
      { type: 'heading' as const, content: 'PROJECT REVIEW 3 EVALUATION SHEET' },
      { type: 'paragraph' as const, content: 'Team ID: SYN-042 | Lead: Sarah Chen' },
      { type: 'table' as const, content: 'Columns: Criteria | Max Score | Awarded Score\nArchitecture Design | 25 | 24.5\nAI Router & RAG Pipeline | 35 | 34.0\nGovernance & SAML RBAC | 20 | 19.5\nProduction Deployment | 20 | 20.0' },
      { type: 'heading' as const, content: 'Evaluator Remarks' },
      { type: 'paragraph' as const, content: 'Total Score: 98.0 / 100. Outstanding real-time vector retrieval and zero-leakage workspace tenancy.' },
    ];

    const chunks = chunkDocument(
      sections,
      'doc-eval-123',
      'finance',
      orgId,
      'Project_Review-3 Evaluation Sheet.docx',
      DEFAULT_INGESTION_CONFIG
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((c) => c.content.includes('Architecture Design'))).toBe(true);
    expect(chunks.some((c) => c.content.includes('98.0 / 100'))).toBe(true);
    expect(chunks.some((c) => c.content.includes('SYN-042'))).toBe(true);
  });

  it('handles documents that contain only headings or short evaluation lines without failing', () => {
    const sections = [
      { type: 'heading' as const, content: 'Candidate: Alice' },
      { type: 'heading' as const, content: 'Status: Approved' },
      { type: 'heading' as const, content: 'Grade: A+' },
    ];

    const chunks = chunkDocument(
      sections,
      'doc-short-123',
      'finance',
      orgId,
      'short_eval.docx',
      DEFAULT_INGESTION_CONFIG
    );

    expect(chunks.length).toBeGreaterThan(0);
  });

  it('ingests and answers queries from structured evaluation sheets in Finance workspace', async () => {
    const evaluationSheetText = `PROJECT REVIEW 3 EVALUATION SHEET
Workspace: Finance Analytics
Candidate Team: Synaptix Core
Project Title: Real-Time Vector Document Ingestion & EMLM Knowledge Store
Criteria 1 - System Architecture: 25 / 25
Criteria 2 - Real-Time Ingestion & Extraction: 35 / 35
Criteria 3 - Workspace Isolation: 20 / 20
Criteria 4 - Citation Verification: 20 / 20
Final Aggregate Score: 100 / 100
Reviewer: Chief Technology Evaluator
Recommendation: Unanimous Production Approval.`;

    const file = new File([evaluationSheetText], 'Project_Review-3 Evaluation Sheet.txt', {
      type: 'text/plain',
    });

    const docId = await ingestDocument(file, 'finance', orgId);
    expect(docId).toBeDefined();

    const doc = await ragStore.getDocument(docId, 'finance');
    expect(doc?.status).toBe('READY');
    expect(doc?.chunkCount).toBeGreaterThan(0);

    // Query the evaluation score
    const ragResult = await ragQuery({
      query: 'What is the Final Aggregate Score and Recommendation on the Project Review 3 Evaluation Sheet?',
      workspaceId: 'finance',
      organizationId: orgId,
    });

    expect(ragResult.hasSufficientEvidence).toBe(true);
    expect(ragResult.citations.length).toBeGreaterThan(0);
    expect(ragResult.citations[0].filename).toBe('Project_Review-3 Evaluation Sheet.txt');
    expect(ragResult.citations[0].excerpt).toContain('PROJECT REVIEW 3 EVALUATION SHEET');
    expect(ragResult.answer).toBeTruthy();
  }, 15000);
});
