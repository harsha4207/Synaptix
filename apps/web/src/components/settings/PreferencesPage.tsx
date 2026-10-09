import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Sliders,
  Bell,
  Eye,
  RotateCcw,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  UserPreferences,
  ThemeOption,
  DisplayDensity,
  DefaultLandingPage,
} from '../../types/preferences';

interface PreferencesPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onResetPreferences: () => void;
  onAddToast: (msg: string) => void;
}

export const PreferencesPage: React.FC<PreferencesPageProps> = ({
  preferences,
  onUpdatePreferences,
  onResetPreferences,
  onAddToast,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [savedBannerVisible, setSavedBannerVisible] = useState(false);

  const handleThemeChange = (theme: ThemeOption) => {
    onUpdatePreferences({ theme });
    onAddToast(`Theme updated to ${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`);
  };

  const handleDensityChange = (density: DisplayDensity) => {
    onUpdatePreferences({ displayDensity: density });
    onAddToast(`Display density set to ${density.charAt(0).toUpperCase() + density.slice(1)}`);
  };

  const handleLandingPageChange = (defaultLandingPage: DefaultLandingPage) => {
    onUpdatePreferences({ defaultLandingPage });
    onAddToast(
      defaultLandingPage === 'hub'
        ? 'Default landing set to Workspace Hub'
        : 'Default landing set to Last Visited Workspace'
    );
  };

  const handleToggle = (key: keyof UserPreferences, label: string) => {
    const nextVal = !preferences[key];
    onUpdatePreferences({ [key]: nextVal });
    onAddToast(`${label} ${nextVal ? 'enabled' : 'disabled'}`);
  };

  const handleSavePreferences = () => {
    setSavedBannerVisible(true);
    setTimeout(() => setSavedBannerVisible(false), 3000);
    onAddToast('Preferences saved to browser local storage');
  };

  const handleConfirmReset = () => {
    onResetPreferences();
    setResetConfirmOpen(false);
    onAddToast('Preferences restored to default configuration');
  };

  return (
    <div className="preferences-page-content" aria-label="Preferences Section">
      {/* 1. APPEARANCE SECTION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <Sun size={18} className="text-primary-blue" />
              <h3 className="section-title">Appearance & Theming</h3>
            </div>
            <p className="section-subtitle">
              Configure system color palette, interface scale, and motion preferences.
            </p>
          </div>
        </div>

        {/* Theme Selector: Light / Dark / System */}
        <div className="pref-row-block">
          <label className="pref-block-label">Theme Mode</label>
          <p className="pref-block-hint">
            Select light enterprise clean, low-light OLED dark, or follow device operating system.
          </p>
          <div className="theme-selector-grid">
            {/* Light Mode */}
            <button
              type="button"
              className={`theme-card-option ${preferences.theme === 'light' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('light')}
              aria-pressed={preferences.theme === 'light'}
            >
              <div className="theme-card-preview light-preview">
                <div className="preview-top-bar" />
                <div className="preview-body">
                  <div className="preview-sidebar" />
                  <div className="preview-content">
                    <div className="preview-box" />
                  </div>
                </div>
              </div>
              <div className="theme-card-info">
                <Sun size={15} />
                <span className="theme-title">Light</span>
              </div>
              {preferences.theme === 'light' && <span className="theme-active-tag">Active</span>}
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              className={`theme-card-option ${preferences.theme === 'dark' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('dark')}
              aria-pressed={preferences.theme === 'dark'}
            >
              <div className="theme-card-preview dark-preview">
                <div className="preview-top-bar" />
                <div className="preview-body">
                  <div className="preview-sidebar" />
                  <div className="preview-content">
                    <div className="preview-box" />
                  </div>
                </div>
              </div>
              <div className="theme-card-info">
                <Moon size={15} />
                <span className="theme-title">Dark</span>
              </div>
              {preferences.theme === 'dark' && <span className="theme-active-tag">Active</span>}
            </button>

            {/* System Mode */}
            <button
              type="button"
              className={`theme-card-option ${preferences.theme === 'system' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('system')}
              aria-pressed={preferences.theme === 'system'}
            >
              <div className="theme-card-preview system-preview">
                <div className="preview-split-light" />
                <div className="preview-split-dark" />
              </div>
              <div className="theme-card-info">
                <Laptop size={15} />
                <span className="theme-title">System</span>
              </div>
              {preferences.theme === 'system' && <span className="theme-active-tag">Active</span>}
            </button>
          </div>
        </div>

        <div className="dropdown-divider" />

        {/* Display Density */}
        <div className="pref-row-block">
          <label className="pref-block-label">Display Density</label>
          <p className="pref-block-hint">
            Adjust table paddings, module card gap sizing, and vertical spacing throughout the workspace.
          </p>
          <div className="density-toggle-group">
            <button
              type="button"
              className={`density-pill-btn ${preferences.displayDensity === 'comfortable' ? 'active' : ''}`}
              onClick={() => handleDensityChange('comfortable')}
            >
              <Layers size={14} />
              <span>Comfortable</span>
              <span className="density-hint">(Standard spacing)</span>
            </button>
            <button
              type="button"
              className={`density-pill-btn ${preferences.displayDensity === 'compact' ? 'active' : ''}`}
              onClick={() => handleDensityChange('compact')}
            >
              <Sliders size={14} />
              <span>Compact</span>
              <span className="density-hint">(High information density)</span>
            </button>
          </div>
        </div>

        <div className="dropdown-divider" />

        {/* Reduced Motion Toggle */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Reduced Motion</span>
            <p className="toggle-desc">
              Minimize non-essential page transitions, slide animations, and decorative pulse effects.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.reducedMotion ? 'on' : 'off'}`}
            onClick={() => handleToggle('reducedMotion', 'Reduced motion')}
            aria-checked={preferences.reducedMotion}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD PREFERENCES SECTION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <Sparkles size={18} className="text-primary-blue" />
              <h3 className="section-title">Dashboard Preferences</h3>
            </div>
            <p className="section-subtitle">
              Control modules displayed on your Workspace Hub and landing view.
            </p>
          </div>
        </div>

        {/* Default Landing Page */}
        <div className="pref-row-block">
          <label className="pref-block-label">Default Landing View</label>
          <p className="pref-block-hint">
            Destination screen shown after authenticating with Synaptix Command.
          </p>
          <div className="landing-selector-row">
            <label className="radio-select-item">
              <input
                type="radio"
                name="landingView"
                checked={preferences.defaultLandingPage === 'hub'}
                onChange={() => handleLandingPageChange('hub')}
              />
              <span className="radio-custom" />
              <div className="radio-label-wrap">
                <span className="radio-main-title">Workspace Hub (All Domains)</span>
                <span className="radio-sub-title">Overview of all authorized domain workspaces</span>
              </div>
            </label>

            <label className="radio-select-item">
              <input
                type="radio"
                name="landingView"
                checked={preferences.defaultLandingPage === 'last_workspace'}
                onChange={() => handleLandingPageChange('last_workspace')}
              />
              <span className="radio-custom" />
              <div className="radio-label-wrap">
                <span className="radio-main-title">Last Visited Workspace</span>
                <span className="radio-sub-title">Resume your most recent active intelligence boundary</span>
              </div>
            </label>
          </div>
        </div>

        <div className="dropdown-divider" />

        {/* Show Recent Activity */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Show Recent Activity Section</span>
            <p className="toggle-desc">
              Display global stream of telemetry, model runs, and dataset uploads below the workspace grid.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.showRecentActivity ? 'on' : 'off'}`}
            onClick={() => handleToggle('showRecentActivity', 'Recent activity')}
            aria-checked={preferences.showRecentActivity}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Show Quick Actions */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Show Quick Actions Bar</span>
            <p className="toggle-desc">
              Display the one-click action triggers (Upload Data, Run Synthesis, Audit Security) on the Hub.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.showQuickActions ? 'on' : 'off'}`}
            onClick={() => handleToggle('showQuickActions', 'Quick actions')}
            aria-checked={preferences.showQuickActions}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Show Workspace Metadata */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Show Workspace Metadata Counters</span>
            <p className="toggle-desc">
              Render document, dataset, and dashboard counter tags on workspace preview cards.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.showWorkspaceMetadata ? 'on' : 'off'}`}
            onClick={() => handleToggle('showWorkspaceMetadata', 'Workspace metadata counters')}
            aria-checked={preferences.showWorkspaceMetadata}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>
      </div>

      {/* 3. NOTIFICATION PREFERENCES SECTION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <Bell size={18} className="text-primary-blue" />
              <h3 className="section-title">Notification Preferences</h3>
            </div>
            <p className="section-subtitle">
              Manage alert delivery channels, sound cues, and priority thresholds.
            </p>
          </div>
        </div>

        {/* In-app notifications */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">In-App Notification Drawer</span>
            <p className="toggle-desc">
              Show real-time badge counters and alert messages inside the header bell panel.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.inAppNotifications ? 'on' : 'off'}`}
            onClick={() => handleToggle('inAppNotifications', 'In-app notifications')}
            aria-checked={preferences.inAppNotifications}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Action Required alerts */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">High Priority / Action Required Alerts</span>
            <p className="toggle-desc">
              Highlight workflows requiring compliance officer signature or manual review.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.actionRequiredAlerts ? 'on' : 'off'}`}
            onClick={() => handleToggle('actionRequiredAlerts', 'Action Required alerts')}
            aria-checked={preferences.actionRequiredAlerts}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Security Alerts */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Security & Telemetry Alerts</span>
            <p className="toggle-desc">
              Alerts regarding token refresh, device login, and IAM permission boundary changes.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.securityAlerts ? 'on' : 'off'}`}
            onClick={() => handleToggle('securityAlerts', 'Security alerts')}
            aria-checked={preferences.securityAlerts}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Sound alerts (Placeholder integration) */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <div className="title-with-pill">
              <span className="toggle-title">Audio Chime Notifications</span>
              <span className="integration-pill">Web Audio API</span>
            </div>
            <p className="toggle-desc">
              Play subtle audio chime when critical intelligence workflows complete.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.soundAlerts ? 'on' : 'off'}`}
            onClick={() => handleToggle('soundAlerts', 'Sound alerts')}
            aria-checked={preferences.soundAlerts}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Email notifications (Cloud Integration notice) */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <div className="title-with-pill">
              <span className="toggle-title">Email Notification Digest</span>
              <span className="integration-pill pending">Requires SMTP Service</span>
            </div>
            <p className="toggle-desc">
              Send weekly summaries and critical breach alerts to your registered work email.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.emailNotifications ? 'on' : 'off'}`}
            onClick={() => handleToggle('emailNotifications', 'Email notifications')}
            aria-checked={preferences.emailNotifications}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>
      </div>

      {/* 4. ACCESSIBILITY & INTERACTION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <Eye size={18} className="text-primary-blue" />
              <h3 className="section-title">Accessibility & Interaction</h3>
            </div>
            <p className="section-subtitle">
              Enhanced contrast, keyboard navigation assists, and regional preferences.
            </p>
          </div>
        </div>

        {/* Keyboard Hints */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Show Keyboard Shortcut Hints (⌘K / Ctrl+K)</span>
            <p className="toggle-desc">
              Display helper key tags beside global search and action buttons.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.showKeyboardHints ? 'on' : 'off'}`}
            onClick={() => handleToggle('showKeyboardHints', 'Keyboard shortcut hints')}
            aria-checked={preferences.showKeyboardHints}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Enhanced Contrast */}
        <div className="pref-toggle-row">
          <div className="toggle-text-wrap">
            <span className="toggle-title">Enhanced Border & Text Contrast</span>
            <p className="toggle-desc">
              Increase border opacity and text contrast to meet WCAG AAA standards.
            </p>
          </div>
          <button
            type="button"
            className={`pref-switch ${preferences.enhancedContrast ? 'on' : 'off'}`}
            onClick={() => handleToggle('enhancedContrast', 'Enhanced contrast')}
            aria-checked={preferences.enhancedContrast}
            role="switch"
          >
            <span className="switch-slider" />
          </button>
        </div>

        <div className="dropdown-divider" />

        {/* Language selector */}
        <div className="pref-row-block">
          <label className="pref-block-label" htmlFor="pref-lang-select">Interface Language</label>
          <div className="lang-select-wrap">
            <select
              id="pref-lang-select"
              className="field-input lang-select"
              value={preferences.language}
              onChange={(e) => {
                onUpdatePreferences({ language: e.target.value });
                onAddToast(`Interface locale set to ${e.target.value}`);
              }}
            >
              <option value="en-US">English (United States) &mdash; Default</option>
              <option value="en-GB" disabled>English (UK) &mdash; Locale Pack Coming Soon</option>
              <option value="de-DE" disabled>Deutsch &mdash; Enterprise Translation Pending</option>
              <option value="ja-JP" disabled>日本語 &mdash; Enterprise Translation Pending</option>
            </select>
          </div>
          <span className="field-helper">Additional languages can be provisioned by workspace tenant admin.</span>
        </div>
      </div>

      {/* 5. PREFERENCES ACTIONS FOOTER */}
      <div className="settings-actions-footer">
        {savedBannerVisible ? (
          <div className="settings-success-indicator">
            <CheckCircle2 size={16} />
            <span>Preferences saved to local storage</span>
          </div>
        ) : (
          <div className="footer-notice-left text-muted">
            Preferences are saved automatically and synchronized across tabs.
          </div>
        )}

        <div className="footer-btns-right">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setResetConfirmOpen(true)}
          >
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleSavePreferences}
          >
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {resetConfirmOpen && (
        <div className="modal-backdrop" onClick={() => setResetConfirmOpen(false)}>
          <div className="settings-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="title-with-icon">
                <RotateCcw size={18} className="text-primary-blue" />
                <h3 className="modal-title">Reset Preferences to Default</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setResetConfirmOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-text">
                Are you sure you want to restore all interface preferences (Theme, Density, Dashboard modules, Notifications) back to the standard Synaptix Command defaults?
              </p>
              <div className="security-notice-callout">
                <Info size={16} />
                <span>This will only reset UI view preferences. Your profile information, security credentials, and workspace documents will not be affected.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setResetConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleConfirmReset}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
