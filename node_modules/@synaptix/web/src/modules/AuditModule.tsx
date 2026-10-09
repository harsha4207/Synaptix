import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Shield,
  User,
  Bot,
  Cpu,
  Globe,
  Lock,
  ShieldCheck,
  AlertOctagon,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  Info,
  FileText,
  Activity,
  Database,
  Zap,
  BookOpen,
  BarChart3,
  GitCommit
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import {
  AuditEvent,
  AuditEventType,
  AuditStatus,
  AuditRiskTier,
  AuditStage
} from '../types/audit';
import { INITIAL_AUDIT_EVENTS } from '../data/mockAuditEvents';
import { PageContainer, PageContent } from '../components/layout';

interface AuditModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getStageIcon(stage: AuditStage): React.ReactNode {
  const cls = 'stage-icon';
  switch (stage) {
    case 'USER_REQUEST': return <User size={14} className={cls} />;
    case 'UNDERSTAND':   return <BookOpen size={14} className={cls} />;
    case 'RETRIEVE':     return <Database size={14} className={cls} />;
    case 'PLAN':         return <GitCommit size={14} className={cls} />;
    case 'GOVERN':       return <Shield size={14} className={cls} />;
    case 'ACT':          return <Zap size={14} className={cls} />;
    case 'VERIFY':       return <CheckCircle2 size={14} className={cls} />;
    case 'RESULT':       return <BarChart3 size={14} className={cls} />;
    case 'EVOLVE':       return <RefreshCw size={14} className={cls} />;
    default:             return <Activity size={14} className={cls} />;
  }
}

function getEventTypeIcon(type: AuditEventType): React.ReactNode {
  switch (type) {
    case 'USER_REQUEST':        return <User size={14} />;
    case 'INTENT_CLASSIFICATION': return <Bot size={14} />;
    case 'CONTEXT_LOAD':        return <Database size={14} />;
    case 'KNOWLEDGE_RETRIEVAL': return <BookOpen size={14} />;
    case 'PLAN_GENERATION':     return <GitCommit size={14} />;
    case 'EVIDENCE_EVALUATION': return <ShieldCheck size={14} />;
    case 'APPROVAL_REQUEST':    return <Clock size={14} />;
    case 'APPROVAL_GRANTED':    return <CheckCircle2 size={14} />;
    case 'APPROVAL_REJECTED':   return <XCircle size={14} />;
    case 'EXECUTION':           return <Zap size={14} />;
    case 'VERIFICATION':        return <Shield size={14} />;
    case 'OUTCOME':             return <BarChart3 size={14} />;
    case 'EVIDENCE_UPDATE':     return <ShieldCheck size={14} />;
    case 'AUTHENTICATION':      return <Lock size={14} />;
    case 'WORKSPACE_ACCESS':    return <Globe size={14} />;
    case 'DOCUMENT_UPLOAD':     return <FileText size={14} />;
    case 'DATA_EXPORT':         return <Download size={14} />;
    case 'ANOMALY_DETECTED':    return <AlertTriangle size={14} />;
    case 'DASHBOARD_PUBLISH':   return <BarChart3 size={14} />;
    case 'WORKFLOW_TRIGGER':    return <Activity size={14} />;
    default:                    return <Activity size={14} />;
  }
}

function getActorTypeIcon(type: AuditEvent['actorType']): React.ReactNode {
  switch (type) {
    case 'user':     return <User size={12} />;
    case 'system':   return <Cpu size={12} />;
    case 'engine':   return <Bot size={12} />;
    case 'external': return <Globe size={12} />;
  }
}

function getStatusMeta(status: AuditStatus) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', cls: 'audit-status-completed', icon: <CheckCircle2 size={12} /> };
    case 'approved':
      return { label: 'Approved', cls: 'audit-status-approved', icon: <CheckCircle2 size={12} /> };
    case 'rejected':
      return { label: 'Rejected', cls: 'audit-status-rejected', icon: <XCircle size={12} /> };
    case 'pending':
      return { label: 'Pending', cls: 'audit-status-pending', icon: <Clock size={12} /> };
    case 'running':
      return { label: 'Running', cls: 'audit-status-running', icon: <Activity size={12} /> };
    case 'failed':
      return { label: 'Failed', cls: 'audit-status-failed', icon: <XCircle size={12} /> };
    case 'warning':
      return { label: 'Warning', cls: 'audit-status-warning', icon: <AlertTriangle size={12} /> };
    case 'skipped':
      return { label: 'Skipped', cls: 'audit-status-skipped', icon: <ArrowRight size={12} /> };
  }
}

