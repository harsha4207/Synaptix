import React from 'react';
import { User, Shield, Sliders, ArrowLeft, ChevronRight } from 'lucide-react';
import { UserProfileInfo } from '../../types/workspace';
import { TopNavigation } from '../TopNavigation';
import { NotificationItem } from '../../types/notification';
import { WorkspaceModuleId } from '../../design-system/components/Sidebar';

export type SettingsTab = 'profile' | 'security' | 'preferences';

interface SettingsLayoutProps {
  currentTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
  onBackToHub: () => void;
  onBack?: () => void;
  backLabel?: string;
  user: UserProfileInfo;
  onSignOut: () => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onOpenNotificationTarget?: (workspaceId: string, targetModule: WorkspaceModuleId, title: string) => void;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  currentTab,
  onSelectTab,
  onBackToHub,
  onBack,
  backLabel,
  user,
  onSignOut,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenNotificationTarget,
  children,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onBackToHub();
    }
  };

  return (
    <div className="settings-page-wrapper">
      {/* Global Header */}
      <TopNavigation
        user={user}
        onSignOut={onSignOut}
        onOpenSettings={(tab) => onSelectTab(tab)}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onOpenNotificationTarget={onOpenNotificationTarget}
      />

      <div className="settings-main-container">
        {/* Breadcrumb & Navigation Bar */}
        <div className="settings-header-banner">
          <div className="settings-breadcrumb-wrap">
            <button
              type="button"
              className="settings-back-btn"
              onClick={handleBack}
              title={backLabel || "Return to Workspace Hub"}
            >
              <ArrowLeft size={16} />
              <span>{backLabel || "Back to Workspace Hub"}</span>
            </button>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">
              {currentTab === 'profile'
                ? 'Profile Settings'
                : currentTab === 'security'
                ? 'Accounts & Security'
                : 'System Preferences'}
            </span>
          </div>

          <div className="settings-title-section">
            <h1 className="settings-main-title">
              {currentTab === 'profile'
                ? 'Profile & Identity'
                : currentTab === 'security'
                ? 'Accounts & Security'
                : 'System Preferences'}
            </h1>
            <p className="settings-main-desc">
              {currentTab === 'profile'
                ? 'Configure your persona, verified contact channels, and domain boundary presence.'
                : currentTab === 'security'
                ? 'Manage credentials, two-factor authentication, active workspace sessions, and security telemetry.'
                : 'Configure platform visual theme, display density, dashboard sections, and notification rules.'}
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="settings-content-grid">
          {/* Left Navigation Sidebar */}
          <aside className="settings-nav-sidebar" aria-label="Settings navigation">
            <nav className="settings-nav-menu">
              <button
                type="button"
                className={`settings-nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                onClick={() => onSelectTab('profile')}
              >
                <div className="nav-item-icon-title">
                  <User size={18} />
                  <span>Profile Settings</span>
                </div>
                <ChevronRight size={14} className="nav-arrow" />
              </button>

              <button
                type="button"
                className={`settings-nav-item ${currentTab === 'security' ? 'active' : ''}`}
                onClick={() => onSelectTab('security')}
              >
                <div className="nav-item-icon-title">
                  <Shield size={18} />
                  <span>Accounts & Security</span>
                </div>
                <ChevronRight size={14} className="nav-arrow" />
              </button>

              <button
                type="button"
                className={`settings-nav-item ${currentTab === 'preferences' ? 'active' : ''}`}
                onClick={() => onSelectTab('preferences')}
              >
                <div className="nav-item-icon-title">
                  <Sliders size={18} />
                  <span>Preferences</span>
                </div>
                <ChevronRight size={14} className="nav-arrow" />
              </button>
            </nav>

            <div className="settings-sidebar-card">
              <div className="sidebar-card-title">Synaptix Security Shield</div>
              <p className="sidebar-card-text">
                Your enterprise workspace session is encrypted under AES-256 GCM.
              </p>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="settings-body-panel" role="region" aria-label="Settings content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
