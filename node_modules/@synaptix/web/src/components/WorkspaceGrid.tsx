import React from 'react';
import {
  TrendingUp,
  FlaskConical,
  Activity,
  GraduationCap,
  Briefcase,
  FolderPlus,
  ArrowRight,
  FileText,
  Database,
  LayoutDashboard,
  Clock,
  Plus
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';

interface WorkspaceGridProps {
  workspaces: WorkspaceItem[];
  highlightedWorkspaceId?: string | null;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspaceClick: () => void;
  isLoading?: boolean;
  showWorkspaceMetadata?: boolean;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  workspaces,
  highlightedWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspaceClick,
  isLoading = false,
  showWorkspaceMetadata = true,
}) => {
  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp size={22} />;
      case 'FlaskConical':
        return <FlaskConical size={22} />;
      case 'Activity':
        return <Activity size={22} />;
      case 'GraduationCap':
        return <GraduationCap size={22} />;
      case 'Briefcase':
        return <Briefcase size={22} />;
      default:
        return <FolderPlus size={22} />;
    }
  };

  return (
    <section className="workspaces-section" aria-label="Authorized Workspaces">
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Workspaces</h2>
          <p className="section-subtitle">Select a workspace to continue.</p>
        </div>
        
        <button
          type="button"
          onClick={onCreateWorkspaceClick}
          className="btn-secondary-create"
        >
          <Plus size={16} />
          <span>Create Workspace</span>
        </button>
      </div>

      {isLoading ? (
        /* Skeleton Loading State */
        <div className="workspace-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="workspace-card skeleton-card">
              <div className="skeleton-line skeleton-header" />
              <div className="skeleton-line skeleton-desc" />
              <div className="skeleton-metrics-row">
                <div className="skeleton-pill" />
                <div className="skeleton-pill" />
              </div>
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        /* Empty State */
        <div className="empty-workspace-container">
          <div className="empty-icon-circle">
            <FolderPlus size={32} />
          </div>
          <h3>Create your first workspace</h3>
          <p>
            Start by creating a domain where Synaptix can organize your data, knowledge, analytics, and workflows.
          </p>
          <button type="button" onClick={onCreateWorkspaceClick} className="btn-primary" style={{ width: 'auto', padding: '0 1.5rem' }}>
            <Plus size={16} /> Create Workspace
          </button>
        </div>
      ) : (
        /* Workspace Card Grid */
        <div className="workspace-grid">
          {workspaces.map((ws) => {
            const isHighlighted = highlightedWorkspaceId === ws.id;

            return (
              <div
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`workspace-card ${isHighlighted ? 'highlighted-ring' : ''}`}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectWorkspace(ws.id);
                  }
                }}
              >
                {/* Top Row: Icon + Title */}
                <div className="card-top-row">
                  <div className="domain-icon-badge" style={{ color: ws.colorAccent, backgroundColor: `${ws.colorAccent}10` }}>
                    {getDomainIcon(ws.iconName)}
                  </div>
                  {ws.pendingActionCount && ws.pendingActionCount > 0 ? (
                    <span className="pending-badge">
                      {ws.pendingActionCount} Action{ws.pendingActionCount > 1 ? 's' : ''} Pending
                    </span>
                  ) : null}
                </div>

                {/* Workspace Title & Description */}
                <div className="card-heading-group">
                  <h3 className="workspace-name">{ws.name}</h3>
                  <p className="workspace-description">{ws.description}</p>
                </div>

                {/* Dynamic Data Counters (Documents, Datasets, Dashboards) */}
                {showWorkspaceMetadata && (
                  <div className="workspace-metrics-row">
                    <div className="metric-tag" title="Documents">
                      <FileText size={13} />
                      <span>{ws.documentCount} Docs</span>
                    </div>
                    <div className="metric-tag" title="Datasets">
                      <Database size={13} />
                      <span>{ws.datasetCount} Datasets</span>
                    </div>
                    <div className="metric-tag" title="Dashboards">
                      <LayoutDashboard size={13} />
                      <span>{ws.dashboardCount} Dashboards</span>
                    </div>
                  </div>
                )}

                {/* Card Footer: Activity & Affordance */}
                <div className="card-footer">
                  <div className="last-activity-item">
                    <Clock size={12} />
                    <span className="activity-text">{ws.lastActivity}</span>
                  </div>
                  
                  <div className="open-affordance">
                    <span>Open workspace</span>
                    <ArrowRight size={14} className="affordance-arrow" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* "+ Create Workspace" Entry Point Card */}
          <div
            onClick={onCreateWorkspaceClick}
            className="workspace-card create-card-dashed"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCreateWorkspaceClick();
              }
            }}
          >
            <div className="create-card-inner">
              <div className="create-icon-circle">
                <Plus size={24} />
              </div>
              <h3 className="create-card-title">Create Workspace</h3>
              <p className="create-card-desc">Add a new domain boundary for your data and reasoning</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
