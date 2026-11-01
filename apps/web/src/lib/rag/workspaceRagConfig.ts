/**
 * SYNAPTIX COMMAND — Workspace RAG Configuration Service
 *
 * Implements persistent, workspace-isolated RAG configuration management.
 * Enforces domain assignment, chunking/retrieval parameters, versioning,
 * and status tracking per tenant workspace.
 */

import { domainRegistry, WorkspaceDomain } from './domainRegistry';
import type { SupportedFileType } from './types';

export interface RerankingConfig {
  enabled: boolean;
  method: 'reciprocal_rank_fusion' | 'cross_encoder' | 'weighted_score';
  minScore: number;
}

export type ChunkingStrategy = 'semantic' | 'fixed' | 'hierarchical';
export type RetrievalStrategy = 'hybrid' | 'semantic_only' | 'keyword_only';
export type IndexingStatus = 'IDLE' | 'INDEXING' | 'READY' | 'FAILED' | 'OUTDATED';

export interface WorkspaceRagConfig {
  workspace_id: string;
  domain_id: string;
  domain_name: string;
  domain_description: string;
  knowledge_base_id: string;
  embedding_model: string;
  embedding_dimension: number;
  chunking_strategy: ChunkingStrategy;
  chunk_size: number;
  chunk_overlap: number;
  retrieval_strategy: RetrievalStrategy;
  top_k: number;
  similarity_threshold: number;
  reranking_configuration: RerankingConfig;
  supported_file_types: SupportedFileType[];
  indexing_status: IndexingStatus;
  knowledge_version: number;
  configuration_version: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceKnowledgeBaseStatus {
  workspace_id: string;
  domain_name: string;
  indexing_status: IndexingStatus;
  knowledge_version: number;
  document_count: number;
  chunk_count: number;
  total_bytes: number;
  last_indexed_at: string | null;
  embedding_model: string;
  retrieval_strategy: RetrievalStrategy;
}

export class WorkspaceRagConfigService {
  private configs: Map<string, WorkspaceRagConfig> = new Map();

  /**
   * Retrieves the workspace RAG configuration if already registered.
   */
  public getConfig(workspaceId: string): WorkspaceRagConfig | null {
    const wsId = workspaceId.toLowerCase().trim();
    const existing = this.configs.get(wsId);
    return existing ? { ...existing } : null;
  }

  /**
   * Initializes or retrieves the workspace RAG configuration.
   * If not already configured, generates a domain-tailored default configuration.
   */
  public getOrCreateConfig(workspaceId: string, domainIdentifier?: string): WorkspaceRagConfig {
    const wsId = workspaceId.toLowerCase().trim();
    const existing = this.configs.get(wsId);
    if (existing) {
      return { ...existing };
    }

    // Determine domain (from argument, or inferred from workspaceId)
    const domainKey = domainIdentifier || wsId.replace(/^workspace-/, '');
    const domain = domainRegistry.getDomain(domainKey);

    const now = new Date().toISOString();
    const defaultConfig: WorkspaceRagConfig = {
      workspace_id: wsId,
      domain_id: domain.id,
      domain_name: domain.name,
      domain_description: domain.description,
      knowledge_base_id: `kb-${wsId}-${Date.now().toString(36)}`,
      embedding_model: 'synaptix-tf-idf-vector-v2',
      embedding_dimension: 512,
      chunking_strategy: 'semantic',
      chunk_size: 600,
      chunk_overlap: 100,
      retrieval_strategy: 'hybrid',
      top_k: 5,
      similarity_threshold: 0.05,
      reranking_configuration: {
        enabled: true,
        method: 'reciprocal_rank_fusion',
        minScore: 0.05,
      },
      supported_file_types: ['PDF', 'DOCX', 'XLSX', 'CSV', 'TXT', 'MD', 'JSON', 'JPG', 'JPEG', 'PNG'],
      indexing_status: 'READY',
      knowledge_version: 1,
      configuration_version: 1,
      created_at: now,
      updated_at: now,
    };

    this.configs.set(wsId, defaultConfig);
    return { ...defaultConfig };
  }

  /**
   * Updates an existing workspace RAG configuration (Admin operation).
   * Validates parameters and bumps configuration_version.
   */
  public updateConfig(
    workspaceId: string,
    updates: Partial<Omit<WorkspaceRagConfig, 'workspace_id' | 'created_at' | 'configuration_version'>>
  ): WorkspaceRagConfig {
    const current = this.getOrCreateConfig(workspaceId);

    // If domain changed, update domain fields
    let domainName = current.domain_name;
    let domainDescription = current.domain_description;
    let domainId = current.domain_id;

    if (updates.domain_id && updates.domain_id !== current.domain_id) {
      const newDomain = domainRegistry.getDomain(updates.domain_id);
      domainId = newDomain.id;
      domainName = newDomain.name;
      domainDescription = newDomain.description;
    }

    // Validate boundaries
    const top_k = updates.top_k !== undefined ? Math.max(1, Math.min(updates.top_k, 50)) : current.top_k;
    const similarity_threshold = updates.similarity_threshold !== undefined
      ? Math.max(0.01, Math.min(updates.similarity_threshold, 1.0))
      : current.similarity_threshold;
    const chunk_size = updates.chunk_size !== undefined
      ? Math.max(100, Math.min(updates.chunk_size, 4000))
      : current.chunk_size;
    const chunk_overlap = updates.chunk_overlap !== undefined
      ? Math.max(0, Math.min(updates.chunk_overlap, Math.floor(chunk_size / 2)))
      : current.chunk_overlap;

    const updated: WorkspaceRagConfig = {
      ...current,
      ...updates,
      workspace_id: current.workspace_id,
      domain_id: domainId,
      domain_name: domainName,
      domain_description: domainDescription,
      top_k,
      similarity_threshold,
      chunk_size,
      chunk_overlap,
      configuration_version: current.configuration_version + 1,
      updated_at: new Date().toISOString(),
    };

    this.configs.set(current.workspace_id, updated);
    return { ...updated };
  }

  /**
   * Sets indexing status for a workspace.
   */
  public setIndexingStatus(workspaceId: string, status: IndexingStatus): void {
    const cfg = this.getOrCreateConfig(workspaceId);
    cfg.indexing_status = status;
    cfg.updated_at = new Date().toISOString();
    this.configs.set(cfg.workspace_id, cfg);
  }

  /**
   * Bumps knowledge version when significant document modifications occur.
   */
  public incrementKnowledgeVersion(workspaceId: string): number {
    const cfg = this.getOrCreateConfig(workspaceId);
    cfg.knowledge_version += 1;
    cfg.updated_at = new Date().toISOString();
    this.configs.set(cfg.workspace_id, cfg);
    return cfg.knowledge_version;
  }

  /**
   * Retrieves all registered configurations.
   */
  public listConfigs(): WorkspaceRagConfig[] {
    return Array.from(this.configs.values()).map((c) => ({ ...c }));
  }

  /**
   * Resets in-memory configurations (for test suites).
   */
  public clear(): void {
    this.configs.clear();
  }
}

export const workspaceRagConfigService = new WorkspaceRagConfigService();
