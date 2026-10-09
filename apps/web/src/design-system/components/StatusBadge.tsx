import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export type StatusType = 'completed' | 'pending' | 'in_progress' | 'error' | 'verified' | 'draft';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
      case 'verified':
        return {
          icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
          text: label || 'Completed',
          className: 'badge-status-success'
        };
      case 'pending':
        return {
          icon: <Clock size={size === 'sm' ? 12 : 14} />,
          text: label || 'Pending Review',
          className: 'badge-status-warning'
        };
      case 'in_progress':
        return {
          icon: <Clock size={size === 'sm' ? 12 : 14} className="spin-icon" />,
          text: label || 'Processing',
          className: 'badge-status-info'
        };
      case 'error':
        return {
          icon: <AlertCircle size={size === 'sm' ? 12 : 14} />,
          text: label || 'Action Required',
          className: 'badge-status-error'
        };
      default:
        return {
          icon: <Clock size={size === 'sm' ? 12 : 14} />,
          text: label || 'Draft',
          className: 'badge-status-muted'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`status-badge-pill ${config.className} size-${size}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};

export const EvidenceBadge: React.FC<{ hash?: string; label?: string }> = ({ hash, label = 'Verified Evidence' }) => {
  return (
    <span className="evidence-badge-pill" title={hash ? `Cryptographic Hash: ${hash}` : 'Evidence Verified'}>
      <ShieldCheck size={13} className="evidence-shield" />
      <span>{label}</span>
      {hash && <span className="hash-preview">{hash.substring(0, 6)}...</span>}
    </span>
  );
};

export const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const getRiskStyle = () => {
    switch (level) {
      case 'low':
        return { label: 'Low Risk', class: 'risk-low', icon: <ShieldCheck size={12} /> };
      case 'medium':
        return { label: 'Medium Risk', class: 'risk-medium', icon: <AlertTriangle size={12} /> };
      case 'high':
        return { label: 'High Risk', class: 'risk-high', icon: <AlertCircle size={12} /> };
      case 'critical':
        return { label: 'Critical Risk', class: 'risk-critical', icon: <ShieldAlert size={12} /> };
    }
  };

  const config = getRiskStyle();

  return (
    <span className={`risk-badge-pill ${config.class}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const ConfidenceIndicator: React.FC<{ score: number; label?: string }> = ({ score, label }) => {
  const formattedScore = Math.min(100, Math.max(0, score));

  const getColorClass = () => {
    if (formattedScore >= 90) return 'high-confidence';
    if (formattedScore >= 75) return 'med-confidence';
    return 'low-confidence';
  };

  return (
    <div className="confidence-meter-wrapper" title={`Reasoning Confidence: ${formattedScore}%`}>
      <div className="confidence-meter-text">
        <span className="confidence-label">{label || 'AI Confidence'}</span>
        <span className="confidence-score">{formattedScore}%</span>
      </div>
      <div className="confidence-bar-bg">
        <div
          className={`confidence-bar-fill ${getColorClass()}`}
          style={{ width: `${formattedScore}%` }}
        />
      </div>
    </div>
  );
};
