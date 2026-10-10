import React, { useState, useEffect } from 'react';
import { geminiClient } from '../lib/gemini/geminiClient';
import type { GeminiHealthStatus } from '../lib/gemini/geminiService';
import {
  Settings,
  Users,
  Shield,
  Database,
  Bot,
  FileText,
  AlertTriangle,
  Link2,
  Bell,
  Archive,
  Lock,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Edit3,
  MoreHorizontal,
  Eye,
  EyeOff,
  Info,
  ToggleLeft,
  ToggleRight,
  User,
  Search
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { PageContainer, PageContent } from '../components/layout';

interface SettingsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

type SettingsSection =
  | 'general'
  | 'members'
  | 'roles'
  | 'datasources'
  | 'ai'
  | 'policies'
  | 'risk'
  | 'integrations'
  | 'notifications'
  | 'retention'
  | 'security';

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'general',       label: 'General',              icon: <Settings size={15} /> },
  { id: 'members',       label: 'Members',              icon: <Users size={15} /> },
  { id: 'roles',         label: 'Roles & Permissions',  icon: <Shield size={15} /> },
  { id: 'datasources',   label: 'Data Sources',         icon: <Database size={15} /> },
  { id: 'ai',            label: 'AI Configuration',     icon: <Bot size={15} /> },
  { id: 'policies',      label: 'Policies',             icon: <FileText size={15} /> },
  { id: 'risk',          label: 'Risk Controls',        icon: <AlertTriangle size={15} /> },
  { id: 'integrations',  label: 'Integrations',         icon: <Link2 size={15} /> },
  { id: 'notifications', label: 'Notifications',        icon: <Bell size={15} /> },
  { id: 'retention',     label: 'Retention',            icon: <Archive size={15} /> },
  { id: 'security',      label: 'Security',             icon: <Lock size={15} /> },
];

// ── Shared UI primitives ────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="settings-section-header">
    <h2 className="settings-section-title">{title}</h2>
    <p className="settings-section-subtitle">{subtitle}</p>
  </div>
);

const SettingRow: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
  divider?: boolean;
}> = ({ label, hint, children, divider = true }) => (
  <div className={`setting-row ${divider ? 'with-divider' : ''}`}>
    <div className="setting-row-label-col">
      <span className="setting-row-label">{label}</span>
      {hint && <span className="setting-row-hint">{hint}</span>}
    </div>
    <div className="setting-row-control-col">{children}</div>
  </div>
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}> = ({ checked, onChange, id }) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    className={`settings-toggle ${checked ? 'on' : 'off'}`}
    onClick={() => onChange(!checked)}
  >
    {checked ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
  </button>
);

const SettingsBadge: React.FC<{ label: string; variant?: 'success' | 'warn' | 'danger' | 'neutral' }> = ({
  label,
  variant = 'neutral',
}) => (
  <span className={`settings-badge ${variant}`}>{label}</span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const SettingsModule: React.FC<SettingsModuleProps> = ({ workspace, onAddToast }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  const handleSave = (section: string) => {
    onAddToast(`${section} settings saved`);
  };

  return (
    <PageContainer>
      <PageContent>
      <div className="settings-page-container" aria-label="Workspace Settings">
        {/* Slim page header */}
        <header className="settings-top-header">
          <div>
            <div className="settings-breadcrumb">
              <span>{workspace.name}</span>
              <ChevronRight size={13} />
              <span className="bc-active">Settings</span>
            </div>
            <h1 className="settings-main-title">Domain Settings</h1>
            <p className="settings-main-subtitle">
              Configure access, data, AI behaviour and governance for the {workspace.name} workspace.
            </p>
          </div>
        </header>

        {/* Two-column layout */}
        <div className="settings-layout">
          {/* Left nav */}
          <aside className="settings-nav" aria-label="Settings sections">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="snav-icon">{item.icon}</span>
                <span className="snav-label">{item.label}</span>
                {activeSection === item.id && <ChevronRight size={14} className="snav-arrow" />}
              </button>
            ))}
          </aside>

          {/* Right content */}
          <main className="settings-content-pane">
            {activeSection === 'general'       && <GeneralSection      workspace={workspace} onSave={handleSave} />}
            {activeSection === 'members'       && <MembersSection      workspace={workspace} onSave={handleSave} onAddToast={onAddToast} />}
            {activeSection === 'roles'         && <RolesSection        workspace={workspace} onSave={handleSave} />}
            {activeSection === 'datasources'   && <DataSourcesSection  workspace={workspace} onSave={handleSave} onAddToast={onAddToast} />}
            {activeSection === 'ai'            && <AISection           workspace={workspace} onSave={handleSave} />}
            {activeSection === 'policies'      && <PoliciesSection     workspace={workspace} onSave={handleSave} />}
            {activeSection === 'risk'          && <RiskSection         workspace={workspace} onSave={handleSave} />}
            {activeSection === 'integrations'  && <IntegrationsSection workspace={workspace} onSave={handleSave} onAddToast={onAddToast} />}
            {activeSection === 'notifications' && <NotificationsSection workspace={workspace} onSave={handleSave} />}
            {activeSection === 'retention'     && <RetentionSection    workspace={workspace} onSave={handleSave} />}
            {activeSection === 'security'      && <SecuritySection     workspace={workspace} onSave={handleSave} />}
          </main>
        </div>
      </div>
      </PageContent>
    </PageContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERAL
