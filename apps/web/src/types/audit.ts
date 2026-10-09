export type AuditEventType =
  | 'USER_REQUEST'
  | 'INTENT_CLASSIFICATION'
  | 'CONTEXT_LOAD'
  | 'KNOWLEDGE_RETRIEVAL'
  | 'PLAN_GENERATION'
  | 'EVIDENCE_EVALUATION'
  | 'APPROVAL_REQUEST'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'EXECUTION'
  | 'VERIFICATION'
  | 'OUTCOME'
  | 'EVIDENCE_UPDATE'
  | 'AUTHENTICATION'
  | 'WORKSPACE_ACCESS'
  | 'DOCUMENT_UPLOAD'
  | 'DATA_EXPORT'
  | 'SETTINGS_CHANGE'
  | 'WORKFLOW_TRIGGER'
  | 'ANOMALY_DETECTED'
  | 'DASHBOARD_PUBLISH';

export type AuditStatus =
  | 'completed'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'running'
  | 'failed'
  | 'warning'
  | 'skipped';

export type AuditRiskTier = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AuditStage =
  | 'USER_REQUEST'
  | 'UNDERSTAND'
  | 'RETRIEVE'
  | 'REASON'
  | 'PLAN'
  | 'GOVERN'
  | 'ACT'
  | 'VERIFY'
  | 'RESULT'
  | 'EVOLVE';

export interface AuditEventDetail {
  key: string;
  value: string;
  isCode?: boolean;
  isHighlight?: boolean;
}

export interface AuditEvent {
  id: string;
  planId: string;          // Groups related events into a single plan/request chain
  sequenceNumber: number;  // Position in the plan execution chain
  stage: AuditStage;
  eventType: AuditEventType;
  timestamp: string;       // ISO-8601 full timestamp
  timestampRelative: string; // Human-readable relative timestamp
  actor: string;
  actorType: 'user' | 'system' | 'engine' | 'external';
  title: string;
  summary: string;
  workspaceId: string;
  workspaceName: string;
  actionId?: string;
  actionName?: string;
  status: AuditStatus;
  riskTier: AuditRiskTier;
  evidenceGrade?: 'G0' | 'G1' | 'G2' | 'Contradicted';
  evidenceHash?: string;
  details: AuditEventDetail[];
  ipAddress?: string;
  sessionId?: string;
  durationMs?: number;
  affectedResources?: string[];
  relatedEventIds?: string[];
}
