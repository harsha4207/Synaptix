/**
 * SYNAPTIX COMMAND — Backend RAG API Router Integration Tests
 *
 * Validates HTTP REST API endpoints:
 * - Configuration retrieval & updating (with RBAC enforcement)
 * - Knowledge base status & diagnostics
 * - Document upload, listing, details & deletion
 * - Scoped multi-domain RAG queries and hybrid vector search
 * - Isolation validation and index rebuild triggers
 * - Zero-trust header validation (X-Workspace-Id mismatch rejection)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleRagApiRoute } from '../src/server/ragApiRouter';
import { ragStore } from '../src/lib/rag/store';
import { workspaceRagConfigService } from '../src/lib/rag/workspaceRagConfig';
import type { IncomingMessage, ServerResponse } from 'http';

function createMockHttp(
  method: string,
  url: string,
  headers: Record<string, string> = {}
) {
  const req = {
    method,
    url,
    headers: { ...headers },
  } as unknown as IncomingMessage;

  let statusCode = 200;
  let responseData = '';
  const responseHeaders: Record<string, string> = {};

  const res = {
    writeHead(code: number, headers?: Record<string, string>) {
      statusCode = code;
      if (headers) {
        Object.assign(responseHeaders, headers);
      }
      return this;
    },
    end(data?: string) {
      if (data) responseData = data;
    },
  } as unknown as ServerResponse;

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getBody: () => {
      try {
        return JSON.parse(responseData);
      } catch {
        return responseData;
      }
    },
  };
}

describe('RAG HTTP REST API Endpoints', () => {
  const WS_ID = 'workspace-healthcare';

  beforeEach(() => {
    ragStore.clearMemory();
    workspaceRagConfigService.clear();
  });

  it('GET /api/domains returns all registered domain configurations', async () => {
    const { req, res, getStatusCode, getBody } = createMockHttp('GET', '/api/domains');
    const handled = await handleRagApiRoute(req, res, {});

    expect(handled).toBe(true);
    expect(getStatusCode()).toBe(200);
    const body = getBody();
    expect(body.domains).toBeDefined();
    expect(body.domains.length).toBeGreaterThanOrEqual(6);
  });

  it('GET /api/workspaces/:workspaceId/rag/config retrieves workspace config', async () => {
    const { req, res, getStatusCode, getBody } = createMockHttp('GET', `/api/workspaces/${WS_ID}/rag/config`);
    const handled = await handleRagApiRoute(req, res, {});

    expect(handled).toBe(true);
    expect(getStatusCode()).toBe(200);
    const body = getBody();
    expect(body.config.workspace_id).toBe(WS_ID);
    expect(body.config.domain_name).toBe('Healthcare');
    expect(body.config.retrieval_strategy).toBe('hybrid');
  });

  it('PUT /api/workspaces/:workspaceId/rag/config enforces Admin RBAC', async () => {
    // Non-admin viewer attempt -> 403 Forbidden
    const viewerMock = createMockHttp('PUT', `/api/workspaces/${WS_ID}/rag/config`, {
      'x-user-role': 'viewer',
    });
    const handledViewer = await handleRagApiRoute(viewerMock.req, viewerMock.res, { top_k: 10 });
    expect(handledViewer).toBe(true);
    expect(viewerMock.getStatusCode()).toBe(403);

    // Admin attempt -> 200 OK
    const adminMock = createMockHttp('PUT', `/api/workspaces/${WS_ID}/rag/config`, {
      'x-user-role': 'admin',
    });
    const handledAdmin = await handleRagApiRoute(adminMock.req, adminMock.res, { top_k: 12, chunk_size: 700 });
    expect(handledAdmin).toBe(true);
    expect(adminMock.getStatusCode()).toBe(200);
    expect(adminMock.getBody().config.top_k).toBe(12);
    expect(adminMock.getBody().config.chunk_size).toBe(700);
  });

  it('POST /api/workspaces/:workspaceId/documents/upload and GET documents', async () => {
    const uploadMock = createMockHttp('POST', `/api/workspaces/${WS_ID}/documents/upload`, {
      'x-user-role': 'member',
    });
    const uploadPayload = {
      filename: 'pediatric_icu_clinical_guidelines.txt',
      content: 'Pediatric intensive care resuscitation guidelines require weight-based epinephrine dosage.',
      fileType: 'TXT',
      evidenceGrade: 'G2',
    };

    const handledUpload = await handleRagApiRoute(uploadMock.req, uploadMock.res, uploadPayload);
    expect(handledUpload).toBe(true);
    expect(uploadMock.getStatusCode()).toBe(201);
    const uploadBody = uploadMock.getBody();
    expect(uploadBody.documentId).toBeDefined();

    // Verify document listing
    const listMock = createMockHttp('GET', `/api/workspaces/${WS_ID}/documents`);
    await handleRagApiRoute(listMock.req, listMock.res, {});
    expect(listMock.getStatusCode()).toBe(200);
    const listBody = listMock.getBody();
    expect(listBody.count).toBe(1);
    expect(listBody.documents[0].filename).toBe('pediatric_icu_clinical_guidelines.txt');

    // Verify single document details
    const detailMock = createMockHttp('GET', `/api/workspaces/${WS_ID}/documents/${uploadBody.documentId}`);
    await handleRagApiRoute(detailMock.req, detailMock.res, {});
    expect(detailMock.getStatusCode()).toBe(200);
    expect(detailMock.getBody().document.id).toBe(uploadBody.documentId);
    expect(detailMock.getBody().chunksCount).toBeGreaterThan(0);
  });

  it('POST /api/workspaces/:workspaceId/rag/query executes scoped retrieval', async () => {
    // Ingest test document first
    const uploadMock = createMockHttp('POST', `/api/workspaces/${WS_ID}/documents/upload`, {
      'x-user-role': 'admin',
    });
    await handleRagApiRoute(uploadMock.req, uploadMock.res, {
      filename: 'cardiology_telemetry_sop.txt',
      content: 'Cardiology telemetry alarm thresholds set at HR > 120 bpm and ST segment elevation > 2mm.',
      fileType: 'TXT',
    });

    // Query endpoint
    const queryMock = createMockHttp('POST', `/api/workspaces/${WS_ID}/rag/query`);
    await handleRagApiRoute(queryMock.req, queryMock.res, {
      query: 'What are the telemetry alarm thresholds for HR and ST segment?',
    });

    expect(queryMock.getStatusCode()).toBe(200);
    const queryBody = queryMock.getBody();
    expect(queryBody.hasSufficientEvidence).toBe(true);
    expect(queryBody.citations.length).toBeGreaterThanOrEqual(1);
    expect(queryBody.answer).toContain('ST segment');
  });

  it('POST /api/workspaces/:workspaceId/rag/validate-isolation confirms zero leakage', async () => {
    const valMock = createMockHttp('POST', `/api/workspaces/${WS_ID}/rag/validate-isolation`);
    await handleRagApiRoute(valMock.req, valMock.res, {});

    expect(valMock.getStatusCode()).toBe(200);
    const body = valMock.getBody();
    expect(body.isIsolated).toBe(true);
    expect(body.violations).toHaveLength(0);
  });

  it('rejects cross-workspace requests when X-Workspace-Id header mismatches route', async () => {
    const mismatchMock = createMockHttp('GET', `/api/workspaces/workspace-finance/rag/config`, {
      'x-workspace-id': 'workspace-healthcare', // Spoofed / mismatched header
    });

    const handled = await handleRagApiRoute(mismatchMock.req, mismatchMock.res, {});
    expect(handled).toBe(true);
    expect(mismatchMock.getStatusCode()).toBe(403);
    expect(mismatchMock.getBody().error).toContain('Security boundary violation');
  });
});

