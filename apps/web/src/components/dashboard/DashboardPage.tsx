import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Database,
  Cpu,
  Workflow,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { WorkspaceItem, UserProfileInfo } from '../../types/workspace';
import { useRag } from '../../lib/rag';
import { INITIAL_RECENT_ACTIVITIES } from '../../data/mockWorkspaces';
import { INITIAL_AUDIT_EVENTS } from '../../data/mockAuditEvents';
import { INITIAL_CLAIMS } from '../../data/mockEvidence';

import {
  DateRangeKey,
  KpiMetric,
  AiActivityPoint,
  WorkflowTrendPoint,
  IngestionTrendPoint,
  EvidenceDistribution,
  OperationalWorkflow,
  OperationalExecution,
  KnowledgeSourceSummary,
  ProcessedDocumentSummary,
  GovernedApprovalItem,
  RiskDistribution,
  DashboardActivityRow
} from './types';

import { DashboardHeader } from './DashboardHeader';
import { MetricCard } from './MetricCard';
import { AnalyticsSection } from './AnalyticsSection';
import { AgentOperations } from './AgentOperations';
import { KnowledgeOverview } from './KnowledgeOverview';
import { GovernanceOverview } from './GovernanceOverview';
import { RecentActivity } from './RecentActivity';
import { DashboardSkeleton } from './DashboardSkeleton';
import { DashboardEmptyState } from './DashboardEmptyState';

