import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, LogOut } from 'lucide-react';

interface WorkspacePreviewModalProps {
  isOpen: boolean;
  userEmail: string;
  authMode: 'login' | 'signup' | 'google';
  onSignOut: () => void;
}

export const WorkspacePreviewModal: React.FC<WorkspacePreviewModalProps> = ({
  isOpen,
  userEmail,
  authMode,
  onSignOut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }}>
      <div className="modal-content" style={{ maxWidth: '520px', padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(23, 105, 224, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Authenticated to Synaptix Command
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {authMode === 'signup' ? 'Enterprise Account Created' : 'Active Enterprise Session'}
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Logged in as</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)' }}>{userEmail || 'enterprise.admin@company.com'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-blue)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Cpu size={16} /> Reasoning Engines
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>v2.4 Ready</div>
          </div>

          <div style={{ padding: '0.85rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent-blue)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <Database size={16} /> Knowledge Graph
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Connected</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          <Activity size={14} style={{ color: 'var(--color-success)' }} />
          <span>Security Token Issued • SSO SAML 2.0 Compliant</span>
        </div>

        <button
          onClick={onSignOut}
          className="btn-primary"
          style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', boxShadow: 'none' }}
        >
          <LogOut size={16} /> Sign out & Return to Auth Landing Page
        </button>
      </div>
    </div>
  );
};