function getRiskMeta(tier: AuditRiskTier) {
  switch (tier) {
    case 'critical':
      return { label: 'Critical', cls: 'risk-critical', dot: '#DC2626' };
    case 'high':
      return { label: 'High', cls: 'risk-high', dot: '#D97706' };
    case 'medium':
      return { label: 'Medium', cls: 'risk-medium', dot: '#0284C7' };
    case 'low':
      return { label: 'Low', cls: 'risk-low', dot: '#059669' };
    case 'info':
      return { label: 'Info', cls: 'risk-info', dot: '#64748B' };
  }
}

function getGradeBadge(grade?: AuditEvent['evidenceGrade']) {
  if (!grade) return null;
  switch (grade) {
    case 'G2': return <span className="audit-grade-badge g2"><ShieldCheck size={11} /> G2</span>;
    case 'G1': return <span className="audit-grade-badge g1"><ShieldCheck size={11} /> G1</span>;
    case 'G0': return <span className="audit-grade-badge g0"><Layers size={11} /> G0</span>;
    case 'Contradicted': return <span className="audit-grade-badge contradicted"><AlertOctagon size={11} /> Contradicted</span>;
    default: return null;
  }
}

// Sort events newest → oldest
function sortByTimestamp(events: AuditEvent[]): AuditEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Group events by planId
function groupByPlan(events: AuditEvent[]): Record<string, AuditEvent[]> {
  const map: Record<string, AuditEvent[]> = {};
  for (const evt of events) {
    if (!map[evt.planId]) map[evt.planId] = [];
    map[evt.planId].push(evt);
  }
  // Within each plan, sort by sequenceNumber asc
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }
  return map;
}

// ── Main Component ───────────────────────────────────────────────────────────

