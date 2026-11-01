import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  LineChart,
  AlertTriangle,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  FileText,
  Workflow,
  Cpu,
  Layers,
  TrendingUp,
  Sliders,
  ArrowRight,
  Filter,
  Check,
  Zap,
  Server
} from 'lucide-react';
import { WorkspaceItem, UserProfileInfo } from '../types/workspace';
import { AnalyticsModule, AnalysisSectionTab } from './AnalyticsModule';
import { DashboardsModule } from './DashboardsModule';
import { ProblemsModule, ProblemCategoryTab } from './ProblemsModule';
import { DashboardPage } from '../components/dashboard/DashboardPage';

interface UnifiedDashboardModuleProps {
  workspace: WorkspaceItem;
  currentUser?: UserProfileInfo;
  userEmail?: string;
  onAddToast: (msg: string) => void;
  activeView?: 'overview' | 'analytics' | 'dashboards' | 'problems';
  onViewChange?: (view: 'overview' | 'analytics' | 'dashboards' | 'problems') => void;
  analyticsSubTab?: AnalysisSectionTab;
  onAnalyticsSubTabChange?: (tab: AnalysisSectionTab) => void;
  problemsSubTab?: ProblemCategoryTab;
  onProblemsSubTabChange?: (tab: ProblemCategoryTab) => void;
  onSelectModule?: (modId: any) => void;
}

export const UnifiedDashboardModule: React.FC<UnifiedDashboardModuleProps> = ({
  workspace,
  currentUser,
  userEmail,
  onAddToast,
  activeView = 'overview',
  onViewChange,
  analyticsSubTab,
  onAnalyticsSubTabChange,
  problemsSubTab,
  onProblemsSubTabChange,
  onSelectModule,
}) => {
  const [currentView, setCurrentView] = useState<'overview' | 'analytics' | 'dashboards' | 'problems'>(activeView);

  useEffect(() => {
    if (activeView) {
      setCurrentView(activeView);
    }
  }, [activeView]);

  const handleSwitchView = (view: 'overview' | 'analytics' | 'dashboards' | 'problems') => {
    setCurrentView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#F7F9FC' }}>
      {/* 1. TOP SUB-NAVIGATION TABS */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => handleSwitchView('overview')}
            style={{
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: currentView === 'overview' ? 600 : 500,
              color: currentView === 'overview' ? '#1769E0' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: currentView === 'overview' ? '2px solid #1769E0' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 140ms ease',
            }}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchView('analytics')}
            style={{
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: currentView === 'analytics' ? 600 : 500,
              color: currentView === 'analytics' ? '#1769E0' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: currentView === 'analytics' ? '2px solid #1769E0' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 140ms ease',
            }}
          >
            <LineChart size={15} />
            <span>Analytics & BI Engine</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchView('dashboards')}
            style={{
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: currentView === 'dashboards' ? 600 : 500,
              color: currentView === 'dashboards' ? '#1769E0' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: currentView === 'dashboards' ? '2px solid #1769E0' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 140ms ease',
            }}
          >
            <BarChart3 size={15} />
            <span>Custom Dashboards</span>
            {workspace.dashboardCount > 0 && (
              <span style={{ fontSize: '10px', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px', color: '#64748B' }}>
                {workspace.dashboardCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSwitchView('problems')}
            style={{
              padding: '14px 16px',
              fontSize: '13px',
              fontWeight: currentView === 'problems' ? 600 : 500,
              color: currentView === 'problems' ? '#DC2626' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: currentView === 'problems' ? '2px solid #DC2626' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 140ms ease',
            }}
          >
            <AlertTriangle size={15} style={{ color: currentView === 'problems' ? '#DC2626' : '#D97706' }} />
            <span>Alerts & Issues</span>
            <span style={{ fontSize: '10px', background: '#FEF2F2', color: '#DC2626', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
              {workspace.pendingActionCount ? workspace.pendingActionCount + 1 : 2}
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              color: '#059669',
              background: '#ECFDF5',
              padding: '3px 8px',
              borderRadius: '999px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #A7F3D0',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
            Strict Boundary Isolated
          </span>
        </div>
      </div>

      {/* 2. TAB CONTENT VIEW */}
      <div style={{ flex: 1 }}>
        {/* VIEW 1: CLEAN ENTERPRISE INTELLIGENCE DASHBOARD (Sections A-G) */}
        {currentView === 'overview' && (
          <DashboardPage
            workspace={workspace}
            currentUser={currentUser}
            userEmail={userEmail}
            onSelectModule={onSelectModule}
            onAddToast={onAddToast}
            onViewChange={handleSwitchView}
          />
        )}

        {/* VIEW 2: FULL ANALYTICS ENGINE */}
        {currentView === 'analytics' && (
          <AnalyticsModule
            workspace={workspace}
            onAddToast={onAddToast}
            activeSubTab={analyticsSubTab}
            onSubTabChange={onAnalyticsSubTabChange}
          />
        )}

        {/* VIEW 3: CUSTOM DASHBOARDS CANVAS */}
        {currentView === 'dashboards' && (
          <DashboardsModule workspace={workspace} onAddToast={onAddToast} />
        )}

        {/* VIEW 4: PROBLEM RESOLUTION & ALERTS */}
        {currentView === 'problems' && (
          <ProblemsModule
            workspace={workspace}
            onAddToast={onAddToast}
            activeSubTab={problemsSubTab}
            onSubTabChange={onProblemsSubTabChange}
            onSelectModule={onSelectModule}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedDashboardModule;
