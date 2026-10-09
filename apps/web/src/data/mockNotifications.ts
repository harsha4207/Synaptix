import { NotificationItem } from '../types/notification';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // ── TODAY ───────────────────────────────────────────────────────────────
  {
    id: 'notif-1',
    type: 'approval_required',
    title: 'High-Value Invoice Approval Required',
    description: 'Invoice #INV-2026-904 from Apex Logistics ($145,000) exceeds ₹100,000 threshold and requires manager signature.',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    timestamp: '10 minutes ago',
    group: 'Today',
    read: false,
    targetModule: 'actions',
    relatedItemId: 'act-search-1',
    actionRequired: true,
    severity: 'warning'
  },
  {
    id: 'notif-2',
    type: 'problem_detected',
    title: 'Critical Problem Detected: EMEA Revenue Contraction',
    description: 'Synaptix Anomaly Engine identified an unpredicted 14.2% ARR drop in EMEA enterprise accounts.',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    timestamp: '45 minutes ago',
    group: 'Today',
    read: false,
    targetModule: 'problems',
    relatedItemId: 'prob-search-1',
    severity: 'critical'
  },
  {
    id: 'notif-3',
    type: 'action_failed',
    title: 'Governed Action Execution Failed',
    description: 'AWS Storage Key Rotation (US-East-1 Cluster) failed due to IAM permission denial on Node #ND-882.',
    workspaceId: 'research',
    workspaceName: 'Research',
    timestamp: '2 hours ago',
    group: 'Today',
    read: false,
    targetModule: 'actions',
    relatedItemId: 'act-search-2',
    severity: 'critical'
  },

  // ── YESTERDAY ───────────────────────────────────────────────────────────
  {
    id: 'notif-4',
    type: 'workflow_completed',
    title: 'Weekly Executive Digest Workflow Completed',
    description: 'Cron automation aggregated 4 high-severity insights and published the FY2026 Q3 PDF digest.',
    workspaceId: 'business',
    workspaceName: 'Business Strategy',
    timestamp: 'Yesterday at 18:30',
    group: 'Yesterday',
    read: true,
    targetModule: 'workflows',
    relatedItemId: 'wf-search-2',
    severity: 'success'
  },
  {
    id: 'notif-5',
    type: 'analysis_completed',
    title: 'Reasoning Synthesis Completed',
    description: 'Multi-modal analysis for Q3 Financial Audit completed across 128 documents and 12 datasets.',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    timestamp: 'Yesterday at 14:15',
    group: 'Yesterday',
    read: true,
    targetModule: 'analytics',
    severity: 'info'
  },
  {
    id: 'notif-6',
    type: 'evidence_changed',
    title: 'Evidence Grade Upgraded to G2 Action-Proven',
    description: 'HIPAA Data Safeguard Rule 164.312 claim verified via live system configuration test.',
    workspaceId: 'healthcare',
    workspaceName: 'Healthcare',
    timestamp: 'Yesterday at 11:00',
    group: 'Yesterday',
    read: false,
    targetModule: 'evidence',
    relatedItemId: 'know-search-2',
    severity: 'info'
  },

  // ── EARLIER ─────────────────────────────────────────────────────────────
  {
    id: 'notif-7',
    type: 'document_processed',
    title: 'Document Ingestion & Indexing Completed',
    description: 'File Revenue_Report_2024.pdf (4.8 MB) successfully extracted, OCR parsed, and entity mapped.',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    timestamp: 'Oct 01, 2026',
    group: 'Earlier',
    read: true,
    targetModule: 'documents',
    relatedItemId: 'doc-search-1',
    severity: 'success'
  },
  {
    id: 'notif-8',
    type: 'action_verified',
    title: 'Action Verification Completed',
    description: 'Plan #PLN-8841 (Freeze Account #ACC-8821) verified successfully with 0 policy violations.',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    timestamp: 'Sep 29, 2026',
    group: 'Earlier',
    read: true,
    targetModule: 'audit',
    relatedItemId: 'audit-search-1',
    severity: 'success'
  }
];
