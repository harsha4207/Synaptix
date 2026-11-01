import React from 'react';
import {
  MessageSquare,
  Database,
  LayoutDashboard,
  Workflow,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  User,
  Shield,
  Sliders,
  LogOut,
  FolderPlus
} from 'lucide-react';
import { WorkspaceItem, UserProfileInfo } from '../../types/workspace';
import { Tooltip } from '../../components/ui/Tooltip';
import { SynaptixLogo } from '../../components/ui/SynaptixLogo';

export type WorkspaceModuleId =
  | 'chat'
  | 'data'
  | 'dashboard'
  | 'workflows'
  // Backward compatibility aliases:
  | 'overview'
  | 'search'
  | 'command'
  | 'knowledge'
  | 'documents'
  | 'analytics'
  | 'dashboards'
  | 'problems'
  | 'actions'
  | 'evidence'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentWorkspace: WorkspaceItem;
  allWorkspaces?: WorkspaceItem[];
  activeModule: WorkspaceModuleId;
  onSelectModule: (moduleId: WorkspaceModuleId) => void;
  onSelectWorkspace?: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
  onBackToHub: () => void;
  onOpenSettings?: (tab?: 'profile' | 'security' | 'preferences') => void;
  onSignOut?: () => void;
  currentUser?: UserProfileInfo;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWorkspace,
  allWorkspaces = [],
  activeModule,
  onSelectModule,
  onSelectWorkspace,
  onCreateWorkspace,
  onBackToHub,
  onOpenSettings,
  onSignOut,
  currentUser,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [isWsDropdownOpen, setIsWsDropdownOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const wsDropdownRef = React.useRef<HTMLDivElement>(null);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setIsWsDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Determine active state mapped to the 4 primary destinations
  const isChatActive = activeModule === 'chat' || activeModule === 'command' || activeModule === 'evidence' || activeModule === 'knowledge';
  const isDataActive = activeModule === 'data' || activeModule === 'documents';
  const isDashboardActive = activeModule === 'dashboard' || activeModule === 'overview' || activeModule === 'analytics' || activeModule === 'dashboards' || activeModule === 'problems';
  const isWorkflowsActive = activeModule === 'workflows' || activeModule === 'actions';
  const isSettingsActive = activeModule === 'settings' || activeModule === 'audit';

  // EXACTLY FOUR PRIMARY NAVIGATION ITEMS
  const primaryNavItems: {
    id: WorkspaceModuleId;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    badge?: number;
  }[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare size={18} />,
      isActive: isChatActive,
    },
    {
      id: 'data',
      label: 'Uploads & Data',
      icon: <Database size={18} />,
      isActive: isDataActive,
      badge: currentWorkspace.documentCount > 0 ? currentWorkspace.documentCount : undefined,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      isActive: isDashboardActive,
      badge: currentWorkspace.dashboardCount > 0 ? currentWorkspace.dashboardCount : undefined,
    },
    {
      id: 'workflows',
      label: 'Agent Workflows',
      icon: <Workflow size={18} />,
      isActive: isWorkflowsActive,
      badge: currentWorkspace.pendingActionCount && currentWorkspace.pendingActionCount > 0 ? currentWorkspace.pendingActionCount : undefined,
    },
  ];

  return (
    <aside
      className={`ds-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Workspace Navigation"
      style={{
        width: isCollapsed ? '68px' : '230px',
        minWidth: isCollapsed ? '68px' : '230px',
        transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), min-width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* 1. BRAND HEADER & RETURN TO HUB */}
      <div className="sidebar-header" style={{ padding: isCollapsed ? '12px 8px' : '14px 14px 10px 14px' }}>
        {isCollapsed ? (
          <Tooltip content="Return to Workspace Hub" position="right">
            <button
              type="button"
              onClick={onBackToHub}
              className="sidebar-back-btn collapsed"
              aria-label="Workspace Hub"
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
            >
              <SynaptixLogo size="sm" showWordmark={false} />
            </button>
          </Tooltip>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={onBackToHub}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              title="Return to Workspace Hub"
            >
              <SynaptixLogo size="sm" />
            </button>
            <Tooltip content="Return to Workspace Hub" position="bottom">
              <button
                type="button"
                onClick={onBackToHub}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748B',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '3px 7px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={11} />
                <span>Hub</span>
              </button>
            </Tooltip>
          </div>
        )}

        {/* CURRENT WORKSPACE SELECTOR */}
        {!isCollapsed && (
          <div ref={wsDropdownRef} style={{ position: 'relative', width: '100%', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                textAlign: 'left',
              }}
              aria-label="Current Workspace"
              aria-expanded={isWsDropdownOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: currentWorkspace.colorAccent || '#1769E0',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentWorkspace.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', lineHeight: 1.1 }}>
                    {currentWorkspace.domain} Domain
                  </div>
                </div>
              </div>
              <ChevronDown size={13} style={{ color: '#94A3B8', transform: isWsDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            {/* Dropdown list of workspaces */}
            {isWsDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(11, 31, 58, 0.12)',
                  zIndex: 100,
                  padding: '4px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Switch Workspace
                </div>
                {allWorkspaces.map((ws) => {
                  const isCurrent = ws.id === currentWorkspace.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        setIsWsDropdownOpen(false);
                        if (onSelectWorkspace && !isCurrent) {
                          onSelectWorkspace(ws.id);
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: isCurrent ? '#EFF6FF' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: isCurrent ? 600 : 500,
                        color: isCurrent ? '#1769E0' : '#0F172A',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ws.colorAccent, flexShrink: 0 }} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</span>
                      {isCurrent && <span style={{ fontSize: '10px', color: '#1769E0', fontWeight: 700 }}>Active</span>}
                    </button>
                  );
                })}
                {onCreateWorkspace && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsWsDropdownOpen(false);
                      onCreateWorkspace();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      marginTop: '4px',
                      borderTop: '1px solid #F1F5F9',
                      background: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#1769E0',
                    }}
                  >
                    <FolderPlus size={13} />
                    <span>Create Workspace</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. FOUR PRIMARY NAVIGATION DESTINATIONS */}
      <nav className="sidebar-nav-list" style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {primaryNavItems.map((item) => {
          const navButton = (
            <button
              type="button"
              className={`sidebar-nav-item ${item.isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => onSelectModule(item.id)}
              aria-label={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: isCollapsed ? '10px' : '9px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: item.isActive ? 600 : 500,
                color: item.isActive ? '#1769E0' : '#475569',
                backgroundColor: item.isActive ? '#EFF6FF' : 'transparent',
                border: item.isActive ? '1px solid #DBEAFE' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                width: '100%',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
            >
              <div
                className="nav-item-icon"
                style={{
                  color: item.isActive ? '#1769E0' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              {!isCollapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
              {!isCollapsed && item.badge !== undefined && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    backgroundColor: item.isActive ? '#DBEAFE' : '#F1F5F9',
                    color: item.isActive ? '#1D4ED8' : '#64748B',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.id} content={item.label} position="right">
                {navButton}
              </Tooltip>
            );
          }

          return <React.Fragment key={item.id}>{navButton}</React.Fragment>;
        })}
      </nav>

      {/* 3. BOTTOM SECTION: WORKSPACE SETTINGS, USER PROFILE & COLLAPSE TOGGLE */}
      <div
        style={{
          padding: '8px 10px 10px 10px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: '#FAFAFC',
        }}
      >
        {/* Workspace Settings button */}
        {isCollapsed ? (
          <Tooltip content="Workspace Settings" position="right">
            <button
              type="button"
              onClick={() => onSelectModule('settings')}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: '8px',
                background: isSettingsActive ? '#EFF6FF' : 'transparent',
                border: 'none',
                color: isSettingsActive ? '#1769E0' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Workspace Settings"
            >
              <Settings size={18} />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={() => onSelectModule('settings')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: isSettingsActive ? '#EFF6FF' : 'transparent',
              border: isSettingsActive ? '1px solid #DBEAFE' : '1px solid transparent',
              color: isSettingsActive ? '#1769E0' : '#475569',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 120ms ease',
            }}
          >
            <Settings size={16} style={{ color: isSettingsActive ? '#1769E0' : '#64748B' }} />
            <span>Workspace Settings</span>
          </button>
        )}

        {/* User profile dropdown item */}
        {!isCollapsed && currentUser && (
          <div ref={profileMenuRef} style={{ position: 'relative', width: '100%' }}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              aria-expanded={isProfileMenuOpen}
              aria-label="User Profile Menu"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1769E0',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.role || 'Enterprise User'}
                </div>
              </div>
              <ChevronDown size={12} style={{ color: '#94A3B8' }} />
            </button>

            {/* Profile Popover Menu */}
            {isProfileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 -4px 20px rgba(11, 31, 58, 0.12)',
                  zIndex: 100,
                  padding: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenSettings) onOpenSettings('profile');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'none',
                    fontSize: '12px',
                    color: '#0F172A',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <User size={14} style={{ color: '#64748B' }} />
                  <span>Profile Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenSettings) onOpenSettings('security');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'none',
                    fontSize: '12px',
                    color: '#0F172A',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Shield size={14} style={{ color: '#64748B' }} />
                  <span>Security & Sessions</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onOpenSettings) onOpenSettings('preferences');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'none',
                    fontSize: '12px',
                    color: '#0F172A',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Sliders size={14} style={{ color: '#64748B' }} />
                  <span>Preferences</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      marginTop: '4px',
                      borderTop: '1px solid #F1F5F9',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottom: 'none',
                      background: 'none',
                      fontSize: '12px',
                      color: '#DC2626',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={14} style={{ color: '#DC2626' }} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', paddingTop: '4px' }}>
          {isCollapsed ? (
            <Tooltip content="Expand Sidebar" position="right">
              <button
                type="button"
                onClick={onToggleCollapse}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Expand Sidebar"
              >
                <ChevronRight size={14} />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: 'none',
                color: '#94A3B8',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={13} />
              <span>Collapse</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
