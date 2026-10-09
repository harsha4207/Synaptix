import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Database,
  BrainCircuit,
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  Sparkles,
  Mic,
  ArrowRight,
  UploadCloud,
  LineChart,
  Workflow,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FlaskConical,
  Activity,
  GraduationCap,
  Briefcase,
  FolderPlus
} from 'lucide-react';
import { WorkspaceItem, RecentActivityItem } from '../types/workspace';
import { INITIAL_RECENT_ACTIVITIES, INITIAL_WORKSPACE_INSIGHTS, WorkspaceInsightItem } from '../data/mockWorkspaces';
import { WorkspaceModuleId } from '../design-system/components/Sidebar';
import { PageContainer, PageContent } from './layout';

interface WorkspaceOverviewScreenProps {
  workspace: WorkspaceItem;
  onBackToHub: () => void;
  onSelectModule: (moduleId: WorkspaceModuleId) => void;
  onAddToast: (msg: string) => void;
}

// Animated Counter Component for metrics counting up from 0
const AnimatedCounter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value,
  suffix = '',
  duration = 800,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const WorkspaceOverviewScreen: React.FC<WorkspaceOverviewScreenProps> = ({
  workspace,
  onBackToHub,
  onSelectModule,
  onAddToast,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Filter activities for this workspace boundary only
  const workspaceActivities: RecentActivityItem[] = INITIAL_RECENT_ACTIVITIES.filter(
    (act) => act.workspaceId === workspace.id || act.domain === workspace.domain
  );

  // Fallback default activities if none match
  const displayActivities = workspaceActivities.length > 0 ? workspaceActivities : [
    {
      id: `act-default-1`,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      domain: workspace.domain,
      activityType: 'Workspace Ingestion',
      description: `Domain boundary established for ${workspace.name}`,
      timestamp: workspace.lastActivityTime || 'Just now',
      status: 'completed' as const,
    },
    {
      id: `act-default-2`,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      domain: workspace.domain,
      activityType: 'Knowledge Indexing',
      description: `Parsed ${workspace.documentCount} documents for semantic reasoning`,
      timestamp: '1 hour ago',
      status: 'completed' as const,
    }
  ];

  // Filter insights for this workspace
  const workspaceInsights: WorkspaceInsightItem[] = INITIAL_WORKSPACE_INSIGHTS.filter(
    (ins) => ins.workspaceId === workspace.id
  );

  // Default insights fallback matching prompt requirements
  const displayInsights: WorkspaceInsightItem[] = workspaceInsights.length > 0 ? workspaceInsights : [
    {
      id: 'ins-def-1',
      workspaceId: workspace.id,
      title: 'Revenue Trend Changed',
      summary: `Domain metric baseline updated (+4.2% variance vs prior quarter forecast in ${workspace.name}).`,
      category: 'Trend',
      severity: 'positive',
      confidenceScore: 96,
      timestamp: '10m ago',
      actionText: 'View Trend Analysis',
      targetModule: 'analytics',
    },
    {
      id: 'ins-def-2',
      workspaceId: workspace.id,
      title: 'New Anomaly Detected',
      summary: `Unusual variance pattern flagged in ${workspace.name} data pipeline. Requires review.`,
      category: 'Anomaly',
      severity: 'warning',
      confidenceScore: 92,
      timestamp: '25m ago',
      actionText: 'Inspect Anomaly',
      targetModule: 'problems',
    },
    {
      id: 'ins-def-3',
      workspaceId: workspace.id,
      title: 'Document Requires Review',
      summary: `Latest ${workspace.domain} Compliance Summary parsed. Executive verification pending.`,
      category: 'Document',
      severity: 'info',
      confidenceScore: 99,
      timestamp: '1h ago',
      actionText: 'Review Document',
      targetModule: 'documents',
    },
    {
      id: 'ins-def-4',
      workspaceId: workspace.id,
      title: 'Pending Action Approval',
      summary: `Policy action request #402 in ${workspace.name} waiting for RBAC governance sign-off.`,
      category: 'Approval',
      severity: 'warning',
      confidenceScore: 94,
      timestamp: '2h ago',
      actionText: 'Review & Approve',
      targetModule: 'actions',
    }
  ];

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp size={20} />;
      case 'FlaskConical':
        return <FlaskConical size={20} />;
      case 'Activity':
        return <Activity size={20} />;
      case 'GraduationCap':
        return <GraduationCap size={20} />;
      case 'Briefcase':
        return <Briefcase size={20} />;
      default:
        return <FolderPlus size={20} />;
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    onAddToast(`Executing in ${workspace.name}: "${commandInput}"`);
    setCommandInput('');
  };

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      setCommandInput(`Analyze Q3 performance and identify risk factors in ${workspace.name}`);
      setIsListening(false);
    }, 1400);
  };

  const handleFocusCommand = () => {
    if (commandInputRef.current) {
      commandInputRef.current.focus();
      commandInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 6 Metric Counters calculated for workspace
  const metrics = [
    {
      id: 'docs',
      label: 'Documents',
      value: workspace.documentCount,
      icon: <FileText size={18} />,
      module: 'documents' as WorkspaceModuleId,
      subtext: 'Ingested & indexed',
    },
    {
      id: 'datasets',
      label: 'Datasets',
      value: workspace.datasetCount,
      icon: <Database size={18} />,
      module: 'documents' as WorkspaceModuleId,
      subtext: 'Connected schemas',
    },
    {
      id: 'knowledge',
      label: 'Knowledge Items',
      value: Math.round(workspace.documentCount * 11.2) + 420,
      icon: <BrainCircuit size={18} />,
      module: 'knowledge' as WorkspaceModuleId,
      subtext: 'Triples & entities',
    },
    {
      id: 'dashboards',
      label: 'Dashboards',
      value: workspace.dashboardCount,
      icon: <LayoutDashboard size={18} />,
      module: 'dashboards' as WorkspaceModuleId,
      subtext: 'Active visual views',
    },
    {
      id: 'problems',
      label: 'Open Problems',
      value: workspace.pendingActionCount ? workspace.pendingActionCount + 1 : 2,
      icon: <AlertTriangle size={18} />,
      module: 'problems' as WorkspaceModuleId,
      subtext: 'Anomalies flagged',
      highlight: true,
    },
    {
      id: 'actions',
      label: 'Pending Actions',
      value: workspace.pendingActionCount || 2,
      icon: <CheckSquare size={18} />,
      module: 'actions' as WorkspaceModuleId,
      subtext: 'Awaiting approval',
      highlight: true,
    },
  ];

  return (
    <PageContainer>
      <PageContent>
      <div className="workspace-overview-page animate-fade-in-up">
      {/* 1. TOP BREADCRUMB & WORKSPACE TITLE HEADER */}
      <div className="workspace-overview-header">
        {/* Breadcrumb row */}
        <nav className="workspace-breadcrumb-nav" aria-label="Breadcrumb">
          <button type="button" onClick={onBackToHub} className="breadcrumb-link">
            Workspaces
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{workspace.name}</span>
        </nav>

        {/* Title & Domain Info */}
        <div className="workspace-header-main-row">
          <div className="workspace-header-title-box">
            <div className="workspace-icon-badge" style={{ color: workspace.colorAccent, backgroundColor: `${workspace.colorAccent}15` }}>
              {getDomainIcon(workspace.iconName)}
            </div>
            <div>
              <div className="workspace-header-badges">
                <h1 className="workspace-page-title">{workspace.name}</h1>
                <span className="workspace-type-pill" style={{ color: workspace.colorAccent, borderColor: `${workspace.colorAccent}40` }}>
                  {workspace.domain} Domain
                </span>
                <span className="governance-pill">
                  <ShieldCheck size={13} /> Strict Domain Isolation
                </span>
              </div>
              <p className="workspace-supporting-text">
                Your domain intelligence and operations workspace.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY COMMAND INPUT BAR */}
      <form onSubmit={handleCommandSubmit} className="workspace-command-bar-wrapper">
        <div className="command-bar-inner">
          <div className="command-icon-badge">
            <Sparkles size={18} className="sparkles-icon" />
          </div>

          <input
            ref={commandInputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder={`Ask Synaptix about ${workspace.name.toLowerCase()} workspace...`}
            className="hero-command-input"
          />

          <div className="command-bar-controls">
            <button
              type="button"
              onClick={handleMicClick}
              className={`mic-button ${isListening ? 'listening' : ''}`}
              title="Voice Command Mode"
              aria-label="Activate voice input"
            >
              <Mic size={16} />
            </button>

            <button
              type="submit"
              className="command-submit-btn"
              disabled={!commandInput.trim()}
              title="Execute Command"
            >
              <span>Command</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="command-context-hint">
          <span>Boundary context active: <strong>{workspace.name} Workspace</strong></span>
          <span>Press <strong>Enter</strong> to execute</span>
        </div>
      </form>

      {/* 3. SUMMARY METRIC COUNTERS (6 Cards) */}
      <section className="workspace-summary-section" aria-label="Workspace Metrics Summary">
        <div className="section-header-sm">
          <h2 className="summary-section-title">Workspace Summary</h2>
          <span className="summary-section-subtitle">Real-time domain metrics</span>
        </div>

        <div className="summary-metrics-grid">
          {metrics.map((m) => (
            <div
              key={m.id}
              className={`summary-metric-card ${m.highlight ? 'highlight-border' : ''}`}
              onClick={() => onSelectModule(m.module)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectModule(m.module);
                }
              }}
            >
              <div className="metric-card-header">
                <span className="metric-label">{m.label}</span>
                <span className="metric-icon" style={{ color: workspace.colorAccent }}>
                  {m.icon}
                </span>
              </div>
              <div className="metric-number">
                <AnimatedCounter value={m.value} />
              </div>
              <span className="metric-subtext">{m.subtext}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WORKSPACE INSIGHTS (3-5 Cards) */}
      <section className="workspace-insights-section" aria-label="Domain Insights">
        <div className="section-header-sm">
          <h2 className="summary-section-title">Domain Insights</h2>
          <span className="summary-section-subtitle">Synthesized intelligence for {workspace.name}</span>
        </div>

        <div className="insights-grid">
          {displayInsights.slice(0, 4).map((ins, idx) => (
            <div
              key={ins.id}
              className="workspace-insight-card"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className="insight-card-top">
                <div className="insight-badge-group">
                  <span className={`insight-category-tag ${ins.category.toLowerCase()}`}>
                    {ins.category}
                  </span>
                  <span className={`insight-severity-dot ${ins.severity}`} />
                </div>
                <span className="insight-time">{ins.timestamp}</span>
              </div>

              <h3 className="insight-card-title">{ins.title}</h3>
              <p className="insight-card-desc">{ins.summary}</p>

              <div className="insight-card-footer">
                <div className="confidence-meter-mini">
                  <span className="confidence-label">Confidence</span>
                  <span className="confidence-val">{ins.confidenceScore}%</span>
                </div>

                <button
                  type="button"
                  className="insight-action-btn"
                  onClick={() => onSelectModule((ins.targetModule as WorkspaceModuleId) || 'overview')}
                >
                  <span>{ins.actionText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TWO-COLUMN LOWER SECTION: RECENT ACTIVITY & QUICK ACTIONS */}
      <div className="workspace-lower-grid">
        {/* RECENT ACTIVITY */}
        <section className="workspace-activity-card" aria-label="Recent Workspace Activity">
          <div className="section-header-sm">
            <h3 className="summary-section-title">Recent Activity</h3>
            <span className="summary-section-subtitle">{workspace.name} Scope</span>
          </div>

          <div className="activity-list">
            {displayActivities.map((act) => (
              <div key={act.id} className="activity-item-row">
                <div className="activity-status-icon">
                  {act.status === 'completed' ? (
                    <CheckCircle2 size={16} className="status-completed" />
                  ) : (
                    <AlertCircle size={16} className="status-pending" />
                  )}
                </div>

                <div className="activity-main-info">
                  <div className="activity-type-line">
                    <span className="activity-type-badge">{act.activityType}</span>
                    <span className="activity-time-stamp">{act.timestamp}</span>
                  </div>
                  <p className="activity-details-text">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="workspace-quick-actions-card" aria-label="Workspace Quick Actions">
          <div className="section-header-sm">
            <h3 className="summary-section-title">Quick Actions</h3>
            <span className="summary-section-subtitle">Domain Actions</span>
          </div>

          <div className="quick-actions-grid-custom">
            {/* 1. Upload Data */}
            <button
              type="button"
              className="quick-action-btn-custom"
              onClick={() => {
                onSelectModule('documents');
                onAddToast(`Opened Data Ingestion in ${workspace.name}`);
              }}
            >
              <div className="action-btn-icon icon-cyan">
                <UploadCloud size={18} />
              </div>
              <div className="action-btn-text">
                <h4>Upload Data</h4>
                <p>Ingest documents & datasets</p>
              </div>
              <ArrowRight size={14} className="action-btn-arrow" />
            </button>

            {/* 2. Analyze Data */}
            <button
              type="button"
              className="quick-action-btn-custom"
              onClick={() => {
                onSelectModule('analytics');
                onAddToast(`Opened Analytics Engine in ${workspace.name}`);
              }}
            >
              <div className="action-btn-icon icon-blue">
                <LineChart size={18} />
              </div>
              <div className="action-btn-text">
                <h4>Analyze Data</h4>
                <p>Run query & reasoning models</p>
              </div>
              <ArrowRight size={14} className="action-btn-arrow" />
            </button>

            {/* 3. Create Dashboard */}
            <button
              type="button"
              className="quick-action-btn-custom"
              onClick={() => {
                onSelectModule('dashboards');
                onAddToast(`Initiated Dashboard Creator in ${workspace.name}`);
              }}
            >
              <div className="action-btn-icon icon-navy">
                <LayoutDashboard size={18} />
              </div>
              <div className="action-btn-text">
                <h4>Create Dashboard</h4>
                <p>Build domain view & cards</p>
              </div>
              <ArrowRight size={14} className="action-btn-arrow" />
            </button>

            {/* 4. Create Workflow */}
            <button
              type="button"
              className="quick-action-btn-custom"
              onClick={() => {
                onSelectModule('workflows');
                onAddToast(`Opened Workflow Studio in ${workspace.name}`);
              }}
            >
              <div className="action-btn-icon icon-purple">
                <Workflow size={18} />
              </div>
              <div className="action-btn-text">
                <h4>Create Workflow</h4>
                <p>Automate reasoning pipeline</p>
              </div>
              <ArrowRight size={14} className="action-btn-arrow" />
            </button>

            {/* 5. Ask Synaptix */}
            <button
              type="button"
              className="quick-action-btn-custom full-width"
              onClick={handleFocusCommand}
            >
              <div className="action-btn-icon icon-amber">
                <Sparkles size={18} />
              </div>
              <div className="action-btn-text">
                <h4>Ask Synaptix</h4>
                <p>Focus workspace command input</p>
              </div>
              <ArrowRight size={14} className="action-btn-arrow" />
            </button>
          </div>
        </section>
      </div>
      </div>
      </PageContent>
    </PageContainer>
  );
};