export const AuditModule: React.FC<AuditModuleProps> = ({ workspace, onAddToast }) => {
  const [events] = useState<AuditEvent[]>(() =>
    sortByTimestamp(INITIAL_AUDIT_EVENTS.filter((e) => e.workspaceId === workspace.id || e.workspaceId === 'finance'))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActor, setFilterActor]   = useState('ALL');
  const [filterEventType, setFilterEventType] = useState<AuditEventType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<AuditStatus | 'ALL'>('ALL');
  const [filterRisk, setFilterRisk]     = useState<AuditRiskTier | 'ALL'>('ALL');
  const [showFilters, setShowFilters]   = useState(false);

  const [viewMode, setViewMode] = useState<'timeline' | 'grouped'>('timeline');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set(['PLAN-2026-1044']));

  // ─ Filter logic ─
  const filtered = useMemo(() => {
    return events.filter((evt) => {
      if (filterActor !== 'ALL' && evt.actor !== filterActor) return false;
      if (filterEventType !== 'ALL' && evt.eventType !== filterEventType) return false;
      if (filterStatus !== 'ALL' && evt.status !== filterStatus) return false;
      if (filterRisk !== 'ALL' && evt.riskTier !== filterRisk) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          evt.title.toLowerCase().includes(q) ||
          evt.summary.toLowerCase().includes(q) ||
          evt.actor.toLowerCase().includes(q) ||
          evt.planId.toLowerCase().includes(q) ||
          (evt.actionId ?? '').toLowerCase().includes(q) ||
          evt.eventType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, filterActor, filterEventType, filterStatus, filterRisk, searchQuery]);

  // ─ Unique actors for filter ─
  const uniqueActors = useMemo(() => {
    const set = new Set(events.map((e) => e.actor));
    return Array.from(set).sort();
  }, [events]);

  // ─ Grouped view ─
  const groupedByPlan = useMemo(() => groupByPlan(filtered), [filtered]);
  // Sort plan groups by most recent event within group
  const sortedPlanIds = useMemo(() => {
    return Object.keys(groupedByPlan).sort((a, b) => {
      const latestA = Math.max(...groupedByPlan[a].map((e) => new Date(e.timestamp).getTime()));
      const latestB = Math.max(...groupedByPlan[b].map((e) => new Date(e.timestamp).getTime()));
      return latestB - latestA;
    });
  }, [groupedByPlan]);

  const togglePlan = (planId: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      next.has(planId) ? next.delete(planId) : next.add(planId);
      return next;
    });
  };

  const resetFilters = () => {
    setFilterActor('ALL');
    setFilterEventType('ALL');
    setFilterStatus('ALL');
    setFilterRisk('ALL');
    setSearchQuery('');
  };

  const handleExport = () => {
    onAddToast(`Exported ${filtered.length} audit events as signed JSON log for ${workspace.name}`);
  };

  // ─ KPI Stats ─
  const stats = useMemo(() => ({
    total: events.length,
    completed: events.filter((e) => e.status === 'completed').length,
    warnings: events.filter((e) => e.status === 'warning' || e.riskTier === 'high' || e.riskTier === 'critical').length,
    rejected: events.filter((e) => e.status === 'rejected').length,
    critical: events.filter((e) => e.riskTier === 'critical').length,
  }), [events]);

  return (
    <PageContainer>
      <PageContent>
      <div className="audit-page-container" aria-label="Audit Trail Module">
      {/* ── PAGE HEADER ────────────────────────────────── */}
      <header className="audit-page-header">
        <div className="audit-header-text">
          <div className="audit-breadcrumb">
            <span>{workspace.name}</span>
            <span className="bc-sep">/</span>
            <span className="bc-active">Audit Trail</span>
          </div>
          <div className="audit-title-row">
            <h1 className="audit-main-title">Audit Trail</h1>
            <span className="audit-immutable-badge">
              <Lock size={13} /> Immutable Log
            </span>
          </div>
          <p className="audit-subtitle">
            Complete chronological record of system activity, user actions, governance decisions and evidence updates inside the {workspace.name} workspace.
          </p>
        </div>
        <div className="audit-header-actions">
          <button
            type="button"
            className="audit-secondary-btn"
            onClick={handleExport}
          >
            <Download size={15} /> Export Audit Log
          </button>
        </div>
      </header>

      {/* ── KPI STAT CARDS ─────────────────────────────── */}
      <section className="audit-kpi-row" aria-label="Audit Summary Metrics">
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap neutral"><History size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-num">{stats.total}</span>
            <span className="kpi-label">Total Events</span>
          </div>
        </div>
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap green"><CheckCircle2 size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-num">{stats.completed}</span>
            <span className="kpi-label">Completed</span>
          </div>
        </div>
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap amber"><AlertTriangle size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-num">{stats.warnings}</span>
            <span className="kpi-label">Flagged / High-Risk</span>
          </div>
        </div>
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap red"><XCircle size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-num">{stats.rejected}</span>
            <span className="kpi-label">Rejected Actions</span>
          </div>
        </div>
        <div className="audit-kpi-card">
          <div className="kpi-icon-wrap darkred"><Shield size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-num">{stats.critical}</span>
            <span className="kpi-label">Critical Events</span>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH TOOLBAR ─────────────────────── */}
      <section className="audit-filter-toolbar">
        <div className="audit-search-wrap">
          <Search size={15} className="search-icon-abs" />
          <input
            type="text"
            className="audit-search-input"
            placeholder="Search events by title, actor, plan ID, action ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-q-btn" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`vm-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
          <button
            type="button"
            className={`vm-btn ${viewMode === 'grouped' ? 'active' : ''}`}
            onClick={() => setViewMode('grouped')}
          >
            By Plan
          </button>
        </div>

        <button
          type="button"
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {(filterActor !== 'ALL' || filterEventType !== 'ALL' || filterStatus !== 'ALL' || filterRisk !== 'ALL') && (
            <span className="filter-active-dot" />
          )}
        </button>
      </section>

      {/* ── ADVANCED FILTERS ────────────────────────────── */}
      {showFilters && (
        <section className="audit-advanced-filters">
          <div className="af-item">
            <label className="af-label"><User size={12} /> Actor</label>
            <select
              className="af-select"
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
            >
              <option value="ALL">All Actors</option>
              {uniqueActors.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="af-item">
            <label className="af-label"><Filter size={12} /> Event Type</label>
            <select
              className="af-select"
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value as AuditEventType | 'ALL')}
            >
              <option value="ALL">All Types</option>
              <option value="USER_REQUEST">User Request</option>
              <option value="INTENT_CLASSIFICATION">Intent Classification</option>
              <option value="CONTEXT_LOAD">Context Load</option>
              <option value="KNOWLEDGE_RETRIEVAL">Knowledge Retrieval</option>
              <option value="PLAN_GENERATION">Plan Generation</option>
              <option value="EVIDENCE_EVALUATION">Evidence Evaluation</option>
              <option value="APPROVAL_REQUEST">Approval Request</option>
              <option value="APPROVAL_GRANTED">Approval Granted</option>
              <option value="APPROVAL_REJECTED">Approval Rejected</option>
              <option value="EXECUTION">Execution</option>
              <option value="VERIFICATION">Verification</option>
              <option value="OUTCOME">Outcome</option>
              <option value="EVIDENCE_UPDATE">Evidence Update</option>
              <option value="AUTHENTICATION">Authentication</option>
              <option value="DOCUMENT_UPLOAD">Document Upload</option>
              <option value="ANOMALY_DETECTED">Anomaly Detected</option>
              <option value="DASHBOARD_PUBLISH">Dashboard Publish</option>
            </select>
          </div>

          <div className="af-item">
            <label className="af-label"><Activity size={12} /> Status</label>
            <select
              className="af-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AuditStatus | 'ALL')}
            >
              <option value="ALL">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div className="af-item">
            <label className="af-label"><Shield size={12} /> Risk Tier</label>
            <select
              className="af-select"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as AuditRiskTier | 'ALL')}
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>

          <button type="button" className="af-reset-btn" onClick={resetFilters}>
            <RefreshCw size={12} /> Reset
          </button>
        </section>
      )}

      {/* ── RESULTS COUNT ──────────────────────────────── */}
      <div className="audit-results-bar">
        <span>
          Showing <strong>{filtered.length}</strong> of {events.length} events
        </span>
        <div className="audit-notice">
          <Info size={13} />
          <span>All events are cryptographically sealed and cannot be modified.</span>
        </div>
      </div>

      {/* ── TIMELINE VIEW ──────────────────────────────── */}
      {viewMode === 'timeline' && (
        <main className="audit-timeline-wrapper" aria-label="Audit Event Timeline">
          {filtered.length === 0 ? (
            <AuditEmptyState onReset={resetFilters} />
          ) : (
            <div className="audit-timeline-list">
              {filtered.map((evt, idx) => (
                <AuditTimelineRow
                  key={evt.id}
                  event={evt}
                  isLast={idx === filtered.length - 1}
                  isSelected={selectedEvent?.id === evt.id}
                  onSelect={() => setSelectedEvent(selectedEvent?.id === evt.id ? null : evt)}
                  animationDelay={idx * 40}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── GROUPED BY PLAN VIEW ────────────────────────── */}
      {viewMode === 'grouped' && (
        <main className="audit-grouped-wrapper" aria-label="Audit Events Grouped by Plan">
          {sortedPlanIds.length === 0 ? (
            <AuditEmptyState onReset={resetFilters} />
          ) : (
            <div className="plan-groups-list">
              {sortedPlanIds.map((planId) => {
                const planEvents = groupedByPlan[planId];
                const isExpanded = expandedPlans.has(planId);
                const hasWarning = planEvents.some((e) => e.status === 'warning' || e.riskTier === 'critical');
                const hasRejected = planEvents.some((e) => e.status === 'rejected');
                const latestEvent = planEvents[planEvents.length - 1];

                return (
                  <div key={planId} className={`plan-group-card ${hasWarning ? 'has-warning' : ''} ${hasRejected ? 'has-rejected' : ''}`}>
                    <button
                      type="button"
                      className="plan-group-header"
                      onClick={() => togglePlan(planId)}
                      aria-expanded={isExpanded}
                    >
                      <div className="plan-header-left">
                        <span className="plan-id-code">{planId}</span>
                        <span className="plan-event-count">{planEvents.length} events</span>
                        {hasWarning && <span className="plan-warning-flag"><AlertTriangle size={12} /> Risk</span>}
                        {hasRejected && <span className="plan-rejected-flag"><XCircle size={12} /> Rejected</span>}
                      </div>
                      <div className="plan-header-right">
                        <span className="plan-actor">{planEvents[0]?.actor}</span>
                        <span className="plan-timestamp">{latestEvent?.timestampRelative}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="plan-events-inner">
                        {planEvents.map((evt, idx) => (
                          <AuditTimelineRow
                            key={evt.id}
                            event={evt}
                            isLast={idx === planEvents.length - 1}
                            isSelected={selectedEvent?.id === evt.id}
                            onSelect={() => setSelectedEvent(selectedEvent?.id === evt.id ? null : evt)}
                            animationDelay={idx * 30}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ── EVENT DETAIL DRAWER ─────────────────────────── */}
      {selectedEvent && (
        <AuditDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAddToast={onAddToast}
        />
      )}
      </div>
      </PageContent>
    </PageContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT TIMELINE ROW
// ═══════════════════════════════════════════════════════════════════════════════

interface AuditTimelineRowProps {
  event: AuditEvent;
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
  animationDelay: number;
  compact?: boolean;
}

const AuditTimelineRow: React.FC<AuditTimelineRowProps> = ({
  event, isLast, isSelected, onSelect, animationDelay, compact = false,
}) => {
  const statusMeta = getStatusMeta(event.status);
  const riskMeta   = getRiskMeta(event.riskTier);

  return (
    <div
      className={`audit-timeline-row ${isSelected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-selected={isSelected}
    >
      {/* Left: Stage bullet + connector line */}
      <div className="tl-axis">
        <div className={`tl-bullet status-${event.status} risk-${event.riskTier}`}>
          {getStageIcon(event.stage)}
        </div>
        {!isLast && <div className="tl-connector-line" />}
      </div>

      {/* Right: Content card */}
      <button
        type="button"
        className="tl-card"
        onClick={onSelect}
        aria-label={`View details for: ${event.title}`}
      >
        {/* Card top row */}
        <div className="tl-card-top">
          <div className="tl-meta-left">
            <span className={`tl-stage-pill stage-${event.stage.toLowerCase()}`}>
              {event.stage.replace(/_/g, ' ')}
            </span>
            <span className="tl-event-type">
              {getEventTypeIcon(event.eventType)}
              <span>{event.eventType.replace(/_/g, ' ')}</span>
            </span>
          </div>
          <div className="tl-meta-right">
            <span className={`tl-risk-badge ${riskMeta.cls}`}>
              <span className="risk-dot" style={{ backgroundColor: riskMeta.dot }} />
              {riskMeta.label}
            </span>
            <span className={`tl-status-badge ${statusMeta.cls}`}>
              {statusMeta.icon}
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="tl-card-body">
          <h4 className="tl-title">{event.title}</h4>
          {!compact && <p className="tl-summary">{event.summary}</p>}
        </div>

        {/* Card footer */}
        <div className="tl-card-footer">
          <div className="tl-footer-left">
            <span className="tl-actor-tag">
              {getActorTypeIcon(event.actorType)}
              {event.actor}
            </span>
            {event.planId && (
              <span className="tl-plan-tag">{event.planId}</span>
            )}
            {event.actionId && (
              <span className="tl-action-tag">{event.actionId}</span>
            )}
          </div>
          <div className="tl-footer-right">
            {getGradeBadge(event.evidenceGrade)}
            <span className="tl-timestamp">{event.timestampRelative}</span>
            <span className="tl-expand-hint">View Details</span>
          </div>
        </div>
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT DETAIL DRAWER
// ═══════════════════════════════════════════════════════════════════════════════

interface AuditDetailDrawerProps {
  event: AuditEvent;
  onClose: () => void;
  onAddToast: (msg: string) => void;
}

const AuditDetailDrawer: React.FC<AuditDetailDrawerProps> = ({ event, onClose, onAddToast }) => {
  const statusMeta = getStatusMeta(event.status);
  const riskMeta   = getRiskMeta(event.riskTier);

  return (
    <div className="audit-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="audit-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className={`drawer-stage-icon-badge stage-badge-${event.stage.toLowerCase()}`}>
              {getStageIcon(event.stage)}
            </div>
            <div>
              <div className="drawer-meta-row">
                <span className={`drawer-stage-pill stage-${event.stage.toLowerCase()}`}>
                  {event.stage.replace(/_/g, ' ')}
                </span>
                <span className={`drawer-risk-pill ${riskMeta.cls}`}>
                  <span className="risk-dot" style={{ backgroundColor: riskMeta.dot }} />
                  {riskMeta.label} Risk
                </span>
                <span className={`drawer-status-pill ${statusMeta.cls}`}>
                  {statusMeta.icon} {statusMeta.label}
                </span>
              </div>
              <h2 className="drawer-title">{event.title}</h2>
            </div>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close event details">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="drawer-body">
          {/* Summary */}
          <div className="drawer-section">
            <div className="drawer-section-label">Event Summary</div>
            <p className="drawer-summary-text">{event.summary}</p>
          </div>

          {/* Core identifiers */}
          <div className="drawer-section">
            <div className="drawer-section-label">Event Identifiers</div>
            <div className="drawer-id-grid">
              <div className="id-card">
                <span className="id-key">Event ID</span>
                <code className="id-val">{event.id}</code>
              </div>
              <div className="id-card">
                <span className="id-key">Plan / Chain ID</span>
                <code className="id-val">{event.planId}</code>
              </div>
              {event.actionId && (
                <div className="id-card">
                  <span className="id-key">Action ID</span>
                  <code className="id-val">{event.actionId}</code>
                </div>
              )}
              {event.sessionId && (
                <div className="id-card">
                  <span className="id-key">Session ID</span>
                  <code className="id-val">{event.sessionId}</code>
                </div>
              )}
              <div className="id-card">
                <span className="id-key">Sequence #</span>
                <code className="id-val">#{event.sequenceNumber}</code>
              </div>
              <div className="id-card">
                <span className="id-key">Event Type</span>
                <code className="id-val">{event.eventType}</code>
              </div>
            </div>
          </div>

          {/* Actor & Timestamp */}
          <div className="drawer-section">
            <div className="drawer-section-label">Actor & Timestamp</div>
            <div className="drawer-actor-row">
              <div className="actor-avatar">
                {getActorTypeIcon(event.actorType)}
              </div>
              <div className="actor-info">
                <span className="actor-name">{event.actor}</span>
                <span className="actor-type-label">{event.actorType.toUpperCase()}</span>
              </div>
              <div className="actor-timestamp">
                <span className="ts-full">{event.timestampRelative}</span>
                <code className="ts-iso">{event.timestamp}</code>
              </div>
            </div>
            {event.ipAddress && (
              <div className="ip-row">
                <Globe size={13} />
                <span>{event.ipAddress}</span>
              </div>
            )}
          </div>

          {/* Event-specific Details */}
          <div className="drawer-section">
            <div className="drawer-section-label">Event Detail Record</div>
            <div className="detail-record-list">
              {event.details.map((d, idx) => (
                <div key={idx} className={`detail-record-row ${d.isHighlight ? 'highlight-row' : ''}`}>
                  <span className="detail-key">{d.key}</span>
                  {d.isCode ? (
                    <code className="detail-val-code">{d.value}</code>
                  ) : (
                    <span className={`detail-val ${d.isHighlight ? 'highlight-val' : ''}`}>{d.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Chain (if applicable) */}
          {(event.evidenceGrade || event.evidenceHash) && (
            <div className="drawer-section">
              <div className="drawer-section-label">Evidence Record</div>
              <div className="evidence-record-box">
                {event.evidenceGrade && (
                  <div className="er-row">
                    <span className="er-key">Evidence Grade</span>
                    <span className="er-val">{getGradeBadge(event.evidenceGrade)}</span>
                  </div>
                )}
                {event.evidenceHash && (
                  <div className="er-row">
                    <span className="er-key">Cryptographic Hash</span>
                    <code className="er-hash">{event.evidenceHash}</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Affected Resources */}
          {event.affectedResources && event.affectedResources.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-label">Affected Resources</div>
              <div className="resource-chips">
                {event.affectedResources.map((r) => (
                  <span key={r} className="resource-chip">
                    <FileText size={11} /> {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Duration */}
          {event.durationMs !== undefined && (
            <div className="drawer-section">
              <div className="drawer-section-label">Performance</div>
              <div className="perf-pill">
                <Clock size={14} />
                <span>Duration: <strong>{event.durationMs >= 1000 ? `${(event.durationMs / 1000).toFixed(2)}s` : `${event.durationMs}ms`}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <div className="drawer-footer-left">
            <span className="seal-indicator">
              <Lock size={13} />
              Immutable — Cannot be modified
            </span>
          </div>
          <div className="drawer-footer-right">
            <button
              type="button"
              className="drawer-action-btn secondary"
              onClick={() => {
                onAddToast(`Copied audit event ${event.id} to clipboard`);
              }}
            >
              Copy Event ID
            </button>
            <button
              type="button"
              className="drawer-action-btn primary"
              onClick={() => {
                onAddToast(`Exported cryptographic attestation for ${event.id}`);
              }}
            >
              <Download size={13} /> Export Attestation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════

const AuditEmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="audit-empty-state">
    <History size={38} className="empty-icon" />
    <h3>No matching audit events</h3>
    <p>Try adjusting your search or filter criteria to find the events you are looking for.</p>
    <button type="button" onClick={onReset} className="empty-reset-btn">
      Clear All Filters
    </button>
  </div>
);
