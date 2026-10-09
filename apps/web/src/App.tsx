import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/landing';
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
import { SettingsLayout, SettingsTab } from './components/settings/SettingsLayout';
import { ProfileSettingsPage } from './components/settings/ProfileSettingsPage';
import { SecuritySettingsPage } from './components/settings/SecuritySettingsPage';
import { PreferencesPage } from './components/settings/PreferencesPage';
import { UserProfileInfo } from './types/workspace';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  loadUserPreferences,
  saveUserPreferences,
  applyThemeToDOM,
  applyDensityToDOM,
  applyReducedMotionToDOM,
} from './types/preferences';
import {
  loadUserProfile,
  saveUserProfile,
  loadAvatarFromStorage,
  saveAvatarToStorage,
  loadSessionEmail,
  saveSessionEmail,
  clearSessionEmail,
} from './services/profileStorage';

export const App: React.FC = () => {
  // Navigation View State: 'landing' | 'auth' | 'home' | 'workspace' | 'settings'
  const [authenticatedUserEmail, setAuthenticatedUserEmail] = useState<string>(() => loadSessionEmail() || '');

  // Compute initial route based on hash or stored session
  const [viewState, setViewState] = useState<'landing' | 'auth' | 'home' | 'workspace' | 'settings'>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    const initialEmail = loadSessionEmail();

    if (initialEmail) {
      if (hash.startsWith('#settings')) return 'settings';
      if (hash.startsWith('#workspace')) return 'workspace';
      return 'home';
    } else {
      if (hash === '#login' || hash === '#signup') return 'auth';
      return 'landing';
    }
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    return hash === '#signup' ? 'signup' : 'login';
  });

  const [settingsTab, setSettingsTab] = useState<SettingsTab>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    if (hash === '#settings/security') return 'security';
    if (hash === '#settings/preferences') return 'preferences';
    return 'profile';
  });
  
  // Current user state shared across navigation and settings, initialized from persistent store
  const [currentUser, setCurrentUser] = useState<UserProfileInfo>(() => loadUserProfile(authenticatedUserEmail || undefined));

  // Load persistent avatar from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    const fetchAvatar = async () => {
      if (!currentUser.email) return;
      const storedAvatar = await loadAvatarFromStorage(currentUser.email);
      if (isMounted && storedAvatar) {
        setCurrentUser((prev) => ({ ...prev, avatarUrl: storedAvatar }));
      }
    };
    fetchAvatar();
    return () => {
      isMounted = false;
    };
  }, [currentUser.email]);

  // User preferences state (Appearance, Dashboard, Notifications, Accessibility)
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());

  // Apply theme, density, and reduced motion to DOM whenever preferences update
  useEffect(() => {
    applyThemeToDOM(preferences.theme);
    applyDensityToDOM(preferences.displayDensity);
    applyReducedMotionToDOM(preferences.reducedMotion);
    saveUserPreferences(preferences);
  }, [preferences]);

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  const handleResetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

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

  // Sync authenticated session to persistent storage
  const syncAuthenticatedSession = (email: string) => {
    setAuthenticatedUserEmail(email);
    saveSessionEmail(email);
  };

  const handleSuccessAuth = async (email: string, mode: 'login' | 'signup') => {
    syncAuthenticatedSession(email);
    const existingProfile = loadUserProfile(email);
    const storedAvatar = await loadAvatarFromStorage(email);
    setCurrentUser({
      ...existingProfile,
      avatarUrl: storedAvatar || undefined,
    });
    addToast(mode === 'login' ? 'Successfully signed in to Synaptix Command' : 'Enterprise account created successfully');
    
    // Check if there was an intended protected destination in hash
    const rawHash = window.location.hash;
    if (rawHash && !['#login', '#signup', '#landing', '#overview', '#capabilities', '#preview', '#workflow', '#governance'].includes(rawHash.toLowerCase())) {
      // Keep intended destination
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = '#home';
      setViewState('home');
    }
  };

  const handleGoogleAuth = async () => {
    const demoEmail = 'alex.vance@enterprise.com';
    syncAuthenticatedSession(demoEmail);
    const existingProfile = loadUserProfile(demoEmail);
    const storedAvatar = await loadAvatarFromStorage(demoEmail);
    setCurrentUser({
      ...existingProfile,
      avatarUrl: storedAvatar || undefined,
    });
    addToast('Authenticated with Google Enterprise SSO');

    const rawHash = window.location.hash;
    if (rawHash && !['#login', '#signup', '#landing', '#overview', '#capabilities', '#preview', '#workflow', '#governance'].includes(rawHash.toLowerCase())) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = '#home';
      setViewState('home');
    }
  };

  const handleOpenSettings = (tab: SettingsTab = 'profile') => {
    setSettingsTab(tab);
    setViewState('settings');
    const newHash = tab === 'profile' ? '#settings/profile' : tab === 'security' ? '#settings/security' : '#settings/preferences';
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  };

  const handleSelectTab = (tab: SettingsTab) => {
    setSettingsTab(tab);
    const newHash = tab === 'profile' ? '#settings/profile' : tab === 'security' ? '#settings/security' : '#settings/preferences';
    // Use history.replaceState so changing tabs doesn't clutter back history
    window.history.replaceState(null, '', newHash);
  };

  const handleUpdateProfile = async (updated: Partial<UserProfileInfo>) => {
    const merged: UserProfileInfo = { ...currentUser, ...updated };
    setCurrentUser(merged);
    saveUserProfile(merged);

    // If avatarUrl was modified or explicitly set to undefined (removed)
    if ('avatarUrl' in updated) {
      await saveAvatarToStorage(merged.email, updated.avatarUrl || null);
    }
  };

  const handleSelectWorkspace = (workspaceId: string, targetModule: WorkspaceModuleId = 'overview') => {
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
    setActiveModule(targetModule);
    setViewState('workspace');
    window.location.hash = `#workspace/${workspaceId}/${targetModule}`;
    addToast(`Selected ${ws.name} Workspace Boundary`);
  };

  const handleCreateWorkspace = (newWs: WorkspaceItem) => {
    setWorkspaces((prev) => [newWs, ...prev]);
    addToast(`Created workspace: ${newWs.name}`);
  };

  // URL hash sync for browser Back/Forward and direct navigation
  useEffect(() => {
    const handleHashSync = () => {
      const rawHash = window.location.hash;
      const hash = rawHash.toLowerCase();

      // Case 1: Unauthenticated user
      if (!authenticatedUserEmail) {
        if (hash === '#login') {
          setAuthMode('login');
          setViewState('auth');
        } else if (hash === '#signup' || hash === '#register') {
          setAuthMode('signup');
          setViewState('auth');
        } else if (hash.startsWith('#home') || hash.startsWith('#workspace') || hash.startsWith('#settings')) {
          // Protected route accessed without session: redirect to login
          setAuthMode('login');
          setViewState('auth');
          window.location.hash = '#login';
        } else {
          // Default to landing page
          setViewState('landing');
        }
        return;
      }

      // Case 2: Authenticated user
      if (hash === '#login' || hash === '#signup' || hash === '#landing' || hash === '' || hash.startsWith('#overview') || hash.startsWith('#capabilities') || hash.startsWith('#preview') || hash.startsWith('#workflow') || hash.startsWith('#governance')) {
        // Authenticated users navigating to login/landing/marketing sections are kept in the app
        // If they explicitly hit Back into login/landing, bring them safely to home
        setViewState('home');
        window.history.replaceState(null, '', '#home');
        return;
      }

      if (hash.startsWith('#settings')) {
        setViewState('settings');
        if (hash.includes('security')) {
          setSettingsTab('security');
        } else if (hash.includes('preferences')) {
          setSettingsTab('preferences');
        } else {
          setSettingsTab('profile');
        }
        return;
      }

      if (hash.startsWith('#workspace/')) {
        const parts = rawHash.replace('#workspace/', '').split('/');
        const wsId = parts[0];
        const modId = (parts[1] || 'overview') as WorkspaceModuleId;
        const targetWs = workspaces.find((w) => w.id === wsId);
        if (targetWs) {
          setSelectedWorkspace(targetWs);
        }
        setActiveModule(modId);
        setViewState('workspace');
        return;
      }

      if (hash === '#home') {
        setViewState('home');
        return;
      }

      // Fallback for any unknown hash while authenticated
      setViewState('home');
      window.history.replaceState(null, '', '#home');
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [authenticatedUserEmail, workspaces]);

  const handleOpenLogin = () => {
    setAuthMode('login');
    setViewState('auth');
    window.location.hash = '#login';
  };

  const handleOpenSignup = () => {
    setAuthMode('signup');
    setViewState('auth');
    window.location.hash = '#signup';
  };

  const handleBackToLanding = () => {
    setViewState('landing');
    window.location.hash = '#landing';
  };

  const handleBackToHub = () => {
    setViewState('home');
    window.location.hash = '#home';
  };

  const handleInAppBack = () => {
    // Check if browser history has depth to go back safely
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback destination
      setViewState('home');
      window.location.hash = '#home';
    }
  };

  const handleSignOut = () => {
    clearSessionEmail();
    setAuthenticatedUserEmail('');
    setSelectedWorkspace(null);
    setViewState('landing');
    window.location.hash = '#landing';
    addToast('Signed out of Synaptix Command');
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    const targetWs = workspaces.find((w) => w.id === item.workspaceId) || selectedWorkspace;
    if (targetWs) {
      setSelectedWorkspace(targetWs);
      setViewState('workspace');
    }
    setActiveModule(item.targetModule);
    window.location.hash = `#workspace/${item.workspaceId}/${item.targetModule}`;
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
            onBackToHub={handleBackToHub}
            onSelectModule={(mod) => {
              setActiveModule(mod);
              window.location.hash = `#workspace/${selectedWorkspace.id}/${mod}`;
            }}
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
      {/* 0. PUBLIC ENTERPRISE LANDING PAGE VIEW */}
      {viewState === 'landing' && (
        <LandingPage
          onOpenLogin={handleOpenLogin}
          onOpenSignup={handleOpenSignup}
        />
      )}

      {/* 1. AUTHENTICATION VIEW */}
      {viewState === 'auth' && (
        <AuthPage
          onSuccessAuth={handleSuccessAuth}
          onGoogleAuth={handleGoogleAuth}
          onAddToast={addToast}
          initialMode={authMode}
          onBackToLanding={handleBackToLanding}
        />
      )}

      {/* 2. POST-LOGIN HOMEPAGE VIEW (SYNAPTIX COMMAND Workspace Hub) */}
      {viewState === 'home' && (
        <HomePage
          userEmail={authenticatedUserEmail || 'alex.vance@enterprise.com'}
          currentUser={currentUser}
          preferences={preferences}
          onSignOut={handleSignOut}
          onSelectWorkspace={handleSelectWorkspace}
          onAddToast={addToast}
          onOpenSettings={handleOpenSettings}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onOpenNotificationTarget={handleOpenNotificationTarget}
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
            window.location.hash = `#workspace/${selectedWorkspace.id}/${mod}`;
          }}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onBackToHub={handleBackToHub}
          onSignOut={handleSignOut}
          userEmail={authenticatedUserEmail || 'alex.vance@enterprise.com'}
          currentUser={currentUser}
          onOpenSettings={handleOpenSettings}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onOpenNotificationTarget={handleOpenNotificationTarget}
        >
          {renderWorkspaceModuleContent()}
        </AppShell>
      )}

      {/* 4. SETTINGS SECTION VIEW (/settings/profile & /settings/security) */}
      {viewState === 'settings' && (
        <SettingsLayout
          currentTab={settingsTab}
          onSelectTab={handleSelectTab}
          onBackToHub={() => {
            setViewState(selectedWorkspace ? 'workspace' : 'home');
            window.location.hash = selectedWorkspace ? `#workspace/${selectedWorkspace.id}/${activeModule}` : '#home';
          }}
          onBack={handleInAppBack}
          backLabel={selectedWorkspace ? `Back to ${selectedWorkspace.name}` : 'Back to Workspace Hub'}
          user={currentUser}
          onSignOut={handleSignOut}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onOpenNotificationTarget={handleOpenNotificationTarget}
        >
          {settingsTab === 'profile' && (
            <ProfileSettingsPage
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onAddToast={addToast}
            />
          )}

          {settingsTab === 'security' && (
            <SecuritySettingsPage
              user={currentUser}
              onAddToast={addToast}
              onSignOut={handleSignOut}
            />
          )}

          {settingsTab === 'preferences' && (
            <PreferencesPage
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onResetPreferences={handleResetPreferences}
              onAddToast={addToast}
            />
          )}
        </SettingsLayout>
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
