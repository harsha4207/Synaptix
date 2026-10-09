export type EvidenceGrade = 'G0' | 'G1' | 'G2' | 'Contradicted';

export interface EvidenceSource {
  id: string;
  name: string;
  type: 'PDF Document' | 'Financial Ledger' | 'API Stream' | 'SQL Dataset' | 'ERP Connector' | 'Audit Log';
  uri: string;
  checksum: string;
  pageNumber?: number;
  rowNumber?: number;
  sectionTitle?: string;
  snippet: string;
  fullContent?: string;
  timestamp: string;
  authoritativeRating: 'High' | 'Direct Ledger' | 'Secondary' | 'Self-Reported';
}

export interface VerificationRecord {
  verifiedAt: string;
  verifiedBy: string; // e.g., "Automated Ledger Reconciliation Worker", "CPA Compliance Engine", "Human Auditor: A. Vance"
  method: 'Cryptographic Hash Match' | 'Multi-Source Cross-Check' | 'Execution Proof Log' | 'Anomaly Detection Inconsistency';
  status: 'passed' | 'failed' | 'inconclusive';
  proofDetails: string;
  auditSignature: string;
}

export interface RelatedActionRecord {
  id: string;
  name: string;
  type: string;
  status: 'Completed' | 'Pending Approval' | 'Rolled Back' | 'Running';
  executedAt: string;
  impactSummary: string;
}

export interface CorrectionHistoryItem {
  id: string;
  timestamp: string;
  changedBy: string;
  previousGrade: EvidenceGrade;
  newGrade: EvidenceGrade;
  reason: string;
  discrepancyNote?: string;
}

export interface ClaimItem {
  id: string;
  claimId: string; // e.g. "CLM-2026-8841"
  title: string;
  claimText: string;
  workspaceId: string;
  category: 'Financial Performance' | 'Operational Compliance' | 'Revenue Metric' | 'Contractual Obligation' | 'System Anomaly';
  grade: EvidenceGrade;
  confidence: number; // e.g. 0.98 -> 98%
  lastVerification: string;
  verifier: string;
  sources: EvidenceSource[];
  supportingPassages: {
    id: string;
    sourceId: string;
    sourceName: string;
    text: string;
    location: string;
    relevanceScore: number;
    highlightedTokens?: string[];
  }[];
  verification: VerificationRecord;
  relatedActions: RelatedActionRecord[];
  correctionHistory: CorrectionHistoryItem[];
  contradictionReason?: string;
}