// ═══════════════════════════════════════════════════════════════════════════════

const GeneralSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({
  workspace, onSave,
}) => {
  const [name, setName]     = useState(workspace.name);
  const [desc, setDesc]     = useState(workspace.description);
  const [domain, setDomain] = useState(workspace.domain);

  return (
    <div className="settings-section">
      <SectionHeader
        title="General"
        subtitle="Workspace identity and domain configuration."
      />

      <div className="settings-card">
        <SettingRow label="Workspace Name" hint="Displayed in navigation and audit records.">
          <input
            type="text"
            className="settings-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="general-name"
          />
        </SettingRow>

        <SettingRow label="Description" hint="Short description of the workspace purpose.">
          <textarea
            className="settings-textarea"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            id="general-desc"
          />
        </SettingRow>

        <SettingRow label="Domain Type" hint="Determines available templates and analytical models.">
          <select
            className="settings-select"
            value={domain}
            onChange={(e) => setDomain(e.target.value as WorkspaceItem['domain'])}
            id="general-domain"
          >
            <option value="Finance">Finance</option>
            <option value="Research">Research</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Business">Business</option>
            <option value="Custom">Custom</option>
          </select>
        </SettingRow>

        <SettingRow label="Workspace Icon" hint="Choose from preset domain icons." divider={false}>
          <div className="icon-picker-row">
            {['🏦', '📊', '📋', '🔬', '🏛️', '⚙️'].map((ico) => (
              <button
                key={ico}
                type="button"
                className={`icon-option ${ico === '🏦' ? 'selected' : ''}`}
              >
                {ico}
              </button>
            ))}
          </div>
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="info-callout">
          <Info size={14} />
          <span>
            Workspace ID: <code>{workspace.id}</code> — This identifier is immutable and used in all
            audit trail records and API references.
          </span>
        </div>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline" onClick={() => setName(workspace.name)}>
          <RotateCcw size={13} /> Discard
        </button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('General')}>
          <Save size={13} /> Save Changes
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════════════════════════════════════════

const MEMBERS_DATA = [
  { id: 'u1', name: 'Alex Vance',    email: 'alex.vance@enterprise.com',  role: 'Admin',   status: 'Active',    lastActive: '2 min ago' },
  { id: 'u2', name: 'Priya Sharma',  email: 'priya.sharma@enterprise.com', role: 'Manager', status: 'Active',   lastActive: '1h ago' },
  { id: 'u3', name: 'David Chen',    email: 'david.chen@enterprise.com',  role: 'Admin',   status: 'Active',    lastActive: '2h ago' },
  { id: 'u4', name: 'Sarah Park',    email: 'sarah.park@enterprise.com',  role: 'Manager', status: 'Active',    lastActive: 'Yesterday' },
  { id: 'u5', name: 'Marcus Webb',   email: 'marcus.webb@enterprise.com', role: 'Analyst', status: 'Suspended', lastActive: '9h ago' },
  { id: 'u6', name: 'Lena Fischer',  email: 'lena.fischer@enterprise.com', role: 'Viewer',  status: 'Invited',  lastActive: 'Never' },
];

const MembersSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void; onAddToast: (m: string) => void }> = ({
  onAddToast,
}) => {
  const [members, setMembers] = useState(MEMBERS_DATA);
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newMember = {
      id: `u${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Invited',
      lastActive: 'Never',
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    onAddToast(`Invitation sent to ${inviteEmail}`);
  };

  const handleRemove = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    onAddToast(`Removed ${name} from workspace`);
  };

  return (
    <div className="settings-section">
      <SectionHeader title="Members" subtitle="Manage who has access to this workspace." />

      {/* Invite bar */}
      <div className="settings-card">
        <div className="card-section-label">Invite New Member</div>
        <div className="invite-row">
          <input
            type="email"
            className="settings-input flex-1"
            placeholder="colleague@enterprise.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            id="invite-email"
          />
          <select
            className="settings-select"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            id="invite-role"
          >
            <option>Viewer</option>
            <option>Analyst</option>
            <option>Manager</option>
            <option>Admin</option>
          </select>
          <button type="button" className="settings-btn-primary" onClick={handleInvite}>
            <Plus size={13} /> Invite
          </button>
        </div>
      </div>

      {/* Search + table */}
      <div className="settings-card no-padding">
        <div className="table-toolbar">
          <div className="table-search-wrap">
            <Search size={14} className="table-search-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="member-search"
            />
          </div>
          <span className="table-count">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <table className="settings-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="member-cell">
                    <div className="member-avatar">{m.name.charAt(0)}</div>
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-email">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    className="table-role-select"
                    defaultValue={m.role}
                    aria-label={`Role for ${m.name}`}
                  >
                    <option>Viewer</option>
                    <option>Analyst</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </td>
                <td>
                  <SettingsBadge
                    label={m.status}
                    variant={
                      m.status === 'Active' ? 'success' :
                      m.status === 'Invited' ? 'neutral' : 'danger'
                    }
                  />
                </td>
                <td className="table-muted">{m.lastActive}</td>
                <td>
                  <button
                    type="button"
                    className="table-action-btn danger"
                    onClick={() => handleRemove(m.id, m.name)}
                    title={`Remove ${m.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════

const PERMS = [
  { key: 'view_documents',    label: 'View Documents & Datasets' },
  { key: 'upload_documents',  label: 'Upload Documents' },
  { key: 'run_analysis',      label: 'Run Analytical Queries' },
  { key: 'create_dashboards', label: 'Create Dashboards' },
  { key: 'manage_workflows',  label: 'Create & Manage Workflows' },
  { key: 'approve_actions',   label: 'Approve Governed Actions' },
  { key: 'execute_actions',   label: 'Execute Actions (ERP / External)' },
  { key: 'view_audit',        label: 'View Audit Trail' },
  { key: 'manage_members',    label: 'Manage Members & Roles' },
  { key: 'modify_settings',   label: 'Modify Workspace Settings' },
];

const ROLE_DEFAULTS: Record<string, Record<string, boolean>> = {
  Viewer:  { view_documents: true,  upload_documents: false, run_analysis: false, create_dashboards: false, manage_workflows: false, approve_actions: false, execute_actions: false, view_audit: false, manage_members: false, modify_settings: false },
  Analyst: { view_documents: true,  upload_documents: true,  run_analysis: true,  create_dashboards: true,  manage_workflows: false, approve_actions: false, execute_actions: false, view_audit: false, manage_members: false, modify_settings: false },
  Manager: { view_documents: true,  upload_documents: true,  run_analysis: true,  create_dashboards: true,  manage_workflows: true,  approve_actions: true,  execute_actions: false, view_audit: true,  manage_members: false, modify_settings: false },
  Admin:   { view_documents: true,  upload_documents: true,  run_analysis: true,  create_dashboards: true,  manage_workflows: true,  approve_actions: true,  execute_actions: true,  view_audit: true,  manage_members: true,  modify_settings: true },
};

const RolesSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [perms, setPerms] = useState(ROLE_DEFAULTS);
  const roles = ['Viewer', 'Analyst', 'Manager', 'Admin'];

  const toggle = (role: string, perm: string) => {
    setPerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }));
  };

  return (
    <div className="settings-section">
      <SectionHeader
        title="Roles & Permissions"
        subtitle="Define what each role is authorised to perform in this workspace."
      />

      <div className="settings-card no-padding">
        <div className="permissions-matrix">
          <table className="settings-table perms-table">
            <thead>
              <tr>
                <th className="perm-label-col">Permission</th>
                {roles.map((r) => (
                  <th key={r} className="role-col-header">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMS.map((p) => (
                <tr key={p.key}>
                  <td className="perm-label-cell">{p.label}</td>
                  {roles.map((r) => (
                    <td key={r} className="perm-toggle-cell">
                      <button
                        type="button"
                        className={`perm-check ${perms[r][p.key] ? 'granted' : 'denied'}`}
                        onClick={() => toggle(r, p.key)}
                        title={`${perms[r][p.key] ? 'Revoke' : 'Grant'} "${p.label}" for ${r}`}
                        aria-pressed={perms[r][p.key]}
                      >
                        {perms[r][p.key] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-callout-standalone">
        <Info size={13} />
        <span>
          Changes to role permissions take effect immediately for all current session holders.
          Role modifications are recorded in the immutable audit trail.
        </span>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline" onClick={() => setPerms(ROLE_DEFAULTS)}>
          <RotateCcw size={13} /> Reset to Defaults
        </button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('Roles & Permissions')}>
          <Save size={13} /> Save Permissions
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATA SOURCES
// ═══════════════════════════════════════════════════════════════════════════════

const DATA_SOURCES = [
  { id: 'ds1', name: 'SAP ERP Connector',          type: 'ERP',         status: 'Connected',    lastSync: '14 min ago',  records: '1.2M' },
  { id: 'ds2', name: 'Synaptix Vault (S3)',         type: 'Object Store', status: 'Connected',   lastSync: '5 min ago',   records: '247 files' },
  { id: 'ds3', name: 'AWS Billing CUR (S3)',        type: 'Dataset',     status: 'Connected',    lastSync: '1h ago',      records: '124,900 rows' },
  { id: 'ds4', name: 'Salesforce CRM',             type: 'CRM',         status: 'Disconnected', lastSync: '3d ago',      records: '—' },
  { id: 'ds5', name: 'PostgreSQL Data Warehouse',  type: 'Database',    status: 'Connected',    lastSync: '30 min ago',  records: '8.4M rows' },
];

const DataSourcesSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void; onAddToast: (m: string) => void }> = ({
  onAddToast,
}) => {
  const [sources] = useState(DATA_SOURCES);

  return (
    <div className="settings-section">
      <SectionHeader
        title="Data Sources"
        subtitle="Connected data systems that power this workspace."
      />

      <div className="settings-card no-padding">
        <div className="table-toolbar">
          <span className="card-section-label" style={{ margin: 0 }}>Active Connections</span>
          <button type="button" className="settings-btn-primary sm" onClick={() => onAddToast('Opening connector configuration…')}>
            <Plus size={13} /> Add Source
          </button>
        </div>

        <table className="settings-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th>Records</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td className="source-name-cell">{s.name}</td>
                <td>
                  <span className="source-type-chip">{s.type}</span>
                </td>
                <td>
                  <SettingsBadge
                    label={s.status}
                    variant={s.status === 'Connected' ? 'success' : 'danger'}
                  />
                </td>
                <td className="table-muted">{s.lastSync}</td>
                <td className="table-muted mono">{s.records}</td>
                <td>
                  <div className="table-actions-row">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => onAddToast(`Syncing ${s.name}…`)}
                      title="Sync now"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => onAddToast(`Editing ${s.name} configuration`)}
                      title="Edit"
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const AISection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [provider, setProvider] = useState('Google Gemini 2.5');
  const [model, setModel]       = useState('gemini-2.5-flash');
  const [contextWindow, setContextWindow] = useState('128000');
  const [temperature, setTemperature]     = useState('0.15');
  const [retrievalK, setRetrievalK]       = useState('8');
  const [embedModel, setEmbedModel]       = useState('synaptix-embed-v3');
  const [hybridSearch, setHybridSearch]   = useState(true);
  const [rerank, setRerank]               = useState(true);
  const [citations, setCitations]         = useState(true);
  const [streaming, setStreaming]         = useState(true);

  // Live Gemini Health State
  const [geminiHealth, setGeminiHealth] = useState<GeminiHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    geminiClient.checkHealth().then(setGeminiHealth).catch(() => {});
  }, []);

  const handleTestGemini = async () => {
    setIsCheckingHealth(true);
    try {
      const status = await geminiClient.checkHealth(true);
      setGeminiHealth(status);
    } catch {
      // ignore
    } finally {
      setIsCheckingHealth(false);
    }
  };

  return (
    <div className="settings-section">
      <SectionHeader
        title="AI Configuration"
        subtitle="Language model, retrieval pipeline and reasoning settings."
      />

      {/* Live Gemini Provider Health Status */}
      <div className="settings-card" style={{ borderLeft: geminiHealth?.isConfigured ? '3px solid #10b981' : '3px solid #f59e0b' }}>
        <div className="card-section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Gemini Intelligence Provider (Server-Side)</span>
          <button
            type="button"
            className="settings-btn-outline sm"
            onClick={handleTestGemini}
            disabled={isCheckingHealth}
          >
            <RotateCcw size={12} className={isCheckingHealth ? 'spin' : ''} />
            {isCheckingHealth ? 'Testing Connection...' : 'Test Connection'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ fontWeight: 600 }}>Status:</span>
            {geminiHealth?.isConfigured ? (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Active & Configured ({geminiHealth.model})
              </span>
            ) : (
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> Unconfigured — Set GEMINI_API_KEY in .env.local
              </span>
            )}
          </div>
          {geminiHealth?.latencyMs !== undefined && (
            <div style={{ fontSize: '12px', color: 'var(--c-text-3)' }}>
              Provider Ping Latency: <span className="mono">{geminiHealth.latencyMs}ms</span> (Checked: {new Date(geminiHealth.lastChecked).toLocaleTimeString()})
            </div>
          )}
          {geminiHealth?.error && (
            <div style={{ fontSize: '12px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '6px 10px', borderRadius: '4px' }}>
              {geminiHealth.error}
            </div>
          )}
        </div>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Model & Provider</div>
        <SettingRow label="Inference Provider" hint="Where model inference is executed.">
          <select className="settings-select" value={provider} onChange={(e) => setProvider(e.target.value)} id="ai-provider">
            <option>Google Gemini 2.5</option>
            <option>Internal Synaptix Engine</option>
            <option>Azure OpenAI (Enterprise)</option>
            <option>AWS Bedrock</option>
          </select>
        </SettingRow>

        <SettingRow label="Primary Model" hint="Used for reasoning, planning and responses.">
          <select className="settings-select" value={model} onChange={(e) => setModel(e.target.value)} id="ai-model">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="synaptix-enterprise-v4">Synaptix Enterprise v4</option>
          </select>
        </SettingRow>

        <SettingRow label="Temperature" hint="Lower values produce more deterministic outputs (0.0–1.0).">
          <div className="input-with-suffix">
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              className="settings-input narrow"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              id="ai-temp"
            />
            <span className="input-suffix">0 – 1</span>
          </div>
        </SettingRow>

        <SettingRow label="Context Window" hint="Maximum token context passed to the model." divider={false}>
          <select className="settings-select" value={contextWindow} onChange={(e) => setContextWindow(e.target.value)} id="ai-context">
            <option value="32000">32,000 tokens</option>
            <option value="64000">64,000 tokens</option>
            <option value="128000">128,000 tokens</option>
            <option value="1000000">1,000,000 tokens (Gemini 2.5)</option>
          </select>
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Retrieval Pipeline</div>
        <SettingRow label="Embedding Model" hint="Used for document indexing and similarity search.">
          <select className="settings-select" value={embedModel} onChange={(e) => setEmbedModel(e.target.value)} id="ai-embed">
            <option>synaptix-embed-v3</option>
            <option>text-embedding-3-large</option>
            <option>gecko-text-embedding-004</option>
          </select>
        </SettingRow>

        <SettingRow label="Top-K Retrieved Chunks" hint="Number of evidence passages retrieved per query.">
          <input
            type="number"
            min="1"
            max="20"
            className="settings-input narrow"
            value={retrievalK}
            onChange={(e) => setRetrievalK(e.target.value)}
            id="ai-topk"
          />
        </SettingRow>

        <SettingRow label="Hybrid Search" hint="Combines dense vector search with BM25 keyword matching.">
          <Toggle id="toggle-hybrid" checked={hybridSearch} onChange={setHybridSearch} />
        </SettingRow>

        <SettingRow label="Semantic Re-ranking" hint="Applies a cross-encoder to re-rank retrieved results.">
          <Toggle id="toggle-rerank" checked={rerank} onChange={setRerank} />
        </SettingRow>

        <SettingRow label="Auto-Citations" hint="Automatically attach source references to all responses." divider={false}>
          <Toggle id="toggle-citations" checked={citations} onChange={setCitations} />
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Response Behaviour</div>
        <SettingRow label="Streaming Responses" hint="Stream tokens progressively rather than waiting for full completion." divider={false}>
          <Toggle id="toggle-streaming" checked={streaming} onChange={setStreaming} />
        </SettingRow>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline">
          <RotateCcw size={13} /> Reset to Defaults
        </button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('AI Configuration')}>
          <Save size={13} /> Save Configuration
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// POLICIES
// ═══════════════════════════════════════════════════════════════════════════════

const PoliciesSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [requireApprovalLow, setRequireApprovalLow]   = useState(false);
  const [requireApprovalMed, setRequireApprovalMed]   = useState(true);
  const [requireApprovalHigh, setRequireApprovalHigh] = useState(true);
  const [requireApprovalCrit, setRequireApprovalCrit] = useState(true);
  const [allowedTools, setAllowedTools] = useState({
    erp_write:   true,
    file_export: true,
    email_send:  true,
    api_post:    false,
    db_delete:   false,
  });
  const [dataAccessScope, setDataAccessScope] = useState('workspace_only');

  return (
    <div className="settings-section">
      <SectionHeader
        title="Policies"
        subtitle="Approval requirements, tool access and data access policies."
      />

      <div className="settings-card">
        <div className="card-section-label">Approval Requirements by Risk Tier</div>
        <SettingRow label="Low Risk Actions" hint="e.g. generating a report, read-only analysis.">
          <Toggle id="pol-low" checked={requireApprovalLow} onChange={setRequireApprovalLow} />
        </SettingRow>
        <SettingRow label="Medium Risk Actions" hint="e.g. document export, dashboard publish.">
          <Toggle id="pol-med" checked={requireApprovalMed} onChange={setRequireApprovalMed} />
        </SettingRow>
        <SettingRow label="High Risk Actions" hint="e.g. vendor payment modification, data deletion.">
          <Toggle id="pol-high" checked={requireApprovalHigh} onChange={setRequireApprovalHigh} />
        </SettingRow>
        <SettingRow label="Critical Risk Actions" hint="e.g. ERP write, irreversible financial posting." divider={false}>
          <Toggle id="pol-crit" checked={requireApprovalCrit} onChange={setRequireApprovalCrit} />
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Allowed Execution Tools</div>
        {Object.entries(allowedTools).map(([key, val], idx, arr) => (
          <SettingRow
            key={key}
            label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            hint={key === 'db_delete' ? 'Irreversible — requires CFO approval if enabled' : undefined}
            divider={idx < arr.length - 1}
          >
            <Toggle
              id={`tool-${key}`}
              checked={val}
              onChange={(v) => setAllowedTools((p) => ({ ...p, [key]: v }))}
            />
          </SettingRow>
        ))}
      </div>

      <div className="settings-card">
        <div className="card-section-label">Data Access Scope</div>
        <SettingRow label="Access Boundary" hint="Defines what data AI agents can access." divider={false}>
          <select
            className="settings-select"
            value={dataAccessScope}
            onChange={(e) => setDataAccessScope(e.target.value)}
            id="pol-access"
          >
            <option value="workspace_only">This Workspace Only</option>
            <option value="org_shared">Organisation Shared Data</option>
            <option value="public">Public + Workspace</option>
          </select>
        </SettingRow>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline"><RotateCcw size={13} /> Discard</button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('Policies')}>
          <Save size={13} /> Save Policies
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// RISK CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════

const RiskSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [maxAutoExecute, setMaxAutoExecute]   = useState('LOW');
  const [planHashCheck, setPlanHashCheck]     = useState(true);
  const [stepUpAuth, setStepUpAuth]           = useState(true);
  const [rollbackEnabled, setRollbackEnabled] = useState(true);
  const [sandboxDryRun, setSandboxDryRun]     = useState(true);
  const [anomalyBlock, setAnomalyBlock]       = useState(false);

  return (
    <div className="settings-section">
      <SectionHeader
        title="Risk Controls"
        subtitle="Thresholds and safeguards governing execution and approval."
      />

      <div className="settings-card">
        <div className="card-section-label">Execution Thresholds</div>
        <SettingRow
          label="Maximum Auto-Execute Tier"
          hint="Actions above this tier require explicit human approval."
        >
          <select
            className="settings-select"
            value={maxAutoExecute}
            onChange={(e) => setMaxAutoExecute(e.target.value)}
            id="risk-autoexec"
          >
            <option value="INFO">Info only (most restrictive)</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High (least restrictive)</option>
          </select>
        </SettingRow>

        <SettingRow label="Plan Hash Verification" hint="Re-verify plan integrity before execution begins.">
          <Toggle id="risk-hash" checked={planHashCheck} onChange={setPlanHashCheck} />
        </SettingRow>

        <SettingRow
          label="Step-Up Authentication"
          hint="Require additional auth (hardware key or biometric) for critical actions."
        >
          <Toggle id="risk-stepup" checked={stepUpAuth} onChange={setStepUpAuth} />
        </SettingRow>

        <SettingRow label="Rollback on Failure" hint="Automatically attempt rollback if execution fails." divider={false}>
          <Toggle id="risk-rollback" checked={rollbackEnabled} onChange={setRollbackEnabled} />
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Safety Mechanisms</div>
        <SettingRow label="Sandboxed Dry Run" hint="Simulate all actions in sandbox before live execution.">
          <Toggle id="risk-sandbox" checked={sandboxDryRun} onChange={setSandboxDryRun} />
        </SettingRow>
        <SettingRow
          label="Block on Anomaly Detection"
          hint="Halt execution if anomaly detection flags unexpected data patterns."
          divider={false}
        >
          <Toggle id="risk-anomaly" checked={anomalyBlock} onChange={setAnomalyBlock} />
        </SettingRow>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline"><RotateCcw size={13} /> Discard</button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('Risk Controls')}>
          <Save size={13} /> Save Controls
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const INTEGRATIONS = [
  { id: 'i1', name: 'SAP S/4HANA',          category: 'ERP',           status: 'Connected',    icon: '🔗' },
  { id: 'i2', name: 'Microsoft Teams',       category: 'Collaboration', status: 'Connected',    icon: '💬' },
  { id: 'i3', name: 'Slack',                category: 'Collaboration', status: 'Disconnected', icon: '💬' },
  { id: 'i4', name: 'Jira',                 category: 'Project Mgmt',  status: 'Disconnected', icon: '🎯' },
  { id: 'i5', name: 'AWS CloudWatch',       category: 'Monitoring',    status: 'Connected',    icon: '📡' },
  { id: 'i6', name: 'DocuSign',             category: 'e-Signature',   status: 'Connected',    icon: '✍️' },
];

const IntegrationsSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void; onAddToast: (m: string) => void }> = ({
  onAddToast,
}) => {
  const [integrations] = useState(INTEGRATIONS);

  return (
    <div className="settings-section">
      <SectionHeader
        title="Integrations"
        subtitle="Enterprise system connections available in this workspace."
      />

      <div className="integrations-grid">
        {integrations.map((item) => (
          <div key={item.id} className="integration-card">
            <div className="int-card-top">
              <span className="int-icon">{item.icon}</span>
              <SettingsBadge
                label={item.status}
                variant={item.status === 'Connected' ? 'success' : 'neutral'}
              />
            </div>
            <div className="int-name">{item.name}</div>
            <div className="int-category">{item.category}</div>
            <button
              type="button"
              className={`int-btn ${item.status === 'Connected' ? 'connected' : 'disconnected'}`}
              onClick={() =>
                onAddToast(
                  item.status === 'Connected'
                    ? `Disconnecting ${item.name}…`
                    : `Connecting to ${item.name}…`
                )
              }
            >
              {item.status === 'Connected' ? 'Configure' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const NotificationsSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [prefs, setPrefs] = useState({
    action_approval:  true,
    action_completed: true,
    action_failed:    true,
    anomaly:          true,
    evidence_update:  false,
    member_join:      true,
    report_ready:     false,
    weekly_summary:   true,
  });

  const rows: { key: keyof typeof prefs; label: string; hint?: string }[] = [
    { key: 'action_approval',  label: 'Action Approval Required',   hint: 'When an action in your workspace needs approval.' },
    { key: 'action_completed', label: 'Action Completed',           hint: 'When an executed action completes successfully.' },
    { key: 'action_failed',    label: 'Action Failed or Rolled Back' },
    { key: 'anomaly',          label: 'Anomaly Detected',           hint: 'When anomaly detection raises a flag.' },
    { key: 'evidence_update',  label: 'Evidence Grade Changed' },
    { key: 'member_join',      label: 'Member Added to Workspace' },
    { key: 'report_ready',     label: 'Report / Dashboard Ready',   hint: 'When an auto-generated report is available.' },
    { key: 'weekly_summary',   label: 'Weekly Activity Summary',    hint: 'Delivered every Monday morning.' },
  ];

  return (
    <div className="settings-section">
      <SectionHeader
        title="Notifications"
        subtitle="Control which workspace events trigger notifications."
      />

      <div className="settings-card">
        {rows.map(({ key, label, hint }, idx) => (
          <SettingRow key={key} label={label} hint={hint} divider={idx < rows.length - 1}>
            <Toggle
              id={`notif-${key}`}
              checked={prefs[key]}
              onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
            />
          </SettingRow>
        ))}
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-primary" onClick={() => onSave('Notifications')}>
          <Save size={13} /> Save Preferences
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// RETENTION
// ═══════════════════════════════════════════════════════════════════════════════

const RetentionSection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [auditRetention,  setAuditRetention]  = useState('7_years');
  const [docRetention,    setDocRetention]    = useState('5_years');
  const [sessionRetention, setSessionRetention] = useState('90_days');
  const [autoArchive,     setAutoArchive]     = useState(true);
  const [immutableLog,    setImmutableLog]    = useState(true);

  return (
    <div className="settings-section">
      <SectionHeader
        title="Retention"
        subtitle="Data retention schedules for audit logs, documents and sessions."
      />

      <div className="settings-card">
        <div className="card-section-label">Retention Periods</div>
        <SettingRow label="Audit Trail Retention" hint="Minimum 7 years recommended for financial compliance.">
          <select
            className="settings-select"
            value={auditRetention}
            onChange={(e) => setAuditRetention(e.target.value)}
            id="ret-audit"
          >
            <option value="1_year">1 Year</option>
            <option value="3_years">3 Years</option>
            <option value="5_years">5 Years</option>
            <option value="7_years">7 Years</option>
            <option value="10_years">10 Years</option>
            <option value="indefinite">Indefinite</option>
          </select>
        </SettingRow>

        <SettingRow label="Document & Dataset Retention" hint="Duration documents are retained after upload.">
          <select
            className="settings-select"
            value={docRetention}
            onChange={(e) => setDocRetention(e.target.value)}
            id="ret-docs"
          >
            <option value="1_year">1 Year</option>
            <option value="3_years">3 Years</option>
            <option value="5_years">5 Years</option>
            <option value="7_years">7 Years</option>
            <option value="indefinite">Indefinite</option>
          </select>
        </SettingRow>

        <SettingRow label="Session Log Retention" hint="How long user session logs are retained." divider={false}>
          <select
            className="settings-select"
            value={sessionRetention}
            onChange={(e) => setSessionRetention(e.target.value)}
            id="ret-session"
          >
            <option value="30_days">30 Days</option>
            <option value="90_days">90 Days</option>
            <option value="180_days">180 Days</option>
            <option value="1_year">1 Year</option>
          </select>
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Archiving & Immutability</div>
        <SettingRow label="Auto-Archive Inactive Documents" hint="Move documents to cold storage after 12 months of inactivity.">
          <Toggle id="ret-archive" checked={autoArchive} onChange={setAutoArchive} />
        </SettingRow>
        <SettingRow label="Immutable Audit Log" hint="Prevents modification or deletion of any audit event." divider={false}>
          <Toggle id="ret-immutable" checked={immutableLog} onChange={setImmutableLog} />
        </SettingRow>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline"><RotateCcw size={13} /> Discard</button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('Retention')}>
          <Save size={13} /> Save Retention Policy
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY
// ═══════════════════════════════════════════════════════════════════════════════

const SecuritySection: React.FC<{ workspace: WorkspaceItem; onSave: (s: string) => void }> = ({ onSave }) => {
  const [piiRedaction,     setPiiRedaction]     = useState(true);
  const [piiMasking,       setPiiMasking]       = useState(true);
  const [externalModel,    setExternalModel]    = useState(false);
  const [sessionTimeout,   setSessionTimeout]   = useState('480');
  const [mfaRequired,      setMfaRequired]      = useState(true);
  const [ipAllowList,      setIpAllowList]       = useState(true);
  const [encryptAtRest,    setEncryptAtRest]    = useState(true);
  const [encryptInTransit, setEncryptInTransit] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="settings-section">
      <SectionHeader
        title="Security"
        subtitle="Data privacy, access controls and cryptographic settings."
      />

      <div className="settings-card">
        <div className="card-section-label">PII Handling</div>
        <SettingRow
          label="PII Auto-Redaction"
          hint="Automatically detect and redact PII from AI responses."
        >
          <Toggle id="sec-pii-redact" checked={piiRedaction} onChange={setPiiRedaction} />
        </SettingRow>
        <SettingRow
          label="PII Masking in Logs"
          hint="Mask personally identifiable information in audit and session logs."
          divider={false}
        >
          <Toggle id="sec-pii-mask" checked={piiMasking} onChange={setPiiMasking} />
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">External Model Restrictions</div>
        <SettingRow
          label="Allow External Model Providers"
          hint="If off, all inference runs on internal or privately-hosted infrastructure only."
          divider={false}
        >
          <Toggle id="sec-external" checked={externalModel} onChange={setExternalModel} />
        </SettingRow>
        {externalModel && (
          <div className="warning-callout">
            <AlertTriangle size={14} />
            <span>
              Enabling external providers may transmit workspace data outside your enterprise boundary.
              Ensure your DPA and data residency requirements permit this.
            </span>
          </div>
        )}
      </div>

      <div className="settings-card">
        <div className="card-section-label">Session Controls</div>
        <SettingRow label="Session Timeout" hint="Idle sessions will be terminated after this period.">
          <div className="input-with-suffix">
            <input
              type="number"
              min="30"
              step="30"
              className="settings-input narrow"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              id="sec-timeout"
            />
            <span className="input-suffix">minutes</span>
          </div>
        </SettingRow>
        <SettingRow label="MFA Required" hint="Require multi-factor authentication for all workspace access." divider={false}>
          <Toggle id="sec-mfa" checked={mfaRequired} onChange={setMfaRequired} />
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">Network & Encryption</div>
        <SettingRow label="IP Allow-List Enforcement" hint="Restrict access to known corporate network ranges.">
          <Toggle id="sec-ip" checked={ipAllowList} onChange={setIpAllowList} />
        </SettingRow>
        <SettingRow label="Encrypt Data at Rest" hint="AES-256 encryption for all stored documents and datasets.">
          <Toggle id="sec-rest" checked={encryptAtRest} onChange={setEncryptAtRest} />
        </SettingRow>
        <SettingRow label="Encrypt Data in Transit" hint="TLS 1.3 enforced on all API and data transfer channels." divider={false}>
          <Toggle id="sec-transit" checked={encryptInTransit} onChange={setEncryptInTransit} />
        </SettingRow>
      </div>

      <div className="settings-card">
        <div className="card-section-label">API Credentials</div>
        <SettingRow label="Workspace API Key" hint="Used for programmatic access to workspace APIs." divider={false}>
          <div className="api-key-row">
            <code className="api-key-value">
              {showApiKey ? 'sk-syp-ent-••••••••••••••••8a4f' : '•••••••••••••••••••••••••••••••'}
            </code>
            <button
              type="button"
              className="table-action-btn"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? 'Hide API key' : 'Reveal API key'}
            >
              {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button type="button" className="table-action-btn" title="Rotate API key">
              <RotateCcw size={13} />
            </button>
          </div>
        </SettingRow>
      </div>

      <div className="settings-footer-actions">
        <button type="button" className="settings-btn-outline"><RotateCcw size={13} /> Discard</button>
        <button type="button" className="settings-btn-primary" onClick={() => onSave('Security')}>
          <Save size={13} /> Save Security Settings
        </button>
      </div>
    </div>
  );
};

// suppress unused import warnings — icon imported for completeness
const _unused = [MoreHorizontal, User];
void _unused;
