import { WorkspaceItem, RecentActivityItem } from '../types/workspace';

export const INITIAL_WORKSPACES: WorkspaceItem[] = [
  {
    id: 'finance',
    name: 'Finance',
    domain: 'Finance',
    description: 'Financial intelligence, revenue modeling & operational auditing',
    iconName: 'TrendingUp',
    documentCount: 128,
    datasetCount: 12,
    dashboardCount: 4,
    pendingActionCount: 2,
    lastActivity: 'Revenue analysis completed',
    lastActivityTime: '5 minutes ago',
    colorAccent: '#1769E0',
    isAuthorized: true
  },
  {
    id: 'research',
    name: 'Research',
    domain: 'Research',
    description: 'Scientific synthesis, paper analysis & knowledge extraction',
    iconName: 'FlaskConical',
    documentCount: 84,
    datasetCount: 18,
    dashboardCount: 6,
    lastActivity: 'Dataset uploaded: clinical_trial_v4.csv',
    lastActivityTime: '20 minutes ago',
    colorAccent: '#2496FF',
    isAuthorized: true
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    domain: 'Healthcare',
    description: 'Patient outcome analytics & HIPAA-compliant evidence reasoning',
    iconName: 'Activity',
    documentCount: 210,
    datasetCount: 32,
    dashboardCount: 5,
    pendingActionCount: 1,
    lastActivity: 'Executive compliance audit generated',
    lastActivityTime: '1 hour ago',
    colorAccent: '#0D9488',
    isAuthorized: true
  },
  {
    id: 'education',
    name: 'Education',
    domain: 'Education',
    description: 'Curriculum optimization, learning insights & student outcome modeling',
    iconName: 'GraduationCap',
    documentCount: 96,
    datasetCount: 8,
    dashboardCount: 3,
    lastActivity: 'Q3 Learning analytics report compiled',
    lastActivityTime: '3 hours ago',
    colorAccent: '#8B5CF6',
    isAuthorized: true
  },
  {
    id: 'business',
    name: 'Business Strategy',
    domain: 'Business',
    description: 'Market positioning, competitor reasoning & strategic execution',
    iconName: 'Briefcase',
    documentCount: 145,
    datasetCount: 22,
    dashboardCount: 8,
    pendingActionCount: 3,
    lastActivity: 'Competitive intelligence synthesis updated',
    lastActivityTime: '5 hours ago',
    colorAccent: '#F59E0B',
    isAuthorized: true
  },
  {
    id: 'operations',
    name: 'Custom Operations',
    domain: 'Custom',
    description: 'Autonomous execution pipelines, logistics nodes & operational workflows',
    iconName: 'Cpu',
    documentCount: 65,
    datasetCount: 14,
    dashboardCount: 4,
    pendingActionCount: 1,
    lastActivity: 'Workflow pipeline execution verified',
    lastActivityTime: '30 minutes ago',
    colorAccent: '#10B981',
    isAuthorized: true
  }
];

export const INITIAL_RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-1',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    domain: 'Finance',
    activityType: 'Analysis Run',
    description: 'Revenue analysis completed for FY2025 - FY2026 forecast',
    timestamp: '5 minutes ago',
    status: 'completed'
  },
  {
    id: 'act-2',
    workspaceId: 'research',
    workspaceName: 'Research',
    domain: 'Research',
    activityType: 'Dataset Ingested',
    description: 'Dataset uploaded: clinical_trial_v4.csv (14.2 MB)',
    timestamp: '20 minutes ago',
    status: 'completed'
  },
  {
    id: 'act-3',
    workspaceId: 'finance',
    workspaceName: 'Finance',
    domain: 'Finance',
    activityType: 'Dashboard Generated',
    description: 'Executive cash flow dashboard generated',
    timestamp: '1 hour ago',
    status: 'completed'
  },
  {
    id: 'act-4',
    workspaceId: 'healthcare',
    workspaceName: 'Healthcare',
    domain: 'Healthcare',
    activityType: 'Action Approval',
    description: 'HIPAA policy compliance check pending review',
    timestamp: '2 hours ago',
    status: 'pending'
  },
  {
    id: 'act-5',
    workspaceId: 'business',
    workspaceName: 'Business Strategy',
    domain: 'Business',
    activityType: 'Reasoning Execution',
    description: 'Market expansion scenario planning synthesized',
    timestamp: '4 hours ago',
    status: 'completed'
  }
];

export interface WorkspaceInsightItem {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  category: 'Trend' | 'Anomaly' | 'Document' | 'Approval' | 'Recommendation';
  severity: 'info' | 'warning' | 'positive' | 'critical';
  confidenceScore: number;
  timestamp: string;
  actionText: string;
  targetModule?: string;
}

