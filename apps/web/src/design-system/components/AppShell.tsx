import React, { useState } from 'react';
import { Sidebar, WorkspaceModuleId } from './Sidebar';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { WorkspaceItem, UserProfileInfo } from '../../types/workspace';
import { TopNavigation } from '../../components/TopNavigation';
import { CreateWorkspaceModal } from '../../components/CreateWorkspaceModal';
import { SynaptixLogo } from '../../components/ui/SynaptixLogo';
import { NotificationItem } from '../../types/notification';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const user: UserProfileInfo = propUser || {
    name: userEmail ? userEmail.split('@')[0].replace('.', ' ') : 'Enterprise Admin',
    email: userEmail || 'admin@company.com',
    role: 'Enterprise Administrator',
    organization: 'SYNAPTIX COMMAND',
  };

  return (
    <div className="ds-app-shell">
      {/* Global Navbar */}
      <header className="shell-top-nav">
        <div className="shell-nav-left">
          <SynaptixLogo size="sm" />

          {/* Workspace Switcher */}
          <WorkspaceSwitcher
            currentWorkspace={currentWorkspace}
            workspaces={allWorkspaces}
            onSelectWorkspace={onSelectWorkspace}
            onCreateWorkspaceClick={() => setIsCreateModalOpen(true)}
          />
        </div>

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
          />
        </div>
      </header>

      {/* Main Layout Area: Sidebar + Content */}
      <div className="shell-body">
        <Sidebar
          currentWorkspace={currentWorkspace}
          activeModule={activeModule}
          onSelectModule={onSelectModule}
          onBackToHub={onBackToHub}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Workspace Module Content View */}
        <main className="shell-content-view" role="main">
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
