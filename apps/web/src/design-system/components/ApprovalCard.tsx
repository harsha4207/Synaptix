import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Lock } from 'lucide-react';
import { RiskBadge, RiskLevel } from './StatusBadge';

interface ApprovalCardProps {
  id: string;
  actionTitle: string;
  domain: string;
  riskLevel: RiskLevel;
  targetSystem: string;
  requestedBy: string;
  timestamp: string;
  impactSummary: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  id,
  actionTitle,
  domain,
  riskLevel,
  targetSystem,
  requestedBy,
  timestamp,
  impactSummary,
  onApprove,
  onReject,
}) => {
  return (
    <div className="ds-approval-card">
      <div className="approval-header">
        <div className="approval-title-row">
          <Lock size={16} className="lock-icon" />
          <h4 className="approval-title">{actionTitle}</h4>
        </div>
        <RiskBadge level={riskLevel} />
      </div>

      <div className="approval-meta-row">
        <span className="approval-tag">{domain} Domain</span>
        <span className="approval-sep">•</span>
        <span className="approval-target">Target: {targetSystem}</span>
        <span className="approval-sep">•</span>
        <span className="approval-time">{timestamp}</span>
      </div>

      <p className="approval-impact-summary">{impactSummary}</p>

      <div className="approval-requester-info">
        <span>Requested by: <strong>{requestedBy}</strong></span>
        <span className="rbac-enforced-tag"><ShieldCheck size={12} /> RBAC Policy Enforced</span>
      </div>

      <div className="approval-actions-row">
        <button type="button" onClick={() => onReject(id)} className="btn-reject">
          <XCircle size={15} /> Reject Action
        </button>
        <button type="button" onClick={() => onApprove(id)} className="btn-approve">
          <CheckCircle2 size={15} /> Authorize & Execute
        </button>
      </div>
    </div>
  );
};