export const INITIAL_WORKSPACE_INSIGHTS: WorkspaceInsightItem[] = [
  // Finance Domain Insights
  {
    id: 'ins-fin-1',
    workspaceId: 'finance',
    title: 'Revenue Trend Changed',
    summary: 'Q3 Gross Margin forecast updated (+4.2% variance vs baseline model following vendor optimization).',
    category: 'Trend',
    severity: 'positive',
    confidenceScore: 96,
    timestamp: '10m ago',
    actionText: 'View Trend Analysis',
    targetModule: 'analytics',
  },
  {
    id: 'ins-fin-2',
    workspaceId: 'finance',
    title: 'New Anomaly Detected',
    summary: 'Unusual expense variance flagged in Operations budget ($42,500 unallocated requisition).',
    category: 'Anomaly',
    severity: 'warning',
    confidenceScore: 92,
    timestamp: '25m ago',
    actionText: 'Inspect Anomaly',
    targetModule: 'problems',
  },
  {
    id: 'ins-fin-3',
    workspaceId: 'finance',
    title: 'Document Requires Review',
    summary: 'FY2026 Q3 Financial Audit Summary.pdf parsed and indexed. Requires executive verification.',
    category: 'Document',
    severity: 'info',
    confidenceScore: 99,
    timestamp: '1h ago',
    actionText: 'Review Document',
    targetModule: 'documents',
  },
  {
    id: 'ins-fin-4',
    workspaceId: 'finance',
    title: 'Pending Action Approval',
    summary: 'Capital Requisition #8821 ($150,000 Equipment Purchase) waiting for RBAC sign-off.',
    category: 'Approval',
    severity: 'warning',
    confidenceScore: 94,
    timestamp: '2h ago',
    actionText: 'Review & Approve',
    targetModule: 'actions',
  },

  // Research Domain Insights
  {
    id: 'ins-res-1',
    workspaceId: 'research',
    title: 'Literature Correlation Found',
    summary: 'Cross-reference engine identified 3 independent published studies supporting Alpha-7 compound efficacy.',
    category: 'Trend',
    severity: 'positive',
    confidenceScore: 98,
    timestamp: '15m ago',
    actionText: 'View Graph Correlation',
    targetModule: 'knowledge',
  },
  {
    id: 'ins-res-2',
    workspaceId: 'research',
    title: 'New Anomaly Detected',
    summary: 'Outlier sample point detected in Trial Cohort B dose-response curve.',
    category: 'Anomaly',
    severity: 'warning',
    confidenceScore: 89,
    timestamp: '45m ago',
    actionText: 'Analyze Outliers',
    targetModule: 'problems',
  },
  {
    id: 'ins-res-3',
    workspaceId: 'research',
    title: 'Document Requires Review',
    summary: 'Phase II Clinical Protocol Revision v3.2 requires principal investigator sign-off.',
    category: 'Document',
    severity: 'info',
    confidenceScore: 97,
    timestamp: '2h ago',
    actionText: 'Inspect Protocol',
    targetModule: 'documents',
  },
  {
    id: 'ins-res-4',
    workspaceId: 'research',
    title: 'Pending Action Approval',
    summary: 'Automated Genomics Data Pipeline Ingestion request awaiting governance authorization.',
    category: 'Approval',
    severity: 'warning',
    confidenceScore: 95,
    timestamp: '3h ago',
    actionText: 'Authorize Pipeline',
    targetModule: 'actions',
  },

  // Healthcare Domain Insights
  {
    id: 'ins-hc-1',
    workspaceId: 'healthcare',
    title: 'Readmission Rate Reduced',
    summary: '30-day post-op readmission rate decreased by 3.8% following updated clinical pathway implementation.',
    category: 'Trend',
    severity: 'positive',
    confidenceScore: 95,
    timestamp: '30m ago',
    actionText: 'View Pathway Data',
    targetModule: 'analytics',
  },
  {
    id: 'ins-hc-2',
    workspaceId: 'healthcare',
    title: 'New Anomaly Detected',
    summary: 'Vital sign telemetry anomaly flagged in Intensive Care Unit 4 monitoring cluster.',
    category: 'Anomaly',
    severity: 'critical',
    confidenceScore: 94,
    timestamp: '50m ago',
    actionText: 'View Telemetry',
    targetModule: 'problems',
  },
  {
    id: 'ins-hc-3',
    workspaceId: 'healthcare',
    title: 'Document Requires Review',
    summary: 'HIPAA Annual Security Audit Checklist 2026 drafted and ready for review.',
    category: 'Document',
    severity: 'info',
    confidenceScore: 100,
    timestamp: '1h ago',
    actionText: 'Review Audit Checklist',
    targetModule: 'documents',
  },

  // Education Domain Insights
  {
    id: 'ins-edu-1',
    workspaceId: 'education',
    title: 'Student Outcome Boost',
    summary: 'Completion rate in STEM Modules increased by +8.4% following adaptive learning rollout.',
    category: 'Trend',
    severity: 'positive',
    confidenceScore: 93,
    timestamp: '1h ago',
    actionText: 'View Analytics',
    targetModule: 'analytics',
  },
  {
    id: 'ins-edu-2',
    workspaceId: 'education',
    title: 'Curriculum Gap Identified',
    summary: 'Prerequisite topic gap identified between Intro Algebra and Advanced Calculus syllabus.',
    category: 'Anomaly',
    severity: 'warning',
    confidenceScore: 91,
    timestamp: '2h ago',
    actionText: 'View Gap Analysis',
    targetModule: 'problems',
  },

  // Business Strategy Insights
  {
    id: 'ins-biz-1',
    workspaceId: 'business',
    title: 'Market Expansion Shift',
    summary: 'Competitor pricing strategy change detected in APAC enterprise market segment.',
    category: 'Trend',
    severity: 'info',
    confidenceScore: 96,
    timestamp: '2h ago',
    actionText: 'View Competitive Synthesis',
    targetModule: 'analytics',
  },
  // Custom Operations Insights
  {
    id: 'ins-ops-1',
    workspaceId: 'operations',
    title: 'Autonomous DAG Pipeline Active',
    summary: 'Automated data orchestration completed 1,420 scheduled batch jobs across regional clusters.',
    category: 'Trend',
    severity: 'positive',
    confidenceScore: 97,
    timestamp: '15m ago',
    actionText: 'View Automation Log',
    targetModule: 'workflows',
  },
  {
    id: 'ins-ops-2',
    workspaceId: 'operations',
    title: 'Node Latency Threshold Warning',
    summary: 'Edge execution node EU-WEST-4 recorded 240ms round-trip latency variance.',
    category: 'Anomaly',
    severity: 'warning',
    confidenceScore: 92,
    timestamp: '30m ago',
    actionText: 'Inspect Node Alert',
    targetModule: 'problems',
  }
];