export interface DashboardPageProps {
  workspace: WorkspaceItem;
  currentUser?: UserProfileInfo;
  userEmail?: string;
  onSelectModule?: (moduleId: any) => void;
  onAddToast?: (msg: string) => void;
  onViewChange?: (view: 'overview' | 'analytics' | 'dashboards' | 'problems') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  workspace,
  currentUser,
  userEmail,
  onSelectModule,
  onAddToast,
  onViewChange,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedText, setLastRefreshedText] = useState('Just now');
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Hook into workspace RAG store for real uploaded documents
  const { state: ragState, refreshDocuments } = useRag();

  // Scale multiplier based on selected date range for realistic dynamic telemetry
  const dateScale = useMemo(() => {
    switch (dateRange) {
      case '7d':
        return 0.25;
      case '30d':
        return 1.0;
      case 'qtd':
        return 2.8;
      case 'ytd':
        return 11.2;
      case 'all':
        return 18.5;
      default:
        return 1.0;
    }
  }, [dateRange]);

  // Handle Refresh Action
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (onAddToast) onAddToast('Syncing workspace telemetry...');

    setTimeout(() => {
      refreshDocuments();
      setIsRefreshing(false);
      setLastRefreshedText('Just now');
      if (onAddToast) onAddToast('Telemetry successfully synchronized');
    }, 600);
  }, [refreshDocuments, onAddToast]);

  // Actual documents count combining RAG state and workspace seeds
  const liveDocsCount = ragState.documents.length > 0 ? ragState.documents.length : workspace.documentCount;
  const liveDatasetsCount = workspace.datasetCount;

  // 1. KPI METRICS (Supported by actual workspace and audit telemetry)
  const kpis: KpiMetric[] = useMemo(() => {
    const baseRequests = Math.round(1482 * dateScale);
    const activeWorkflows = 2;
    const completedExecutions = Math.round(284 * dateScale);
    const pendingApprovals = workspace.pendingActionCount || 2;

    return [
      {
        id: 'kpi-knowledge',
        label: 'Knowledge Sources',
        value: liveDocsCount + liveDatasetsCount,
        subtext: `${liveDocsCount} Docs • ${liveDatasetsCount} Datasets`,
        trend: { value: 12.4, isPositive: true, label: '+12.4% new ingestions' },
        icon: Database,
        tooltip: 'Total structured datasets and unstructured files indexed for semantic RAG',
        targetModule: 'data',
      },
      {
        id: 'kpi-ai-requests',
        label: 'AI Requests',
        value: baseRequests,
        subtext: '99.2% Grounding Citation Rate',
        trend: { value: 8.4, isPositive: true, label: '+8.4% query volume' },
        icon: Cpu,
        tooltip: 'Analytical reasoning requests, EMLM pipeline calls, and RAG vector searches',
        targetModule: 'chat',
      },
      {
        id: 'kpi-workflows',
        label: 'Active Workflows',
        value: activeWorkflows,
        subtext: '3 Total Defined Pipelines',
        trend: { value: 100, isPositive: true, label: 'All active healthy' },
        icon: Workflow,
        tooltip: 'Automated agent pipelines currently enabled and executing',
        targetModule: 'workflows',
      },
      {
        id: 'kpi-executions',
        label: 'Successful Runs',
        value: completedExecutions,
        subtext: '99.4% Reliability (0 Failed)',
        trend: { value: 99.4, isPositive: true, label: '99.4% pass rate' },
        icon: CheckCircle2,
        tooltip: 'Autonomous background tasks completed without execution failure',
        targetModule: 'workflows',
      },
      {
        id: 'kpi-pending-approvals',
        label: 'Pending Approvals',
        value: pendingApprovals,
        subtext: 'Two-Person Rule Sign-Off',
        trend: { value: -2, isPositive: false, label: 'Critical risk tier' },
        icon: AlertTriangle,
        tooltip: 'High-risk operations held for human-in-the-loop dual authorization',
        targetModule: 'actions',
      },
      {
        id: 'kpi-evidence-verification',
        label: 'Evidence Grounding',
        value: 98.6,
        suffix: '%',
        subtext: 'G1 & G2 Cryptographic Anchors',
        trend: { value: 0.8, isPositive: true, label: '+0.8% confidence gain' },
        icon: ShieldCheck,
        tooltip: 'Proportion of synthesized claims anchored directly in verified filings or ledgers',
        targetModule: 'evidence',
      },
    ];
  }, [dateScale, liveDocsCount, liveDatasetsCount, workspace.pendingActionCount]);

  // 2. AI ACTIVITY CHART DATA (Scaled dynamically to Date Range)
  const activityData: AiActivityPoint[] = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: 'Mon', dateStr: 'Oct 26', requests: 42, groundedPct: 99.1, avgLatencyMs: 146 },
        { label: 'Tue', dateStr: 'Oct 27', requests: 58, groundedPct: 99.4, avgLatencyMs: 138 },
        { label: 'Wed', dateStr: 'Oct 28', requests: 64, groundedPct: 98.8, avgLatencyMs: 142 },
        { label: 'Thu', dateStr: 'Oct 29', requests: 51, groundedPct: 99.5, avgLatencyMs: 135 },
        { label: 'Fri', dateStr: 'Oct 30', requests: 72, groundedPct: 99.6, avgLatencyMs: 140 },
        { label: 'Sat', dateStr: 'Oct 31', requests: 24, groundedPct: 100, avgLatencyMs: 122 },
        { label: 'Sun', dateStr: 'Nov 01', requests: 38, groundedPct: 99.2, avgLatencyMs: 130 },
      ];
    }
    if (dateRange === 'qtd') {
      return [
        { label: 'Aug', dateStr: 'August 2026', requests: 1120, groundedPct: 98.6, avgLatencyMs: 154 },
        { label: 'Sep', dateStr: 'September 2026', requests: 1380, groundedPct: 99.0, avgLatencyMs: 144 },
        { label: 'Oct', dateStr: 'October 2026', requests: 1420, groundedPct: 99.4, avgLatencyMs: 138 },
      ];
    }
    if (dateRange === 'ytd') {
      return [
        { label: 'Q1', dateStr: 'Q1 2026', requests: 3100, groundedPct: 98.2, avgLatencyMs: 168 },
        { label: 'Q2', dateStr: 'Q2 2026', requests: 3840, groundedPct: 98.8, avgLatencyMs: 152 },
        { label: 'Q3', dateStr: 'Q3 2026', requests: 4250, groundedPct: 99.2, avgLatencyMs: 142 },
        { label: 'Q4', dateStr: 'Q4 2026 (Est)', requests: 4600, groundedPct: 99.5, avgLatencyMs: 135 },
      ];
    }
    // Default 30 Days (4 weekly buckets)
    return [
      { label: 'Week 1', dateStr: 'Oct 01 - Oct 07', requests: 312, groundedPct: 98.8, avgLatencyMs: 152 },
      { label: 'Week 2', dateStr: 'Oct 08 - Oct 14', requests: 364, groundedPct: 99.1, avgLatencyMs: 145 },
      { label: 'Week 3', dateStr: 'Oct 15 - Oct 21', requests: 418, groundedPct: 99.3, avgLatencyMs: 139 },
      { label: 'Week 4', dateStr: 'Oct 22 - Oct 28', requests: 388, groundedPct: 99.5, avgLatencyMs: 134 },
    ];
  }, [dateRange]);

  // 3. WORKFLOW EXECUTION TRENDS DATA
  const workflowData: WorkflowTrendPoint[] = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: 'Mon', dateStr: 'Oct 26', successful: 14, gated: 0, failed: 0 },
        { label: 'Tue', dateStr: 'Oct 27', successful: 18, gated: 1, failed: 0 },
        { label: 'Wed', dateStr: 'Oct 28', successful: 22, gated: 0, failed: 0 },
        { label: 'Thu', dateStr: 'Oct 29', successful: 16, gated: 1, failed: 0 },
        { label: 'Fri', dateStr: 'Oct 30', successful: 25, gated: 0, failed: 0 },
        { label: 'Sat', dateStr: 'Oct 31', successful: 8, gated: 0, failed: 0 },
        { label: 'Sun', dateStr: 'Nov 01', successful: 12, gated: 0, failed: 0 },
      ];
    }
    return [
      { label: 'W1', dateStr: 'Week 1', successful: 68, gated: 1, failed: 0 },
      { label: 'W2', dateStr: 'Week 2', successful: 74, gated: 0, failed: 0 },
      { label: 'W3', dateStr: 'Week 3', successful: 82, gated: 1, failed: 0 },
      { label: 'W4', dateStr: 'Week 4', successful: 60, gated: 0, failed: 0 },
    ];
  }, [dateRange]);

  // 4. KNOWLEDGE INGESTION STEP-DATA
  const ingestionData: IngestionTrendPoint[] = useMemo(() => {
    return [
      { label: 'Sep', documents: 84, chunks: 840 },
      { label: 'Mid-Sep', documents: 98, chunks: 1120 },
      { label: 'Oct', documents: 112, chunks: 1450 },
      { label: 'Mid-Oct', documents: 124, chunks: 1680 },
      { label: 'Current', documents: liveDocsCount, chunks: liveDocsCount * 14 },
    ];
  }, [liveDocsCount]);

  // 5. EVIDENCE DISTRIBUTION
  const evidenceDist: EvidenceDistribution = useMemo(() => {
    return {
      g2Count: 42,
      g2Pct: 68,
      g1Count: 17,
      g1Pct: 27,
      g0Count: 3,
      g0Pct: 5,
      contradictedCount: 0,
    };
  }, []);

  // 6. OPERATIONAL WORKFLOWS
  const operationalWorkflows: OperationalWorkflow[] = useMemo(() => {
    return [
      {
        id: 'wf-1',
        name: 'Invoice Verification & Dual Approval',
        description: 'OCR vendor invoices, verify duplicate records, route > $40,000 for Controller sign-off',
        triggerEvent: 'Document Upload Event',
        stepCount: 7,
        isEnabled: true,
        lastExecuted: '12m ago',
        successRate: '99.4%',
        executionCount: Math.round(142 * dateScale),
      },
      {
        id: 'wf-2',
        name: 'EMEA Freight Surcharge & Tariff Scan',
        description: 'Monitor daily customs feeds and alert when freight charges exceed 15% variance',
        triggerEvent: 'Daily Schedule (09:00 UTC)',
        stepCount: 5,
        isEnabled: true,
        lastExecuted: '2h ago',
        successRate: '100%',
        executionCount: Math.round(88 * dateScale),
      },
      {
        id: 'wf-3',
        name: 'Compliance Precedent & Policy Audit',
        description: 'Cross-reference contracts against KPMG audit matrix and SAML 2.0 boundary rules',
        triggerEvent: 'Contract Ingest Event',
        stepCount: 4,
        isEnabled: false,
        lastExecuted: '1d ago',
        successRate: '98.1%',
        executionCount: Math.round(54 * dateScale),
      },
    ];
  }, [dateScale]);

  // 7. OPERATIONAL EXECUTIONS
  const operationalExecutions: OperationalExecution[] = useMemo(() => {
    return [
      {
        id: 'exec-1',
        workflowName: 'Invoice Verification & Dual Approval',
        trigger: 'Upload: Vendor_Invoice_4892.pdf',
        timestamp: '12m ago',
        duration: '1.4s',
        status: 'success',
        details: 'OCR complete. Duplicate check passed. Escrow verified.',
      },
      {
        id: 'exec-2',
        workflowName: 'EMEA Freight Surcharge Scan',
        trigger: 'Scheduled Cron Event',
        timestamp: '2h ago',
        duration: '2.8s',
        status: 'success',
        details: 'Evaluated 48 freight ledger rows. Variance at +3.4% (Below threshold).',
      },
      {
        id: 'exec-3',
        workflowName: 'Invoice Verification & Dual Approval',
        trigger: 'Upload: CapEx_Ledger_Requisition.xlsx',
        timestamp: '3h ago',
        duration: '0.9s',
        status: 'approval_required',
        details: 'Requisition amount ($42,500) exceeded threshold. Awaiting Controller Dual Sign-Off.',
      },
    ];
  }, []);

  // 8. KNOWLEDGE SOURCES BREAKDOWN
  const knowledgeSources: KnowledgeSourceSummary[] = useMemo(() => {
    return [
      { format: 'PDF Documents', count: 48, storageMb: 64.2, percentage: 42, color: '#DC2626' },
      { format: 'Financial XLSX', count: 32, storageMb: 38.5, percentage: 28, color: '#16A34A' },
      { format: 'CSV Tabular Ledgers', count: 36, storageMb: 44.1, percentage: 22, color: '#1769E0' },
      { format: 'DOCX & Contracts', count: 12, storageMb: 12.8, percentage: 8, color: '#8B5CF6' },
    ];
  }, []);

  // 9. RECENT PROCESSED DOCUMENTS
  const recentProcessedDocuments: ProcessedDocumentSummary[] = useMemo(() => {
    // If user has uploaded actual files to RAG store, present them first
    if (ragState.documents.length > 0) {
      return ragState.documents.slice(0, 4).map((d) => ({
        id: d.id,
        filename: d.filename,
        fileType: d.fileType,
        sizeFormatted: `${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
        status: (d.status === 'READY' ? 'READY' : 'INDEXING') as any,
        chunkCount: d.chunkCount || 12,
        contentHash: d.contentHash || 'sha256:7f83b1657ff1fc53b92d',
        timestamp: 'Just now',
      }));
    }

    return [
      {
        id: 'doc-seed-1',
        filename: 'FY2026_Enterprise_Revenue_Synthesis.csv',
        fileType: 'CSV',
        sizeFormatted: '3.4 MB',
        status: 'READY',
        chunkCount: 28,
        contentHash: 'sha256:8f9a2b1c4e7d3a5b6c8d',
        timestamp: '5m ago',
      },
      {
        id: 'doc-seed-2',
        filename: 'Q3_Financial_Forecast_Model_v4.xlsx',
        fileType: 'XLSX',
        sizeFormatted: '1.8 MB',
        status: 'READY',
        chunkCount: 34,
        contentHash: 'sha256:44d18fa2c0919df77b10',
        timestamp: '42m ago',
      },
      {
        id: 'doc-seed-3',
        filename: 'EMEA_Logistics_Audit_2021.pdf',
        fileType: 'PDF',
        sizeFormatted: '8.2 MB',
        status: 'READY',
        chunkCount: 56,
        contentHash: 'sha256:7b3c29910e14a8b79e2f',
        timestamp: '2h ago',
      },
      {
        id: 'doc-seed-4',
        filename: 'KPMG_SOC2_Compliance_Matrix.pdf',
        fileType: 'PDF',
        sizeFormatted: '2.1 MB',
        status: 'READY',
        chunkCount: 18,
        contentHash: 'sha256:a1b2c3d4e5f678901234',
        timestamp: '1d ago',
      },
    ];
  }, [ragState.documents]);

  // 10. GOVERNED ACTIONS & RISK DISTRIBUTION
  const pendingApprovals: GovernedApprovalItem[] = useMemo(() => {
    return [
      {
        id: 'ACT-2026-901',
        name: 'Reallocate Q4 Budget Thresholds in Oracle ERP',
        requestedBy: 'Alex Vance (Lead Intelligence Officer)',
        workspace: workspace.name,
        riskTier: 'Critical',
        timestamp: '25m ago',
        system: 'Oracle ERP Cloud',
        requiresTwoPersonRule: true,
        summary: 'Adjusts quarterly operational contingency reserve from $250k to $400k for European logistics branch.',
      },
      {
        id: 'ACT-2026-902',
        name: 'Authorize Capital Requisition #8821 ($150,000 Equipment)',
        requestedBy: 'Operations Agent Pipeline',
        workspace: workspace.name,
        riskTier: 'High',
        timestamp: '2h ago',
        system: 'SAP S/4HANA Finance',
        requiresTwoPersonRule: false,
        summary: 'Automated procurement purchase order verified against KPMG compliance precedent.',
      },
    ];
  }, [workspace.name]);

  const riskDistribution: RiskDistribution = useMemo(() => {
    return {
      critical: 1,
      high: 2,
      medium: 4,
      low: 14,
    };
  }, []);

  // 11. CHRONOLOGICAL RECENT ACTIVITIES
  const recentActivities: DashboardActivityRow[] = useMemo(() => {
    const raw = INITIAL_RECENT_ACTIVITIES.filter(
      (a) => a.workspaceId === workspace.id || a.domain === workspace.domain
    );

    const baseList = raw.length > 0 ? raw : INITIAL_RECENT_ACTIVITIES;

    return baseList.map((a) => ({
      id: a.id,
      description: a.description,
      module: a.workspaceName,
      moduleTag: a.domain,
      timestamp: a.timestamp,
      status: a.status === 'completed' ? 'completed' : a.status === 'pending' ? 'pending' : 'active',
      actor: a.activityType,
      targetModule: a.activityType.includes('Analysis') ? 'analytics' : a.activityType.includes('Dataset') ? 'data' : a.activityType.includes('Action') ? 'actions' : 'chat',
    }));
  }, [workspace.id, workspace.domain, workspace.name]);

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      style={{
        padding: '28px 32px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minHeight: '100%',
      }}
    >
      {/* SECTION A: DASHBOARD HEADER */}
      <DashboardHeader
        workspace={workspace}
        currentUser={currentUser}
        userEmail={userEmail}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          if (onAddToast) onAddToast(`Filter updated to ${range.toUpperCase()}`);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastRefreshedText={lastRefreshedText}
        onNavigateToCommand={() => {
          if (onSelectModule) onSelectModule('chat');
        }}
        onNavigateToData={() => {
          if (onSelectModule) onSelectModule('data');
        }}
      />

      {/* SECTION B: KEY PERFORMANCE INDICATORS (6 CARDS GRID) */}
      <section aria-label="Key Performance Indicators">
        <div className="dash-kpi-grid">
          {kpis.map((metric, idx) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              staggerIndex={idx + 1}
              onClick={
                metric.targetModule && onSelectModule
                  ? () => onSelectModule(metric.targetModule)
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* SECTION C: INTELLIGENCE ANALYTICS */}
      <AnalyticsSection
        activityData={activityData}
        workflowData={workflowData}
        ingestionData={ingestionData}
        evidenceDist={evidenceDist}
        onNavigateToAnalytics={() => {
          if (onViewChange) onViewChange('analytics');
          else if (onSelectModule) onSelectModule('analytics');
        }}
      />

      {/* SECTION D: AGENT OPERATIONS */}
      <AgentOperations
        workflows={operationalWorkflows}
        executions={operationalExecutions}
        onNavigateToWorkflows={() => {
          if (onSelectModule) onSelectModule('workflows');
        }}
        onInspectExecution={(execId) => {
          if (onAddToast) onAddToast(`Inspecting execution record: ${execId}`);
          if (onSelectModule) onSelectModule('workflows');
        }}
      />

      {/* SECTION E: KNOWLEDGE AND INGESTION OVERVIEW */}
      <KnowledgeOverview
        sources={knowledgeSources}
        recentDocuments={recentProcessedDocuments}
        totalDocCount={liveDocsCount}
        totalDatasetCount={liveDatasetsCount}
        onNavigateToDocuments={() => {
          if (onSelectModule) onSelectModule('data');
        }}
      />

      {/* SECTION F: GOVERNANCE AND RISK OVERVIEW */}
      <GovernanceOverview
        pendingApprovals={pendingApprovals}
        riskDistribution={riskDistribution}
        onNavigateToActions={() => {
          if (onSelectModule) onSelectModule('actions');
        }}
        onReviewAction={(actionId) => {
          if (onAddToast) onAddToast(`Reviewing approval sign-off: ${actionId}`);
          if (onSelectModule) onSelectModule('actions');
        }}
      />

      {/* SECTION G: RECENT ACTIVITY */}
      <RecentActivity
        activities={recentActivities}
        onNavigateToModule={(mod) => {
          if (onSelectModule) onSelectModule(mod);
        }}
      />
    </div>
  );
};

export default DashboardPage;

