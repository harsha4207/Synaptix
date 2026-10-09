import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, ChevronDown, Sliders, User, Shield } from 'lucide-react';
import { UserProfileInfo } from '../types/workspace';
import { NotificationItem } from '../types/notification';
import { WorkspaceModuleId } from '../design-system/components/Sidebar';
import { NotificationPanel } from './notifications/NotificationPanel';

import { SynaptixLogo } from './ui/SynaptixLogo';

interface TopNavigationProps {
  user: UserProfileInfo;
  onSignOut: () => void;
  onSearchQuery?: (query: string) => void;
  onFocusCommandInput?: () => void;
  onOpenSearchModal?: () => void;
  onOpenSettings?: (tab: 'profile' | 'security' | 'preferences') => void;
  notifications?: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onOpenNotificationTarget?: (workspaceId: string, targetModule: WorkspaceModuleId, title: string) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  user,
  onSignOut,
  onSearchQuery,
  onFocusCommandInput,
  onOpenSearchModal,
  onOpenSettings,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onOpenNotificationTarget = () => {},
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchQuery) {
      onSearchQuery(e.target.value);
    }
  };

  return (
    <header className="global-top-navbar" role="banner">
      <div className="navbar-container">
        {/* Left: Brand Identity */}
        <div className="navbar-brand-wrapper">
          <SynaptixLogo size="sm" />
          <span className="navbar-brand-tag">WORKSPACE HUB</span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="navbar-search-wrapper">
          <div
            className="global-search-input-box"
            onClick={() => searchInputRef.current?.focus()}
          >
            <Search className="search-icon" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchVal}
              onChange={handleGlobalSearchChange}
              placeholder="Search Synaptix... (⌘K)"
              className="global-search-input"
              aria-label="Search Synaptix workspaces"
            />
            <kbd
              className="search-kbd-shortcut"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenSearchModal) {
                  onOpenSearchModal();
                } else {
                  searchInputRef.current?.focus();
                }
              }}
              title="Press ⌘K or Ctrl+K to search"
            >
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="navbar-actions-wrapper">
          {/* System Status Indicator */}
          <div className="system-live-pill" title="All reasoning engines operational">
            <span className="status-dot-green"></span>
            <span className="system-pill-text">System Active</span>
          </div>

          {/* Notifications Center */}
          <div className="notifications-dropdown-container" ref={notifRef}>
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              title="Notifications Center"
            >
              <Bell size={18} />
              {notifications.some((n) => !n.read) && <span className="notification-badge-dot" />}
            </button>

            <NotificationPanel
              notifications={notifications}
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onOpenNotificationTarget={onOpenNotificationTarget}
            />
          </div>

          {/* User Profile Menu */}
          <div className="profile-menu-container" ref={menuRef}>
            <button
              type="button"
              className="profile-trigger-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-expanded={isProfileMenuOpen}
            >
              <div className="user-avatar-circle">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User'} className="avatar-img-fit" />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                )}
              </div>
              <div className="user-info-text">
                <span className="user-name">{user.name || 'Enterprise Admin'}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <ChevronDown size={14} className={`chevron-icon ${isProfileMenuOpen ? 'rotated' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="dropdown-panel profile-panel">
                <div className="profile-panel-header">
                  <div className="profile-panel-summary">
                    <div className="user-avatar-circle small">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name || 'User'} className="avatar-img-fit" />
                      ) : (
                        <span>{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
                      )}
                    </div>
                    <div className="profile-summary-details">
                      <p className="profile-header-name">{user.name || 'Enterprise Administrator'}</p>
                      <p className="profile-header-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="profile-header-meta">
                    <span className="profile-header-role">{user.role}</span>
                    <span className="profile-header-org">{user.organization}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <div className="profile-menu-options">
                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSettings?.('profile');
                    }}
                  >
                    <User size={15} />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSettings?.('security');
                    }}
                  >
                    <Shield size={15} />
                    <span>Accounts & Security</span>
                  </button>

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSettings?.('preferences');
                    }}
                  >
                    <Sliders size={15} />
                    <span>Preferences</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="profile-menu-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onFocusCommandInput?.();
                    }}
                  >
                    <Search size={15} />
                    <span>Focus Command Center</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="profile-menu-item danger"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
