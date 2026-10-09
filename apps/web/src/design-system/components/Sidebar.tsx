import React from 'react';
import {
  LayoutDashboard,
  Bot,
  BrainCircuit,
  FileText,
  LineChart,
  BarChart3,
  AlertTriangle,
  Workflow,
  CheckSquare,
  ShieldCheck,
  History,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';

export type WorkspaceModuleId =
  | 'overview'
  | 'search'
  | 'command'
  | 'knowledge'
  | 'documents'
  | 'analytics'
  | 'dashboards'
  | 'problems'
  | 'workflows'
  | 'actions'
  | 'evidence'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentWorkspace: WorkspaceItem;
  activeModule: WorkspaceModuleId;
  onSelectModule: (moduleId: WorkspaceModuleId) => void;
  onBackToHub: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWorkspace,
  activeModule,
  onSelectModule,
  onBackToHub,
  isCollapsed,
  onToggleCollapse,
}) => {
  const modules: { id: WorkspaceModuleId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'search', label: 'Global Search', icon: <Search size={18} /> },
    { id: 'command', label: 'Command Center', icon: <Bot size={18} /> },
    { id: 'knowledge', label: 'Knowledge Graph', icon: <BrainCircuit size={18} /> },
    { id: 'documents', label: 'Documents & Data', icon: <FileText size={18} />, badge: currentWorkspace.documentCount },
    { id: 'analytics', label: 'Analytics Engine', icon: <LineChart size={18} /> },
    { id: 'dashboards', label: 'Dashboards', icon: <BarChart3 size={18} />, badge: currentWorkspace.dashboardCount },
    { id: 'problems', label: 'Problem Resolution', icon: <AlertTriangle size={18} /> },
    { id: 'workflows', label: 'Workflows & Automation', icon: <Workflow size={18} /> },
    { id: 'actions', label: 'Governed Actions', icon: <CheckSquare size={18} />, badge: currentWorkspace.pendingActionCount },
    { id: 'evidence', label: 'Evidence Explorer', icon: <ShieldCheck size={18} /> },
    { id: 'audit', label: 'Audit Trail', icon: <History size={18} /> },
    { id: 'settings', label: 'Domain Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className={`ds-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Workspace Navigation">
      {/* Top Header: Return to Hub & Active Workspace Title */}
      <div className="sidebar-header">
        <button type="button" onClick={onBackToHub} className="sidebar-back-btn" title="Return to Workspace Hub">
          <ArrowLeft size={16} />
          {!isCollapsed && <span>Workspace Hub</span>}
        </button>

        {!isCollapsed && (
          <div className="active-workspace-badge-box">
            <span className="domain-dot" style={{ backgroundColor: currentWorkspace.colorAccent }} />
            <div className="ws-text-wrapper">
              <span className="ws-domain-type">{currentWorkspace.domain} Boundary</span>
              <h3 className="ws-title-name">{currentWorkspace.name}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav-list">
        {modules.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectModule(mod.id)}
              title={isCollapsed ? mod.label : undefined}
            >
              <div className="nav-item-icon">{mod.icon}</div>
              {!isCollapsed && <span className="nav-item-label">{mod.label}</span>}
              {!isCollapsed && mod.badge && mod.badge > 0 ? (
                <span className={`nav-item-badge ${mod.id === 'actions' ? 'pending-alert' : ''}`}>
                  {mod.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="sidebar-footer">
        <button type="button" onClick={onToggleCollapse} className="collapse-toggle-btn">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
