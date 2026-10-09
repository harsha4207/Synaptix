import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
  Lock,
  Info,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { UserProfileInfo } from '../../types/workspace';

interface SecuritySettingsPageProps {
  user: UserProfileInfo;
  onAddToast: (msg: string) => void;
  onSignOut?: () => void;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export const SecuritySettingsPage: React.FC<SecuritySettingsPageProps> = ({
  user,
  onAddToast,
  onSignOut: _onSignOut,
}) => {
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 2FA Dialog / State (Placeholder UI)
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Sessions state (Clearly designated as demo/session data)
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess-current',
      device: 'Windows Workstation (x86_64)',
      browser: 'Chrome 122.0',
      location: 'San Francisco, CA, USA',
      ipAddress: '192.168.1.104',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess-laptop',
      device: 'MacBook Pro 16" M3',
      browser: 'Safari 17.3',
      location: 'Austin, TX, USA',
      ipAddress: '10.0.4.18',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
    {
      id: 'sess-mobile',
      device: 'iPhone 15 Pro',
      browser: 'Mobile Safari',
      location: 'Austin, TX, USA',
      ipAddress: '172.56.21.90',
      lastActive: 'Yesterday at 4:15 PM',
      isCurrent: false,
    },
  ]);

  // Connected accounts (Google account status)
  const isGoogleConnected = user.email.includes('enterprise') || user.email.includes('gmail') || true;

  // Account Management / Danger Zone confirmation modal
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerActionType, setDangerActionType] = useState<'deactivate' | 'delete' | null>(null);

  // Password validation & submit handler
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password to authorize changes.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must differ from your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    // Inform user of frontend verification and pending backend auth endpoint
    setPasswordSuccess('Password validated successfully. Backend auth provider sync will apply on production deployment.');
    onAddToast('Password validation passed (Auth backend integration pending)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSignOutOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    onAddToast('Signed out of 2 other demo sessions');
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      onAddToast('Two-Factor Authentication disabled');
    } else {
      setIs2FAModalOpen(true);
    }
  };

  const handleConfirm2FAEnable = () => {
    setTwoFactorEnabled(true);
    setIs2FAModalOpen(false);
    onAddToast('Two-Factor Authentication configuration preview activated');
  };

  return (
    <div className="security-settings-container">
      {/* SECTION A: ACCOUNT INFORMATION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <h3 className="section-title">Account Information</h3>
            <p className="section-subtitle">
              Core identity, role authorization, and tenant workspace association.
            </p>
          </div>
          <span className="account-status-badge active">
            <CheckCircle2 size={13} /> Active Status
          </span>
        </div>

        <div className="account-info-grid">
          <div className="info-item">
            <span className="info-label">Account Email</span>
            <span className="info-value email-highlight">{user.email}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Assigned Role</span>
            <span className="info-value role-badge">{user.role || 'Enterprise Administrator'}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Workspace Tenant</span>
            <span className="info-value">{user.organization || 'SYNAPTIX COMMAND'}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Account Created</span>
            <span className="info-value text-muted">October 2024 (Synaptix v2.4 Enterprise)</span>
          </div>

          <div className="info-item">
            <span className="info-label">Identity Source</span>
            <span className="info-value text-muted">Enterprise SAML / Google SSO Provider</span>
          </div>

          <div className="info-item">
            <span className="info-label">Compliance Level</span>
            <span className="info-value text-muted">SOC2 Type II / HIPAA BAA Compliant</span>
          </div>
        </div>
      </div>

      {/* SECTION B: PASSWORD AND AUTHENTICATION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <KeyRound size={18} className="text-primary-blue" />
              <h3 className="section-title">Password & Authentication</h3>
            </div>
            <p className="section-subtitle">
              Manage master credentials for your enterprise workspace login.
            </p>
          </div>
        </div>

        <div className="security-notice-callout">
          <Info size={16} className="notice-icon" />
          <div className="notice-body">
            <strong>Enterprise Security Notice:</strong> Passwords must contain a minimum of 8 characters, at least one uppercase letter, and one numeric or special character.
          </div>
        </div>

        {passwordError && (
          <div className="form-alert-banner error" role="alert">
            <AlertTriangle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="form-alert-banner success" role="status">
            <CheckCircle2 size={16} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="security-password-form">
          <div className="form-field-group">
            <label className="field-label" htmlFor="current-password">Current Password</label>
            <div className="password-input-wrapper">
              <input
                id="current-password"
                type={showCurrentPass ? 'text' : 'password'}
                className="field-input password-input"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                aria-label={showCurrentPass ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-field-group">
              <label className="field-label" htmlFor="new-password">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="new-password"
                  type={showNewPass ? 'text' : 'password'}
                  className="field-input password-input"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-visibility"
                  onClick={() => setShowNewPass(!showNewPass)}
                  aria-label={showNewPass ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label" htmlFor="confirm-password">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPass ? 'text' : 'password'}
                  className="field-input password-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-visibility"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label={showConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-action-row">
            <button type="submit" className="btn-primary">
              <Lock size={15} />
              <span>Update Password</span>
            </button>
            <span className="field-helper text-muted">
              * Client-side validation active. Direct credential storage requires backend SSO sync.
            </span>
          </div>
        </form>
      </div>

      {/* SECTION C: TWO-FACTOR AUTHENTICATION */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <Smartphone size={18} className="text-primary-blue" />
              <h3 className="section-title">Two-Factor Authentication (2FA)</h3>
            </div>
            <p className="section-subtitle">
              Add a mandatory extra layer of security when logging into Synaptix Command.
            </p>
          </div>
          <span className={`account-status-badge ${twoFactorEnabled ? 'active' : 'inactive'}`}>
            {twoFactorEnabled ? '2FA Enabled' : 'Not Configured'}
          </span>
        </div>

        <div className="two-factor-content">
          <p className="two-factor-desc">
            Two-factor authentication protects your account by requiring an authenticator app code (such as Google Authenticator, Duo, or 1Password) in addition to your enterprise password.
          </p>

          <div className="two-factor-action-row">
            <button
              type="button"
              className={twoFactorEnabled ? 'btn-secondary' : 'btn-primary'}
              onClick={handleToggle2FA}
            >
              <Shield size={15} />
              <span>{twoFactorEnabled ? 'Disable 2FA' : 'Configure Two-Factor Auth'}</span>
            </button>
            <span className="integration-status-tag">
              {twoFactorEnabled ? 'Preview Active (Session)' : 'TOTP / FIDO2 Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION D: ACTIVE SESSIONS AND DEVICES */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <div className="title-with-icon">
              <Laptop size={18} className="text-primary-blue" />
              <h3 className="section-title">Active Sessions & Devices</h3>
            </div>
            <p className="section-subtitle">
              Devices currently signed in to your Synaptix Command user account.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={handleSignOutOtherSessions}
            disabled={sessions.length <= 1}
          >
            <LogOut size={14} />
            <span>Sign Out Other Sessions</span>
          </button>
        </div>

        <div className="demo-data-badge">
          <Info size={13} />
          <span>Demo Session Telemetry &mdash; identified for testing workspace device control.</span>
        </div>

        <div className="sessions-list">
          {sessions.map((session) => (
            <div key={session.id} className={`session-card ${session.isCurrent ? 'current-session' : ''}`}>
              <div className="session-icon-wrap">
                <Laptop size={20} />
              </div>
              <div className="session-details">
                <div className="session-heading-row">
                  <span className="session-device-name">{session.device}</span>
                  {session.isCurrent && (
                    <span className="session-current-tag">This Device</span>
                  )}
                </div>
                <div className="session-meta-row">
                  <span>{session.browser}</span>
                  <span>&bull;</span>
                  <span>{session.location}</span>
                  <span>&bull;</span>
                  <span className="text-muted">IP: {session.ipAddress}</span>
                </div>
              </div>
              <div className="session-time">
                <Clock size={13} />
                <span>{session.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION E: CONNECTED ACCOUNTS */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <h3 className="section-title">Connected Identity Accounts</h3>
            <p className="section-subtitle">
              Single sign-on providers and linked enterprise accounts.
            </p>
          </div>
        </div>

        <div className="connected-accounts-list">
          <div className="connected-account-row">
            <div className="provider-info-wrap">
              <div className="provider-logo-box google">G</div>
              <div>
                <h4 className="provider-name">Google Workspace SSO</h4>
                <p className="provider-desc text-muted">
                  {isGoogleConnected ? `Connected via ${user.email}` : 'Not connected'}
                </p>
              </div>
            </div>
            <div>
              {isGoogleConnected ? (
                <span className="account-status-badge active">
                  <CheckCircle2 size={13} /> Connected
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => onAddToast('Google SSO connection requires tenant authentication setup')}
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="connected-account-row">
            <div className="provider-info-wrap">
              <div className="provider-logo-box saml">S</div>
              <div>
                <h4 className="provider-name">Enterprise Okta / SAML 2.0</h4>
                <p className="provider-desc text-muted">Corporate identity provider federation</p>
              </div>
            </div>
            <div>
              <span className="account-status-badge inactive">Available via Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION F: SECURITY ACTIVITY */}
      <div className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <h3 className="section-title">Recent Security Activity</h3>
            <p className="section-subtitle">
              Audit log of authentication events and security settings updates.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => onAddToast('Audit log is synced with enterprise telemetry stream')}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="security-activity-list">
          <div className="activity-event-row">
            <div className="activity-icon-bullet success" />
            <div className="activity-body">
              <span className="activity-title">Successful Enterprise Sign-In</span>
              <span className="activity-meta">Chrome on Windows &bull; IP 192.168.1.104 &bull; Just now</span>
            </div>
          </div>

          <div className="activity-event-row">
            <div className="activity-icon-bullet neutral" />
            <div className="activity-body">
              <span className="activity-title">Profile Settings Inspected</span>
              <span className="activity-meta">Session active &bull; Synaptix Command Hub &bull; 10 minutes ago</span>
            </div>
          </div>

          <div className="activity-event-row">
            <div className="activity-icon-bullet neutral" />
            <div className="activity-body">
              <span className="activity-title">Google SSO Token Refreshed</span>
              <span className="activity-meta">OAuth2 token exchange &bull; enterprise.com &bull; 2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION G: ACCOUNT MANAGEMENT / DANGER ZONE */}
      <div className="settings-section-card danger-zone-card">
        <div className="section-card-header">
          <div className="section-title-wrap">
            <h3 className="section-title text-danger">Danger Zone</h3>
            <p className="section-subtitle">
              Destructive actions regarding your enterprise account credentials and workspace access.
            </p>
          </div>
        </div>

        <div className="danger-zone-content">
          <div className="danger-action-row">
            <div>
              <h4 className="danger-action-title">Deactivate Account</h4>
              <p className="danger-action-desc">
                Temporarily disable your workspace access and pause all active background workflows.
              </p>
            </div>
            <button
              type="button"
              className="btn-outline-danger"
              onClick={() => {
                setDangerActionType('deactivate');
                setIsDangerModalOpen(true);
              }}
            >
              Deactivate Account
            </button>
          </div>

          <div className="dropdown-divider" />

          <div className="danger-action-row">
            <div>
              <h4 className="danger-action-title">Delete Account</h4>
              <p className="danger-action-desc">
                Permanently delete your user profile and remove your credentials from Synaptix Command.
              </p>
            </div>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                setDangerActionType('delete');
                setIsDangerModalOpen(true);
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* 2FA SETUP MODAL (PLACEHOLDER / DEMO CONFIGURATION) */}
      {is2FAModalOpen && (
        <div className="modal-backdrop" onClick={() => setIs2FAModalOpen(false)}>
          <div className="settings-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="title-with-icon">
                <Shield size={20} className="text-primary-blue" />
                <h3 className="modal-title">Configure Two-Factor Authentication</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIs2FAModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-text">
                Scan the QR code with your enterprise authenticator app (such as Google Authenticator, Duo, or Microsoft Authenticator).
              </p>

              <div className="mock-qr-container">
                <div className="mock-qr-code">
                  <div className="qr-cell tl" />
                  <div className="qr-cell tr" />
                  <div className="qr-cell bl" />
                  <div className="qr-pattern-text">SYNAPTIX-2FA-AUTH</div>
                </div>
                <div className="qr-secret-key">
                  <span className="secret-label">Secret Key:</span>
                  <code>SYN-7X9B-44KM-PX22</code>
                </div>
              </div>

              <div className="form-field-group">
                <label className="field-label" htmlFor="twofa-code">6-Digit Verification Code</label>
                <input
                  id="twofa-code"
                  type="text"
                  maxLength={6}
                  className="field-input text-center font-mono letter-spacing-wide"
                  placeholder="000000"
                />
              </div>

              <p className="field-helper text-muted">
                * Note: This is an enterprise UI configuration preview. Active OTP server authentication will apply upon cluster deployment.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIs2FAModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirm2FAEnable}
              >
                Verify & Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DANGER CONFIRMATION MODAL */}
      {isDangerModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDangerModalOpen(false)}>
          <div className="settings-modal-dialog danger-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="title-with-icon">
                <AlertTriangle size={20} className="text-danger" />
                <h3 className="modal-title">
                  {dangerActionType === 'delete' ? 'Delete Account Confirmation' : 'Deactivate Account Confirmation'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsDangerModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-text">
                {dangerActionType === 'delete'
                  ? 'Are you sure you want to permanently delete your Synaptix Command enterprise account? All workspace boundaries, saved query sessions, and audit assignments associated with this user ID will be archived.'
                  : 'Are you sure you want to deactivate your account? You will be signed out immediately and require enterprise administrator intervention to re-enable.'}
              </p>

              <div className="security-notice-callout warning">
                <Info size={16} />
                <div>
                  <strong>Disabled Action for Safety:</strong> Destructive account deletion is disabled in this preview build to prevent accidental loss of enterprise tenant data.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsDangerModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  setIsDangerModalOpen(false);
                  onAddToast('Destructive action rejected: Enterprise safeguard active.');
                }}
              >
                {dangerActionType === 'delete' ? 'Proceed with Deletion' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
