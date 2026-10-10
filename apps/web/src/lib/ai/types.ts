/**
 * SYNAPTIX COMMAND — AI Intelligence Layer Types
 * Definitions for Adaptive AI Router, EMLM Orchestrator, and Persistent Conversation Memory.
 */

export type RoutingTier =
  | 'TIER_1_SIMPLE'
  | 'TIER_2_MODERATE'
  | 'TIER_3_COMPLEX'
  | 'TIER_4_CONSEQUENTIAL';

export type EmlmStageId =
  | 'UNDERSTAND_REQUEST'
  | 'RESOLVE_WORKSPACE_BOUNDARY'
  | 'RETRIEVE_EVIDENCE_AND_METRICS'
  | 'GENERATE_STRUCTURED_PLAN'
  | 'EXECUTE_APPROVED_TOOLS'
  | 'VALIDATE_CITATIONS_AND_EVIDENCE'
  | 'PRODUCE_FINAL_ANSWER'
  | 'PERSIST_AND_AUDIT_EXECUTION';

export interface EmlmStageStatus {
  id: EmlmStageId;
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface RoutingDecision {
  tier: RoutingTier;
  reason: string;
  confidence: number;
  selectedModel: string;
  requiresRag: boolean;
  requiresComputation: boolean;
  requiresGovernanceApproval: boolean;
  estimatedLatencyMs: number;
}

export interface AiCitation {
  documentId: string;
  filename: string;
  excerpt: string;
  locationStr: string;
  relevanceScore: number;
  workspaceId: string;
}

export interface ConversationRecord {
  id: string;
  userId: string;
  organizationId: string;
  workspaceId?: string | null;
  title: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  status: 'pending' | 'streaming' | 'completed' | 'failed' | 'cancelled';
  provider: string;
  model: string;
  routingTier: RoutingTier;
  intent?: string;
  requestId: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  citations: AiCitation[];
  metadata: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface StreamChunkEvent {
  type: 'token' | 'stage_update' | 'citations' | 'metadata' | 'done' | 'error';
  requestId: string;
  conversationId: string;
  token?: string;
  accumulatedText?: string;
  stage?: EmlmStageStatus;
  citations?: AiCitation[];
  routingDecision?: RoutingDecision;
  error?: string;
  isComplete?: boolean;
}

export interface ExecuteAiRequestOptions {
  query: string;
  workspaceId: string;
  userId?: string;
  conversationId?: string;
  requestId?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  onStreamChunk?: (event: StreamChunkEvent) => void;
}
