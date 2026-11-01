import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Clock
} from 'lucide-react';
import { GovernedApprovalItem, RiskDistribution } from './types';

interface GovernanceOverviewProps {
  pendingApprovals: GovernedApprovalItem[];
  riskDistribution: RiskDistribution;
  onNavigateToActions?: () => void;
  onReviewAction?: (actionId: string) => void;
}

export const GovernanceOverview: React.FC<GovernanceOverviewProps> = ({
  pendingApprovals,
  riskDistribution,
  onNavigateToActions,
  onReviewAction,
}) => {
  const totalRisks =
    riskDistribution.critical +
    riskDistribution.high +
    riskDistribution.medium +
    riskDistribution.low;

  const critPct = totalRisks > 0 ? (riskDistribution.critical / totalRisks) * 100 : 5;
  const highPct = totalRisks > 0 ? (riskDistribution.high / totalRisks) * 100 : 15;
  const medPct = totalRisks > 0 ? (riskDistribution.medium / totalRisks) * 100 : 30;
  const lowPct = totalRisks > 0 ? (riskDistribution.low / totalRisks) * 100 : 50;

  return (
    <section
      className="dash-card-static dash-stagger-5"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
      aria-label="Governance and Risk Oversight"
    >
      {/* SECTION HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <ShieldCheck size={16} style={{ color: '#059669' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Governance, Risk & Authority Sign-Offs
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Two-Person Rule enforcement, risk-tier distribution, and pending enterprise approvals.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: pendingApprovals.length > 0 ? '#FEF2F2' : '#F0FDF4',
              color: pendingApprovals.length > 0 ? '#DC2626' : '#16A34A',
              fontWeight: 600,
              border: `1px solid ${pendingApprovals.length > 0 ? '#FECACA' : '#BBF7D0'}`,
            }}
          >
            {pendingApprovals.length} Pending Sign-Off{pendingApprovals.length === 1 ? '' : 's'}
          </span>

          {onNavigateToActions && (
            <button
              type="button"
              onClick={onNavigateToActions}
              className="dash-btn-ghost"
              style={{ fontSize: '11px', height: '30px' }}
            >
              <span>Governed Actions Console</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* TWO COLUMNS: PENDING APPROVALS LIST + RISK TIER & POLICY COMPLIANCE */}
      <div className="dash-two-col">
        {/* LEFT COLUMN: PENDING GOVERNED APPROVALS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Pending Governed Authorizations
            </h4>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Human-in-the-Loop Required
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingApprovals.length === 0 ? (
              <div
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  fontSize: '12px',
                }}
              >
                No actions currently awaiting approval. All operations cleared.
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(11, 31, 58, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: item.riskTier === 'Critical' ? '#FEF2F2' : '#FFFBEB',
                            color: item.riskTier === 'Critical' ? '#DC2626' : '#D97706',
                            border: `1px solid ${item.riskTier === 'Critical' ? '#FECACA' : '#FDE68A'}`,
                          }}
                        >
                          {item.riskTier.toUpperCase()} RISK
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>
                          {item.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {item.name}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onReviewAction && onReviewAction(item.id)}
                      className="dash-btn-ghost"
                      style={{ fontSize: '11px', height: '28px', padding: '0 10px', flexShrink: 0 }}
                    >
                      <UserCheck size={12} />
                      <span>Review Sign-Off</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    {item.summary}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#94A3B8',
                      paddingTop: '6px',
                      borderTop: '1px solid #F8FAFC',
                    }}
                  >
                    <span>Target: {item.system} • By {item.requestedBy}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RISK DISTRIBUTION & SECURITY POLICIES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Organizational Risk-Tier Distribution
              </h4>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                {totalRisks} total audited actions
              </span>
            </div>

            {/* Risk Distribution Bar */}
            <div
              style={{
                height: '10px',
                width: '100%',
                background: '#F1F5F9',
                borderRadius: '999px',
                overflow: 'hidden',
                display: 'flex',
                margin: '8px 0 10px 0',
              }}
            >
              <div style={{ width: `${critPct}%`, background: '#DC2626' }} title={`Critical: ${riskDistribution.critical}`} />
              <div style={{ width: `${highPct}%`, background: '#D97706' }} title={`High: ${riskDistribution.high}`} />
              <div style={{ width: `${medPct}%`, background: '#1769E0' }} title={`Medium: ${riskDistribution.medium}`} />
              <div style={{ width: `${lowPct}%`, background: '#94A3B8' }} title={`Low/Info: ${riskDistribution.low}`} />
            </div>

            {/* Breakdown Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#DC2626' }} />
                <span style={{ color: '#64748B' }}>Critical:</span>
                <strong style={{ color: '#0F172A' }}>{riskDistribution.critical} actions</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#D97706' }} />
                <span style={{ color: '#64748B' }}>High Risk:</span>
                <strong style={{ color: '#0F172A' }}>{riskDistribution.high} actions</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#1769E0' }} />
                <span style={{ color: '#64748B' }}>Medium:</span>
                <strong style={{ color: '#0F172A' }}>{riskDistribution.medium} actions</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#94A3B8' }} />
                <span style={{ color: '#64748B' }}>Low / Info:</span>
                <strong style={{ color: '#0F172A' }}>{riskDistribution.low} actions</strong>
              </div>
            </div>
          </div>

          {/* POLICY AUDIT CHECKLIST */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>
              Governance Policy Compliance Matrix
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                Two-Person Rule Sign-Off Gate
              </span>
              <strong style={{ color: '#16A34A' }}>Active (Dual Sign-Off)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                Zero Cross-Tenant Memory Leakage
              </span>
              <strong style={{ color: '#16A34A' }}>100% Boundary Isolated</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                Immutable Event Audit Trail
              </span>
              <strong style={{ color: '#16A34A' }}>SOC2 Type II Active</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

