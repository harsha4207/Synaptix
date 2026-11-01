import React, { useState, useEffect } from 'react';
import { Sidebar, WorkspaceModuleId } from './Sidebar';
import { WorkspaceItem, UserProfileInfo } from '../../types/workspace';
import { TopNavigation } from '../../components/TopNavigation';
import { CreateWorkspaceModal } from '../../components/CreateWorkspaceModal';
import { NotificationItem } from '../../types/notification';
import { ShieldCheck, Menu } from 'lucide-react';

interface AppShellProps {
  currentWorkspace: WorkspaceItem;
  allWorkspaces: WorkspaceItem[];
  activeModule: WorkspaceModuleId;
  onSelectModule: (moduleId: WorkspaceModuleId) => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (newWs: WorkspaceItem) => void;
  onBackToHub: () => void;
  onSignOut: () => void;
  userEmail: string;
  currentUser?: UserProfileInfo;
  onOpenSettings?: (tab: 'profile' | 'security' | 'preferences') => void;
  onOpenSearchModal?: () => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onOpenNotificationTarget?: (workspaceId: string, targetModule: WorkspaceModuleId, title: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentWorkspace,
  allWorkspaces,
  activeModule,
  onSelectModule,
  onSelectWorkspace,
  onCreateWorkspace,
  onBackToHub,
  onSignOut,
  userEmail,
  currentUser: propUser,
  onOpenSettings,
  onOpenSearchModal,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenNotificationTarget,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileScreen(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user: UserProfileInfo = propUser || {
    name: userEmail ? userEmail.split('@')[0].replace('.', ' ') : 'Enterprise Admin',
    email: userEmail || 'admin@company.com',
    role: 'Enterprise Administrator',
    organization: 'SYNAPTIX COMMAND',
  };

  const getPageTitle = (mod: WorkspaceModuleId): string => {
    switch (mod) {
      case 'chat':
      case 'command':
        return 'Chat';
      case 'data':
      case 'documents':
        return 'Uploads & Data';
      case 'dashboard':
      case 'overview':
      case 'analytics':
      case 'dashboards':
      case 'problems':
        return 'Dashboard';
      case 'workflows':
      case 'actions':
        return 'Agent Workflows';
      case 'settings':
      case 'audit':
        return 'Workspace Settings';
      case 'search':
        return 'Search';
      default:
        return 'Workspace';
    }
  };

  return (
    <div className="ds-app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F7F9FC' }}>
      {/* Global Top Navbar */}
      <header
        className="shell-top-nav"
        style={{
          height: '56px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Left: Mobile hamburger menu & active workspace context */}
        <div className="shell-nav-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isMobileScreen && (
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label="Toggle navigation menu"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Menu size={16} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: '#64748B', fontWeight: 500 }}>{currentWorkspace.name}</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#0F172A' }}>{getPageTitle(activeModule)}</span>
          </div>

          {!isMobileScreen && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#059669',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={11} />
              Boundary Enforced
            </span>
          )}
        </div>

        {/* Right: Search shortcut, notifications, voice trigger, user profile */}
        <div className="shell-nav-right">
          <TopNavigation
            user={user}
            onSignOut={onSignOut}
            onOpenSettings={onOpenSettings}
            onOpenSearchModal={onOpenSearchModal}
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onOpenNotificationTarget={onOpenNotificationTarget}
            hideLogo={true}
          />
        </div>
      </header>

      {/* Mobile Backdrop when Sidebar Drawer is open */}
      {isMobileScreen && !isSidebarCollapsed && (
        <div
          onClick={() => setIsSidebarCollapsed(true)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 31, 58, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 110,
          }}
        />
      )}

      {/* Main Layout Area: Compact Sidebar + Dynamic Content */}
      <div className="shell-body" style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 56px)', position: 'relative' }}>
        <div
          style={
            isMobileScreen
              ? {
                  position: 'fixed',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 120,
                  display: isSidebarCollapsed ? 'none' : 'block',
                  boxShadow: '4px 0 24px rgba(11, 31, 58, 0.2)',
                  background: '#FFFFFF',
                }
              : undefined
          }
        >
          <Sidebar
            currentWorkspace={currentWorkspace}
            allWorkspaces={allWorkspaces}
            activeModule={activeModule}
            onSelectModule={(mod) => {
              if (isMobileScreen) {
                setIsSidebarCollapsed(true);
              }
              onSelectModule(mod);
            }}
            onSelectWorkspace={(wsId) => {
              if (isMobileScreen) {
                setIsSidebarCollapsed(true);
              }
              if (onSelectWorkspace) onSelectWorkspace(wsId);
            }}
            onCreateWorkspace={() => setIsCreateModalOpen(true)}
            onBackToHub={() => {
              if (isMobileScreen) {
                setIsSidebarCollapsed(true);
              }
              onBackToHub();
            }}
            onOpenSettings={(tab) => {
              if (isMobileScreen) {
                setIsSidebarCollapsed(true);
              }
              if (onOpenSettings) onOpenSettings(tab);
            }}
            onSignOut={onSignOut}
            currentUser={user}
            isCollapsed={isMobileScreen ? false : isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Dynamic Content View Area */}
        <main
          className="shell-content-view"
          role="main"
          style={{
            flex: 1,
            minWidth: 0,
            overflowX: 'hidden',
            overflowY: activeModule === 'chat' || activeModule === 'command' ? 'hidden' : 'auto',
            backgroundColor: '#F7F9FC',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 56px)',
          }}
        >
          {children}
        </main>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateWorkspace={onCreateWorkspace}
      />
    </div>
  );
};
