import React, { useState, useRef } from 'react';
import { TopNavigation } from './TopNavigation';
import { HeroCommandArea } from './HeroCommandArea';
import { WorkspaceGrid } from './WorkspaceGrid';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { RecentActivitySection } from './RecentActivitySection';
import { QuickActionsSection } from './QuickActionsSection';
import { WorkspaceItem, RecentActivityItem, UserProfileInfo } from '../types/workspace';
import { NotificationItem } from '../types/notification';
import { WorkspaceModuleId } from '../design-system/components/Sidebar';
import { INITIAL_WORKSPACES, INITIAL_RECENT_ACTIVITIES } from '../data/mockWorkspaces';
import { UserPreferences } from '../types/preferences';

interface HomePageProps {
  userEmail: string;
  currentUser?: UserProfileInfo;
  preferences?: UserPreferences;
  onSignOut: () => void;
  onSelectWorkspace: (workspaceId: string) => void;
  onAddToast: (msg: string) => void;
  onOpenSettings?: (tab: 'profile' | 'security' | 'preferences') => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onOpenNotificationTarget?: (workspaceId: string, targetModule: WorkspaceModuleId, title: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userEmail,
  currentUser: propUser,
  preferences,
  onSignOut,
  onSelectWorkspace,
  onAddToast,
  onOpenSettings,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenNotificationTarget,
}) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(INITIAL_WORKSPACES);
  const [activities, setActivities] = useState<RecentActivityItem[]>(INITIAL_RECENT_ACTIVITIES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [highlightedWorkspaceId, setHighlightedWorkspaceId] = useState<string | null>(null);
  const [isolationNotice, setIsolationNotice] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const commandInputRef = useRef<HTMLInputElement>(null);

  const currentUser: UserProfileInfo = propUser || {
    name: userEmail ? userEmail.split('@')[0].replace('.', ' ') : 'Enterprise Admin',
    email: userEmail || 'admin@company.com',
    role: 'Enterprise Administrator',
    organization: 'SYNAPTIX COMMAND',
  };

  // Filter authorized workspaces based on global search
  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.isAuthorized &&
      (ws.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ws.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  // Command submission handler
  const handleCommandSubmitted = (commandText: string) => {
    // Check if command is domain-specific before workspace selection
    const textLower = commandText.toLowerCase();
    let detectedWsId: string | null = null;

    if (textLower.includes('revenue') || textLower.includes('financial') || textLower.includes('cash flow') || textLower.includes('auditing')) {
      detectedWsId = 'finance';
    } else if (textLower.includes('research') || textLower.includes('trial') || textLower.includes('paper') || textLower.includes('literature')) {
      detectedWsId = 'research';
    } else if (textLower.includes('health') || textLower.includes('patient') || textLower.includes('clinical') || textLower.includes('hipaa')) {
      detectedWsId = 'healthcare';
    } else if (textLower.includes('education') || textLower.includes('learning') || textLower.includes('student') || textLower.includes('curriculum')) {
      detectedWsId = 'education';
    } else if (textLower.includes('business') || textLower.includes('market') || textLower.includes('strategy') || textLower.includes('competitor')) {
      detectedWsId = 'business';
    }

    if (detectedWsId) {
      setIsolationNotice(`Your command "${commandText.substring(0, 35)}..." requires domain context. Please select the appropriate workspace to continue.`);
      setHighlightedWorkspaceId(detectedWsId);
      onAddToast('Select a workspace to continue your command');
      
      // Auto-scroll gently to workspaces section
      const wsSection = document.querySelector('.workspaces-section');
      if (wsSection) {
        wsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setIsolationNotice(`Select a workspace to execute: "${commandText.substring(0, 40)}..."`);
      onAddToast('Select a workspace to continue');
    }
  };

  // Create Workspace handler
  const handleCreateWorkspace = (newWs: WorkspaceItem) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    onAddToast(`Created new workspace: ${newWs.name}`);

    // Add activity
    const newAct: RecentActivityItem = {
      id: `act-${Date.now()}`,
      workspaceId: newWs.id,
      workspaceName: newWs.name,
      domain: newWs.domain,
      activityType: 'Workspace Created',
      description: `Domain boundary created for ${newWs.name}`,
      timestamp: 'Just now',
      status: 'completed',
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleFocusCommandInput = () => {
    if (commandInputRef.current) {
      commandInputRef.current.focus();
      commandInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleUploadDataClick = () => {
    setIsolationNotice('Data upload requires a target workspace boundary. Select a workspace to upload documents.');
    onAddToast('Select a workspace to upload data');
    const wsSection = document.querySelector('.workspaces-section');
    if (wsSection) {
      wsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-hub-page">
      {/* 1. Global Top Navigation */}
      <TopNavigation
        user={currentUser}
        onSignOut={onSignOut}
        onSearchQuery={setSearchFilter}
        onFocusCommandInput={handleFocusCommandInput}
        onOpenSettings={onOpenSettings}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onOpenNotificationTarget={onOpenNotificationTarget}
      />

      {/* Main Content Body */}
      <main className="home-main-container">
        {/* 2. Hero / Command Area */}
        <HeroCommandArea
          ref={commandInputRef}
          onCommandSubmitted={handleCommandSubmitted}
          isolationNotice={isolationNotice}
          onClearIsolationNotice={() => {
            setIsolationNotice(null);
            setHighlightedWorkspaceId(null);
          }}
        />

        {/* 3. Your Workspaces & 4. Create Workspace Action (Three cards per row) */}
        <WorkspaceGrid
          workspaces={filteredWorkspaces}
          highlightedWorkspaceId={highlightedWorkspaceId}
          onSelectWorkspace={onSelectWorkspace}
          onCreateWorkspaceClick={() => setIsCreateModalOpen(true)}
          showWorkspaceMetadata={preferences ? preferences.showWorkspaceMetadata : true}
        />

        {/* 5. Recent Activity — Full-Width Section (Controlled by preferences) */}
        {(!preferences || preferences.showRecentActivity) && (
          <section className="home-recent-activity-wrapper" aria-label="Recent Activity Section">
            <RecentActivitySection
              activities={activities}
              onSelectWorkspace={onSelectWorkspace}
            />
          </section>
        )}

        {/* 6. Quick Actions — Compact Horizontal Bar Centered Below Recent Activity (Controlled by preferences) */}
        {(!preferences || preferences.showQuickActions) && (
          <div className="home-quick-actions-wrapper">
            <QuickActionsSection
              onFocusCommandInput={handleFocusCommandInput}
              onUploadDataClick={handleUploadDataClick}
              onCreateWorkspaceClick={() => setIsCreateModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* 7. Refined Enterprise Footer */}
      <footer className="home-minimal-footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-left-group">
            <span className="footer-brand-title">SYNAPTIX COMMAND</span>
            <span className="footer-version-tag">v2.4</span>
            <span className="footer-separator">•</span>
            <span className="footer-compliance-text">Enterprise Security SAML 2.0 Compliant</span>
          </div>

          <div className="footer-links-group">
            <a href="#docs" className="footer-link" onClick={(e) => { e.preventDefault(); onAddToast('Documentation loaded'); }}>Documentation</a>
            <span className="footer-separator">•</span>
            <a href="#help" className="footer-link" onClick={(e) => { e.preventDefault(); onAddToast('Support desk connected'); }}>Help</a>
            <span className="footer-separator">•</span>
            <a href="#privacy" className="footer-link" onClick={(e) => { e.preventDefault(); onAddToast('Security & Privacy policy verified'); }}>Privacy</a>
          </div>

          <div className="footer-status-group">
            <span className="footer-live-dot" aria-hidden="true" />
            <span className="footer-status-tag">System Operational • All Engines Active</span>
          </div>
        </div>
      </footer>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </div>
  );
};
