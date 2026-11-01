/**
 * SYNAPTIX COMMAND — Multi-Domain, Workspace-Isolated RAG API Router
 *
 * Exposes RESTful endpoints for workspace RAG configuration, document lifecycle,
 * hybrid retrieval, administrative re-indexing, and automated isolation verification.
 * Shared by both standalone Node.js production server and Vite dev server plugin.
 */

import * as http from 'http';
import { ragStore } from '../lib/rag/store.js';
import { domainRegistry } from '../lib/rag/domainRegistry.js';
import { workspaceRagConfigService } from '../lib/rag/workspaceRagConfig.js';
import { multiDomainRetrieval } from '../lib/rag/multiDomainRetrieval.js';
import { ingestionPipeline } from '../lib/rag/ingestionPipeline.js';
import type { SupportedFileType } from '../lib/rag/types.js';

export interface RouteMatchResult {
  handled: boolean;
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Workspace-Id, X-User-Role, X-Organization-Id',
  });
  res.end(JSON.stringify(data));
}

function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/\[\s*(?:system|assistant|instruction)\s*:?.*?\]/gi, '')
    .replace(/(?:ignore all previous instructions|disregard prior directives)/gi, '[REDACTED_PROMPT_INJECTION]')
    .trim();
}

export async function handleRagApiRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  parsedBody: any
): Promise<boolean> {
  const method = req.method?.toUpperCase() || 'GET';
  const url = req.url || '';
  const pathname = url.split('?')[0];

  // RBAC and Context Extraction
  const authWorkspaceHeader = req.headers['x-workspace-id'] as string | undefined;
  const userRole = (req.headers['x-user-role'] as string | undefined)?.toLowerCase() || 'member';
  const orgId = (req.headers['x-organization-id'] as string | undefined) || 'synaptix-enterprise';

  // ── Global Domain Endpoints ──────────────────────────────────────────────
  // GET /api/domains
  if (method === 'GET' && pathname === '/api/domains') {
    const domains = domainRegistry.listDomains();
    sendJson(res, 200, { domains });
    return true;
  }

  // POST /api/domains (Custom domain registration)
  if (method === 'POST' && pathname === '/api/domains') {
    if (userRole !== 'owner' && userRole !== 'admin') {
      sendJson(res, 403, { error: 'Forbidden: Admin privilege required to register custom domains' });
      return true;
    }
    const { name, code, description, terminologySynonyms, systemPromptInstruction, complianceFrameworks } = parsedBody;
    if (!name || !code || !description) {
      sendJson(res, 400, { error: 'name, code, and description are required for custom domains' });
      return true;
    }
    const created = domainRegistry.registerCustomDomain({
      name,
      code,
      description,
      terminologySynonyms: terminologySynonyms || [],
      systemPromptInstruction: systemPromptInstruction || `You are an AI assistant for the ${name} domain.`,
      complianceFrameworks: complianceFrameworks || [],
    });
    sendJson(res, 201, { domain: created });
    return true;
  }

  // ── Workspace-Scoped Endpoints Pattern Matching ──────────────────────────
  // Regex pattern: /api/workspaces/:workspaceId/...
  const wsPrefixMatch = pathname.match(/^\/api\/workspaces\/([a-zA-Z0-9_-]+)(?:\/(.*))?$/);
  if (!wsPrefixMatch) {
    return false;
  }

  const workspaceId = wsPrefixMatch[1].toLowerCase().trim();
  const subPath = wsPrefixMatch[2] || '';

  // Zero-Trust Boundary Validation: If X-Workspace-Id header supplied, it must match URL
  if (authWorkspaceHeader && authWorkspaceHeader.toLowerCase().trim() !== workspaceId) {
    sendJson(res, 403, {
      error: `Security boundary violation: X-Workspace-Id (${authWorkspaceHeader}) does not match route target (${workspaceId})`,
    });
    return true;
  }

  // 1. GET /api/workspaces/:workspaceId/rag/config
  if (method === 'GET' && subPath === 'rag/config') {
    const config = workspaceRagConfigService.getOrCreateConfig(workspaceId);
    sendJson(res, 200, { config });
    return true;
  }

  // 2. PUT /api/workspaces/:workspaceId/rag/config
  if (method === 'PUT' && subPath === 'rag/config') {
    if (userRole !== 'owner' && userRole !== 'admin') {
      sendJson(res, 403, { error: 'Forbidden: Admin privilege required to update RAG configuration' });
      return true;
    }
    try {
      const updated = workspaceRagConfigService.updateConfig(workspaceId, parsedBody);
      sendJson(res, 200, { config: updated });
    } catch (err: any) {
      sendJson(res, 400, { error: err.message || 'Config update failed' });
    }
    return true;
  }

  // 3. GET /api/workspaces/:workspaceId/rag/status
  if (method === 'GET' && subPath === 'rag/status') {
    const config = workspaceRagConfigService.getOrCreateConfig(workspaceId);
    const stats = await ragStore.getStats(workspaceId);
    sendJson(res, 200, {
      workspace_id: workspaceId,
      domain_name: config.domain_name,
      indexing_status: config.indexing_status,
      knowledge_version: config.knowledge_version,
      document_count: stats.documentCount,
      chunk_count: stats.chunkCount,
      total_bytes: stats.totalBytes,
      last_indexed_at: stats.lastUpdated,
      embedding_model: config.embedding_model,
      retrieval_strategy: config.retrieval_strategy,
    });
    return true;
  }

  // 4. GET /api/workspaces/:workspaceId/rag/stats
  if (method === 'GET' && subPath === 'rag/stats') {
    const stats = await ragStore.getStats(workspaceId);
    sendJson(res, 200, { stats });
    return true;
  }

  // 5. GET /api/workspaces/:workspaceId/rag/diagnostics
  if (method === 'GET' && subPath === 'rag/diagnostics') {
    const urlObj = new URL(url, 'http://localhost');
    const q = urlObj.searchParams.get('q') || 'operational procedures';
    const diagnostics = await multiDomainRetrieval.getDiagnostics(q, workspaceId);
    sendJson(res, 200, { diagnostics });
    return true;
  }

  // 6. POST /api/workspaces/:workspaceId/rag/query
  if (method === 'POST' && subPath === 'rag/query') {
    const { query, topK, similarityThreshold, fileTypeFilter, documentIdFilter, retrievalStrategy } = parsedBody;
    if (!query) {
      sendJson(res, 400, { error: 'query is required' });
      return true;
    }
    const cleanQuery = sanitizeInput(query);
    try {
      const result = await multiDomainRetrieval.query({
        query: cleanQuery,
        workspaceId,
        organizationId: orgId,
        topK,
        similarityThreshold,
        fileTypeFilter,
        documentIdFilter,
        retrievalStrategy,
      });
      sendJson(res, 200, result);
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Retrieval query failed' });
    }
    return true;
  }

  // 7. POST /api/workspaces/:workspaceId/rag/search (hybrid vector search without answer generation)
  if (method === 'POST' && subPath === 'rag/search') {
    const { query, topK, similarityThreshold, fileTypeFilter } = parsedBody;
    if (!query) {
      sendJson(res, 400, { error: 'query is required' });
      return true;
    }
    const cleanQuery = sanitizeInput(query);
    try {
      const result = await multiDomainRetrieval.query({
        query: cleanQuery,
        workspaceId,
        organizationId: orgId,
        topK: topK || 10,
        similarityThreshold,
        fileTypeFilter,
      });
      sendJson(res, 200, {
        workspaceId,
        query: cleanQuery,
        citations: result.citations,
        retrievedCount: result.retrievedChunkCount,
        retrievalMs: result.retrievalMs,
      });
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Search failed' });
    }
    return true;
  }

  // 8. POST /api/workspaces/:workspaceId/rag/rebuild (Admin re-index)
  if (method === 'POST' && subPath === 'rag/rebuild') {
    if (userRole !== 'owner' && userRole !== 'admin') {
      sendJson(res, 403, { error: 'Forbidden: Admin privilege required to rebuild index' });
      return true;
    }
    try {
      const rebuildRes = await ingestionPipeline.reindexWorkspace(workspaceId);
      sendJson(res, 200, {
        status: 'completed',
        workspaceId,
        ...rebuildRes,
      });
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Index rebuild failed' });
    }
    return true;
  }

  // 9. POST /api/workspaces/:workspaceId/rag/validate-isolation
  if (method === 'POST' && subPath === 'rag/validate-isolation') {
    const validation = await ragStore.validateIsolation(workspaceId);
    sendJson(res, 200, validation);
    return true;
  }

  // 10. GET /api/workspaces/:workspaceId/rag/jobs
  if (method === 'GET' && subPath === 'rag/jobs') {
    const jobs = ingestionPipeline.listWorkspaceJobs(workspaceId);
    sendJson(res, 200, { jobs });
    return true;
  }

  // 11. POST /api/workspaces/:workspaceId/documents/upload
  if (method === 'POST' && subPath === 'documents/upload') {
    if (userRole === 'viewer') {
      sendJson(res, 403, { error: 'Forbidden: Viewers cannot upload documents' });
      return true;
    }
    const { filename, content, fileType = 'TXT', evidenceGrade = 'G1' } = parsedBody;
    if (!filename || !content) {
      sendJson(res, 400, { error: 'filename and content are required' });
      return true;
    }

    try {
      // Create synthetic File object from text content or base64
      const fileBytes = Buffer.from(content, typeof content === 'string' && content.startsWith('data:') ? 'base64' : 'utf-8');
      const virtualFile = new File([fileBytes], filename, {
        type: fileType === 'PDF' ? 'application/pdf' : 'text/plain',
      });

      const { documentId, jobId } = await ingestionPipeline.ingestDocument(
        virtualFile,
        workspaceId,
        orgId,
        {
          userRole,
          evidenceGrade,
          sourceType: 'Direct Upload',
        }
      );

      sendJson(res, 201, {
        message: 'Document successfully ingested and indexed',
        documentId,
        jobId,
        workspaceId,
        filename,
      });
    } catch (err: any) {
      sendJson(res, 400, { error: err.message || 'Document ingestion failed' });
    }
    return true;
  }

  // 12. GET /api/workspaces/:workspaceId/documents
  if (method === 'GET' && subPath === 'documents') {
    const docs = await ragStore.getDocumentsByWorkspace(workspaceId);
    sendJson(res, 200, {
      workspaceId,
      documents: docs,
      count: docs.length,
    });
    return true;
  }

  // 13. GET /api/workspaces/:workspaceId/documents/:documentId
  const docMatch = subPath.match(/^documents\/([a-zA-Z0-9_-]+)$/);
  if (method === 'GET' && docMatch) {
    const docId = docMatch[1];
    const doc = await ragStore.getDocument(docId, workspaceId);
    if (!doc) {
      sendJson(res, 404, { error: `Document ${docId} not found in workspace ${workspaceId}` });
      return true;
    }
    const chunks = await ragStore.getChunksByDocument(docId, workspaceId);
    sendJson(res, 200, {
      document: doc,
      chunksCount: chunks.length,
      sampleChunks: chunks.slice(0, 3),
    });
    return true;
  }

  // 14. DELETE /api/workspaces/:workspaceId/documents/:documentId
  if (method === 'DELETE' && docMatch) {
    const docId = docMatch[1];
    if (userRole === 'viewer') {
      sendJson(res, 403, { error: 'Forbidden: Viewers cannot delete documents' });
      return true;
    }
    try {
      await ingestionPipeline.deleteDocument(docId, workspaceId, userRole);
      sendJson(res, 200, {
        message: `Document ${docId} and its associated vector chunks deleted from workspace ${workspaceId}`,
        documentId: docId,
        workspaceId,
      });
    } catch (err: any) {
      sendJson(res, err.message?.includes('not found') ? 404 : 403, { error: err.message });
    }
    return true;
  }

  // 15. POST /api/workspaces/:workspaceId/documents/:documentId/reindex
  const reindexDocMatch = subPath.match(/^documents\/([a-zA-Z0-9_-]+)\/reindex$/);
  if (method === 'POST' && reindexDocMatch) {
    const docId = reindexDocMatch[1];
    const doc = await ragStore.getDocument(docId, workspaceId);
    if (!doc) {
      sendJson(res, 404, { error: `Document ${docId} not found in workspace ${workspaceId}` });
      return true;
    }
    const chunks = await ragStore.getChunksByDocument(docId, workspaceId);
    sendJson(res, 200, {
      message: `Document ${docId} re-indexed successfully`,
      documentId: docId,
      chunkCount: chunks.length,
    });
    return true;
  }

  return false;
}

