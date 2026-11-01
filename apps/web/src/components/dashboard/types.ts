import { LucideIcon } from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';

export type DateRangeKey = '7d' | '30d' | 'qtd' | 'ytd' | 'all';

export interface DateRangeOption {
  key: DateRangeKey;
  label: string;
  description: string;
  days: number;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  subtext: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: LucideIcon;
  tooltip: string;
  badge?: string;
  targetModule?: string;
}

export interface AiActivityPoint {
  label: string;
  dateStr: string;
  requests: number;
  groundedPct: number;
  avgLatencyMs: number;
}

export interface WorkflowTrendPoint {
  label: string;
  dateStr: string;
  successful: number;
  gated: number;
  failed: number;
}

export interface IngestionTrendPoint {
  label: string;
  documents: number;
  chunks: number;
}

export interface EvidenceDistribution {
  g2Count: number;
  g2Pct: number;
  g1Count: number;
  g1Pct: number;
  g0Count: number;
  g0Pct: number;
  contradictedCount: number;
}

export interface OperationalWorkflow {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  stepCount: number;
  isEnabled: boolean;
  lastExecuted: string;
  successRate: string;
  executionCount: number;
}

export interface OperationalExecution {
  id: string;
  workflowName: string;
  trigger: string;
  timestamp: string;
  duration: string;
  status: 'success' | 'approval_required' | 'failed' | 'running';
  details: string;
}

export interface KnowledgeSourceSummary {
  format: string;
  count: number;
  storageMb: number;
  percentage: number;
  color: string;
}

export interface ProcessedDocumentSummary {
  id: string;
  filename: string;
  fileType: string;
  sizeFormatted: string;
  status: 'READY' | 'INDEXING' | 'FAILED' | 'CHUNKING';
  chunkCount: number;
  contentHash: string;
  timestamp: string;
}

export interface GovernedApprovalItem {
  id: string;
  name: string;
  requestedBy: string;
  workspace: string;
  riskTier: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  system: string;
  requiresTwoPersonRule: boolean;
  summary: string;
}

export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface DashboardActivityRow {
  id: string;
  description: string;
  module: string;
  moduleTag: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'warning' | 'active';
  actor: string;
  targetModule?: string;
}

