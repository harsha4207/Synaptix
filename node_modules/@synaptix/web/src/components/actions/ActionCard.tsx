import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  RotateCcw,
  Play,
  Check
} from 'lucide-react';
import { GovernedActionItem } from './ActionPreviewModal';

interface ActionCardProps {
  action: GovernedActionItem;
  onPreviewAction: (action: GovernedActionItem) => void;
  onQuickApprove?: (id: string) => void;
  onQuickExecute?: (id: string) => void;
  onRollback?: (id: string) => void;
}

const getRiskBadgeClass = (tier: GovernedActionItem['riskTier']) => {
  switch (tier) {
    case 'Critical': return 'risk-critical';
    case 'High':     return 'risk-high';
    case 'Medium':   return 'risk-medium';
    case 'Low':      return 'risk-low';
    default:         return 'risk-low';
  }
};

const getStatusBadge = (category: GovernedActionItem['statusCategory']) => {
  switch (category) {
    case 'Pending':
      return (
        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> Pending Approval
        </span>
      );
    case 'Approved':
      return (
        <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Check size={12} /> Approved
        </span>
      );
    case 'Running':
      return (
        <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} style={{ animation: 'spin 1s linear infinite' }} /> Running
        </span>
      );
    case 'Completed':
      return (
        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    case 'Failed':
      return (
        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldAlert size={12} /> Failed
        </span>
      );
    case 'Unknown':
      return (
        <span className="badge badge-warning" title="Inconclusive state" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} /> Unknown State
        </span>
      );
    case 'Rolled Back':
      return (
        <span className="badge" style={{ background: '#F5F3FF', color: '#7C3AED', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <RotateCcw size={12} /> Rolled Back
        </span>
      );
    default:
      return null;
  }
};

export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onPreviewAction,
  onQuickApprove,
  onQuickExecute,
  onRollback,
}) => {
  return (
    <div
      onClick={() => onPreviewAction(action)}
      className="agent-card"
      style={{ cursor: 'pointer' }}
    >
      {/* Top Row: Badges + Evidence Grade */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Status & Risk Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {getStatusBadge(action.statusCategory)}

            <span className={`risk-badge-pill ${getRiskBadgeClass(action.riskTier)}`}>
              {action.riskTier} Risk
            </span>

            <span className="badge badge-blue">
              {action.workspace} Workspace
            </span>

            <span
              className="badge font-mono"
              style={{
                background: action.isPlanValid ? 'var(--c-page)' : 'var(--c-danger-bg)',
                color: action.isPlanValid ? 'var(--c-text-2)' : 'var(--c-danger)',
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                border: `1px solid ${action.isPlanValid ? 'var(--c-border)' : 'var(--c-danger-border)'}`,
              }}
            >
              <Lock size={10} />
              {action.planHash} ({action.planVersion})
            </span>
          </div>

          {/* Action Title */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--c-text-1)', lineHeight: 1.3 }}>
            {action.name}
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-2)' }}>
            Requested by: <strong style={{ color: 'var(--c-text-1)' }}>{action.requestedBy}</strong>
            {' '}|{' '}
            ID: <span className="font-mono">{action.id}</span>
          </p>
        </div>

        {/* Evidence Grade */}
        <span className="evidence-badge-pill" style={{ flexShrink: 0 }}>
          <ShieldCheck size={12} />
          {action.evidenceGrade}
        </span>
      </div>

      {/* Changes Summary */}
      <div style={{
        background: 'var(--c-page)',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-md)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
      }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: 'var(--font-mono)' }}>
          Changes &amp; State Mutations
        </span>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-2)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
          {action.changesSummary}
        </p>
      </div>

      {/* Affected Systems + Verification */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const, fontSize: 'var(--text-xs)' }}>
          <span style={{ color: 'var(--c-text-3)', fontWeight: 500 }}>Affected Systems:</span>
          {action.affectedSystems.map((sys) => (
            <span key={sys} className="badge badge-muted font-mono" style={{ fontSize: '11px' }}>
              {sys}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)', flexShrink: 0, textAlign: 'right' as const }}>
          Verification: <strong style={{ color: 'var(--c-text-1)' }}>{action.verificationStatus}</strong>
        </div>
      </div>

      {/* Footer: Reversibility + Action Buttons */}
      <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ fontSize: '11px', color: 'var(--c-text-2)', fontStyle: 'italic' }}>
          Reversibility: <strong style={{ fontStyle: 'normal', color: 'var(--c-text-1)' }}>{action.reversibility}</strong>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {action.statusCategory === 'Pending' && onQuickApprove && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              style={{ background: 'var(--c-success-bg)', color: 'var(--c-success)', borderColor: 'var(--c-success-border)' }}
              onClick={(e) => { e.stopPropagation(); onQuickApprove(action.id); }}
            >
              <Check size={13} /> Approve
            </button>
          )}

          {action.statusCategory === 'Approved' && onQuickExecute && (
            <button
              type="button"
              className="btn-blue btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onClick={(e) => { e.stopPropagation(); onQuickExecute(action.id); }}
            >
              <Play size={13} /> Execute
            </button>
          )}

          {action.statusCategory === 'Completed' && onRollback && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              style={{ color: '#7C3AED', borderColor: '#DDD6FE', background: '#F5F3FF' }}
              onClick={(e) => { e.stopPropagation(); onRollback(action.id); }}
            >
              <RotateCcw size={13} /> Rollback
            </button>
          )}

          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--c-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Preview Plan <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};
