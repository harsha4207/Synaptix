import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { ingestDocument, deleteDocument, listWorkspaceDocuments, getDocumentStatus } from '../src/lib/rag/ingestion';
import { ragStore } from '../src/lib/rag/store';
import { ragQuery, searchWorkspace } from '../src/lib/rag/retrieval';
import type { ProcessingStatusEvent } from '../src/lib/rag/types';

describe('Real-Time Document Ingestion & RAG Knowledge Pipeline', () => {
  const orgId = 'synaptix-enterprise';

  beforeEach(() => {
    ragStore.clearMemory();
  });

  it('ingests a real financial text document through all pipeline stages to READY', async () => {
    const fileContent = `SYNAPTIX FINANCIAL AUDIT FY2026
Gross revenue accelerated by 18.4% reaching $142.8M in Q3 2026.
Net operating income was recorded at $38.4M with EBITDA margin of 26.9%.
The executive committee confirmed $12.5M allocated for AI infrastructure R&D.`;

    const file = new File([fileContent], 'finance_q3_audit_report.txt', { type: 'text/plain' });
    const stagesSeen: string[] = [];

    const onStatus = (evt: ProcessingStatusEvent) => {
      stagesSeen.push(evt.status);
    };

    const docId = await ingestDocument(file, 'finance', orgId, onStatus);

    expect(docId).toBeDefined();
    expect(stagesSeen).toContain('VALIDATING');
    expect(stagesSeen).toContain('UPLOADED');
    expect(stagesSeen).toContain('EXTRACTING');
    expect(stagesSeen).toContain('CHUNKING');
    expect(stagesSeen).toContain('EMBEDDING');
    expect(stagesSeen).toContain('INDEXING');
    expect(stagesSeen).toContain('READY');

    // Verify document record
    const doc = await ragStore.getDocument(docId, 'finance');
    expect(doc).not.toBeNull();
    expect(doc?.status).toBe('READY');
    expect(doc?.filename).toBe('finance_q3_audit_report.txt');
    expect(doc?.chunkCount).toBeGreaterThan(0);
    expect(doc?.contentHash).toBeTruthy();

    // Verify chunks and embeddings
    const chunks = await ragStore.getChunksByDocument(docId, 'finance');
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      expect(chunk.embedding).toBeDefined();
      expect(typeof chunk.embedding).toBe('object');
      expect(Object.keys(chunk.embedding).length).toBeGreaterThan(0);
      expect(chunk.workspaceId).toBe('finance');
    }
  });

  it('makes newly ingested knowledge retrievable immediately with grounded citations', async () => {
    const fileContent = `RESEARCH LAB REPORT: NEURAL ROUTING
Project Synapse achieved a latency reduction of 42ms across 100k queries.
The adaptive router dynamic tiering reduced token consumption by 31.5%.
Validated by Chief Research Officer Dr. Elena Vance.`;

    const file = new File([fileContent], 'neural_routing_research.txt', { type: 'text/plain' });
    const docId = await ingestDocument(file, 'research', orgId);

    expect(docId).toBeDefined();

    // Query immediately without delay or restart
    const answer = await ragQuery({
      query: 'What latency reduction did Project Synapse achieve?',
      workspaceId: 'research',
      organizationId: orgId,
      topK: 5,
    });

    expect(answer).toBeDefined();
    expect(answer.answer).toBeTruthy();
    expect(answer.hasSufficientEvidence).toBe(true);
    expect(answer.citations.length).toBeGreaterThan(0);
    expect(answer.citations[0].documentId).toBe(docId);
    expect(answer.citations[0].filename).toBe('neural_routing_research.txt');
    expect(answer.citations[0].excerpt).toContain('latency reduction of 42ms');
  }, 15000);

  it('enforces strict workspace isolation during vector search and retrieval', async () => {
    // Ingest sensitive patient data in healthcare workspace
    const healthcareContent = `PATIENT PROTOCOL 2026
Protocol HC-992 requires automated vital tracking every 15 minutes for post-op patients.`;
    const hcFile = new File([healthcareContent], 'patient_protocol_hc992.txt', { type: 'text/plain' });
    await ingestDocument(hcFile, 'healthcare', orgId);

    // Finance workspace search MUST return 0 results
    const financeSearchResults = await searchWorkspace({
      query: 'vital tracking post-op protocol',
      workspaceId: 'finance',
      organizationId: orgId,
    });

    expect(financeSearchResults.length).toBe(0);

    // Finance RAG query MUST NOT retrieve healthcare document
    const financeAnswer = await ragQuery({
      query: 'What does protocol HC-992 require?',
      workspaceId: 'finance',
      organizationId: orgId,
    });

    expect(financeAnswer.citations.length).toBe(0);
    expect(financeAnswer.hasSufficientEvidence).toBe(false);
    expect(financeAnswer.answer.toLowerCase()).toContain('no relevant evidence was found');

    // Healthcare workspace search MUST retrieve it
    const hcSearchResults = await searchWorkspace({
      query: 'vital tracking post-op protocol',
      workspaceId: 'healthcare',
      organizationId: orgId,
    });

    expect(hcSearchResults.length).toBeGreaterThan(0);
    expect(hcSearchResults[0].chunk.workspaceId).toBe('healthcare');
  }, 15000);

  it('handles CSV tabular ingestion and preserves row structured context', async () => {
    const csvContent = `department,budget,headcount,lead
AI Infrastructure,4500000,14,Sarah Chen
Quantum Computing,6200000,9,Marcus Brody
Security & Governance,2800000,8,Rachel Torres`;

    const file = new File([csvContent], 'department_budgets_2026.csv', { type: 'text/csv' });
    const docId = await ingestDocument(file, 'business', orgId);

    const doc = await ragStore.getDocument(docId, 'business');
    expect(doc?.status).toBe('READY');

    const chunks = await ragStore.getChunksByDocument(docId, 'business');
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].content).toContain('department');
    expect(chunks[0].content).toContain('AI Infrastructure');

    // Query tabular knowledge
    const answer = await ragQuery({
      query: 'Who is the lead for AI Infrastructure and what is the budget?',
      workspaceId: 'business',
      organizationId: orgId,
    });

    expect(answer.citations.length).toBeGreaterThan(0);
    expect(answer.citations[0].filename).toBe('department_budgets_2026.csv');
  }, 15000);

  it('detects identical document content and ensures idempotency', async () => {
    const fileContent = `STANDARD OPERATING PROCEDURE
SOP-101: All deployment pipelines must pass security scanning before production release.`;

    const file1 = new File([fileContent], 'sop_security.txt', { type: 'text/plain' });
    const docId1 = await ingestDocument(file1, 'custom_ops', orgId);

    const file2 = new File([fileContent], 'sop_security_duplicate.txt', { type: 'text/plain' });
    const docId2 = await ingestDocument(file2, 'custom_ops', orgId);

    // Returns same document ID due to content hash idempotency
    expect(docId2).toBe(docId1);

    const allDocs = await listWorkspaceDocuments('custom_ops', orgId);
    expect(allDocs.length).toBe(1);
  });

  it('supports document deletion and cascades chunk cleanup', async () => {
    const fileContent = `TEMPORARY KNOWLEDGE SPECIFICATION
This document will be deleted.`;
    const file = new File([fileContent], 'temporary_spec.txt', { type: 'text/plain' });
    const docId = await ingestDocument(file, 'education', orgId);

    let doc = await ragStore.getDocument(docId, 'education');
    expect(doc).not.toBeNull();

    let chunks = await ragStore.getChunksByDocument(docId, 'education');
    expect(chunks.length).toBeGreaterThan(0);

    // Delete
    await deleteDocument(docId, 'education', orgId);

    doc = await ragStore.getDocument(docId, 'education');
    expect(doc).toBeNull();

    chunks = await ragStore.getChunksByDocument(docId, 'education');
    expect(chunks.length).toBe(0);
  });

  it('fails truthfully when an invalid/empty file is supplied', async () => {
    const emptyFile = new File([''], 'empty_file.txt', { type: 'text/plain' });
    let failed = false;

    try {
      await ingestDocument(emptyFile, 'finance', orgId);
    } catch {
      failed = true;
    }

    expect(failed).toBe(true);
  });

  it('prevents duplicate records when retrying or re-uploading a failed document', async () => {
    const filename = 'Project_Review-3_Evaluation_Sheet.txt';
    
    // Simulate initial failed upload (e.g. invalid content or temporary failure)
    const initialDoc = {
      id: 'doc-failed-1',
      workspaceId: 'finance' as const,
      organizationId: orgId,
      filename,
      fileType: 'TXT' as const,
      sizeBytes: 1024,
      contentHash: 'hash-1',
      status: 'FAILED' as const,
      source: 'Direct Upload' as const,
      chunkCount: 0,
      ocrApplied: false,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      errorMessage: 'Temporary processing failure',
      metadata: {},
    };
    await ragStore.saveDocument(initialDoc);

    const docsBefore = await listWorkspaceDocuments('finance', orgId);
    expect(docsBefore.length).toBe(1);
    expect(docsBefore[0].status).toBe('FAILED');

    // Re-upload/retry with valid text content
    const validContent = `Project Review 3 Evaluation Sheet
Criteria 1: Architecture - 95/100
Criteria 2: Implementation - 92/100
Total Score: 93.5/100`;
    const retryFile = new File([validContent], filename, { type: 'text/plain' });

    const docId = await ingestDocument(retryFile, 'finance', orgId);

    // Verify only ONE document record exists in finance workspace with READY status
    const docsAfter = await listWorkspaceDocuments('finance', orgId);
    expect(docsAfter.length).toBe(1);
    expect(docsAfter[0].id).toBe(docId);
    expect(docsAfter[0].status).toBe('READY');
    expect(docsAfter[0].filename).toBe(filename);
    expect(docsAfter[0].chunkCount).toBeGreaterThan(0);
  });
});
