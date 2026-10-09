import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/auth';
import { Toast, ToastMessage } from './components/Toast';
import { HomePage } from './components/HomePage';
import { WorkspaceItem } from './types/workspace';
import { INITIAL_WORKSPACES } from './data/mockWorkspaces';

// Design System Components
import { AppShell } from './design-system/components/AppShell';
import { WorkspaceModuleId } from './design-system/components/Sidebar';
import { CommandModule } from './modules/CommandModule';
import { DocumentsModule } from './modules/DocumentsModule';
import { KnowledgeModule } from './modules/KnowledgeModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { DashboardsModule } from './modules/DashboardsModule';
import { ProblemsModule } from './modules/ProblemsModule';
import { WorkflowsModule } from './modules/WorkflowsModule';
import { ActionsModule } from './modules/ActionsModule';
import { EvidenceModule } from './modules/EvidenceModule';
import { AuditModule } from './modules/AuditModule';
import { SettingsModule } from './modules/SettingsModule';
import { GlobalSearchModule } from './modules/GlobalSearchModule';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { SearchResultItem } from './types/search';
import { GenericWorkspaceModule } from './modules/GenericWorkspaceModule';
import { WorkspaceOverviewScreen } from './components/WorkspaceOverviewScreen';

import { INITIAL_NOTIFICATIONS } from './data/mockNotifications';
import { NotificationItem } from './types/notification';

export const App: React.FC = () => {
  // Navigation View State: 'auth' | 'home' | 'workspace'
  const [viewState, setViewState] = useState<'auth' | 'home' | 'workspace'>('auth');
  const [authenticatedUserEmail, setAuthenticatedUserEmail] = useState('');
  
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(INITIAL_WORKSPACES);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceItem | null>(null);
  const [activeModule, setActiveModule] = useState<WorkspaceModuleId>('overview');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Marked all notifications as read');
  };

  const handleOpenNotificationTarget = (wsId: string, targetModule: WorkspaceModuleId, title: string) => {
    const targetWs = workspaces.find((w) => w.id === wsId) || selectedWorkspace;
    if (targetWs) {
      setSelectedWorkspace(targetWs);
      setViewState('workspace');
    }
    setActiveModule(targetModule);
    addToast(`Opened notification: ${title}`);
  };

  // Global Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (text: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSuccessAuth = (email: string, mode: 'login' | 'signup') => {
    setAuthenticatedUserEmail(email);
    addToast(mode === 'login' ? 'Successfully signed in to Synaptix Command' : 'Enterprise account created successfully');
    setViewState('home');
  };

  const handleGoogleAuth = () => {
    const demoEmail = 'alex.vance@enterprise.com';
    setAuthenticatedUserEmail(demoEmail);
    addToast('Authenticated with Google Enterprise SSO');
    setViewState('home');
  };

  const handleSelectWorkspace = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId) || {
      id: workspaceId,
      name: workspaceId.charAt(0).toUpperCase() + workspaceId.slice(1),
      domain: 'Custom' as const,
      description: 'Custom enterprise intelligence domain',
      iconName: 'FolderPlus',
      documentCount: 42,
      datasetCount: 5,
      dashboardCount: 2,
      lastActivity: 'Active workspace session',
      lastActivityTime: 'Just now',
      colorAccent: '#1769E0',
      isAuthorized: true,
    };

    setSelectedWorkspace(ws);
    setActiveModule('overview');
    setViewState('workspace');
    addToast(`Selected ${ws.name} Workspace Boundary`);
  };

  const handleCreateWorkspace = (newWs: WorkspaceItem) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    addToast(`Created workspace: ${newWs.name}`);
  };

  const handleSignOut = () => {
    setViewState('auth');
    setAuthenticatedUserEmail('');
    setSelectedWorkspace(null);
    addToast('Signed out of Synaptix Command');
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    const targetWs = workspaces.find((w) => w.id === item.workspaceId) || selectedWorkspace;
    if (targetWs) {
      setSelectedWorkspace(targetWs);
      setViewState('workspace');
    }
    setActiveModule(item.targetModule);
    addToast(`Opened ${item.type.toUpperCase()}: ${item.title} (${item.workspaceName} Workspace)`);
  };

  // Render module content inside AppShell for active workspace
  const renderWorkspaceModuleContent = () => {
    if (!selectedWorkspace) return null;

    switch (activeModule) {
      case 'overview':
        return (
          <WorkspaceOverviewScreen
            workspace={selectedWorkspace}
            onBackToHub={() => setViewState('home')}
            onSelectModule={(mod) => setActiveModule(mod)}
            onAddToast={addToast}
          />
        );
      case 'search':
        return (
          <GlobalSearchModule
            workspace={selectedWorkspace}
            allWorkspaces={workspaces}
            onAddToast={addToast}
            onNavigateToResult={(wsId, modId, title) => {
              const targetWs = workspaces.find((w) => w.id === wsId) || selectedWorkspace;
              if (targetWs) setSelectedWorkspace(targetWs);
              setActiveModule(modId);
              addToast(`Opened: ${title}`);
            }}
          />
        );
      case 'command':
        return <CommandModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'documents':
        return <DocumentsModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'knowledge':
        return <KnowledgeModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'analytics':
        return <AnalyticsModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'dashboards':
        return <DashboardsModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'problems':
        return (
          <ProblemsModule
            workspace={selectedWorkspace}
            onAddToast={addToast}
            onSelectModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'workflows':
        return <WorkflowsModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'actions':
        return <ActionsModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'evidence':
        return <EvidenceModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'audit':
        return <AuditModule workspace={selectedWorkspace} onAddToast={addToast} />;
      case 'settings':
        return <SettingsModule workspace={selectedWorkspace} onAddToast={addToast} />;
      default:
        return <GenericWorkspaceModule workspace={selectedWorkspace} moduleId={activeModule} onAddToast={addToast} />;
    }
  };

  return (
    <>
      {/* 1. AUTHENTICATION LANDING PAGE VIEW */}
      {viewState === 'auth' && (
        <AuthPage
          onSuccessAuth={handleSuccessAuth}
          onGoogleAuth={handleGoogleAuth}
          onAddToast={addToast}
        />
      )}

      {/* 2. POST-LOGIN HOMEPAGE VIEW (SYNAPTIX COMMAND Workspace Hub) */}
      {viewState === 'home' && (
        <HomePage
          userEmail={authenticatedUserEmail || 'alex.vance@enterprise.com'}
          onSignOut={handleSignOut}
          onSelectWorkspace={handleSelectWorkspace}
          onAddToast={addToast}
        />
      )}

      {/* 3. WORKSPACE SHELL VIEW (/workspace/[workspaceId]/[module]) */}
      {viewState === 'workspace' && selectedWorkspace && (
        <AppShell
          currentWorkspace={selectedWorkspace}
          allWorkspaces={workspaces}
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            addToast(`${selectedWorkspace.name} → ${mod.toUpperCase()}`);
          }}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onBackToHub={() => setViewState('home')}
          onSignOut={handleSignOut}
          userEmail={authenticatedUserEmail || 'alex.vance@enterprise.com'}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onOpenNotificationTarget={handleOpenNotificationTarget}
        >
          {renderWorkspaceModuleContent()}
        </AppShell>
      )}

      {/* Global Search Modal overlay across all workspace screens */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        workspaces={workspaces}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Toast Notifications across all states */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
};

export default App;
