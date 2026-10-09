import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConfidenceIndicator } from './StatusBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtitle,
  icon,
}) => {
  return (
    <div className="ds-metric-card">
      <div className="metric-card-top">
        <span className="metric-card-title">{title}</span>
        {icon && <div className="metric-card-icon">{icon}</div>}
      </div>

      <div className="metric-card-body">
        <span className="metric-card-value">{value}</span>
        {change && (
          <div className={`metric-change-badge ${changeType}`}>
            {changeType === 'positive' ? (
              <TrendingUp size={12} />
            ) : changeType === 'negative' ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && <p className="metric-card-subtitle">{subtitle}</p>}
    </div>
  );
};

interface InsightCardProps {
  title: string;
  domain: string;
  summary: string;
  confidenceScore: number;
  evidenceCount?: number;
  onActionClick?: () => void;
  actionText?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  domain,
  summary,
  confidenceScore,
  evidenceCount = 3,
  onActionClick,
  actionText = 'Explore Reasoning',
}) => {
  return (
    <div className="ds-insight-card">
      <div className="insight-card-header">
        <div className="insight-title-group">
          <Sparkles size={16} className="insight-sparkle-icon" />
          <span className="insight-domain-pill">{domain} Domain</span>
        </div>
        <ConfidenceIndicator score={confidenceScore} />
      </div>

      <h4 className="insight-card-heading">{title}</h4>
      <p className="insight-card-summary">{summary}</p>

      <div className="insight-card-footer">
        <div className="insight-evidence-count">
          <ShieldCheck size={14} className="evidence-icon" />
          <span>{evidenceCount} Verified Sources</span>
        </div>

        {onActionClick && (
          <button type="button" onClick={onActionClick} className="insight-action-btn">
            <span>{actionText}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
