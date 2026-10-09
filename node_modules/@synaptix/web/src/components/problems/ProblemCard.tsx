import React from 'react';
import {
  ShieldCheck,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ProblemItem } from './ProblemDetailDrawer';

interface ProblemCardProps {
  problem: ProblemItem;
  onOpenDetail: (problem: ProblemItem) => void;
}

const getCategoryBadgeClass = (cat: ProblemItem['category']) => {
  switch (cat) {
    case 'Critical':     return 'badge badge-danger';
    case 'Attention':    return 'badge badge-warning';
    case 'Investigation':return 'badge badge-blue';
    case 'Resolved':     return 'badge badge-success';
    default:             return 'badge badge-muted';
  }
};

const getCategoryDotStyle = (cat: ProblemItem['category']): React.CSSProperties => {
  switch (cat) {
    case 'Critical':      return { background: 'var(--c-danger)' };
    case 'Attention':     return { background: '#F59E0B' };
    case 'Investigation': return { background: 'var(--c-blue)' };
    case 'Resolved':      return { background: 'var(--c-success)' };
    default:              return { background: 'var(--c-text-3)' };
  }
};

const getCardAccent = (cat: ProblemItem['category']): React.CSSProperties => {
  switch (cat) {
    case 'Critical':      return { borderLeftColor: 'var(--c-danger)' };
    case 'Attention':     return { borderLeftColor: '#F59E0B' };
    case 'Investigation': return { borderLeftColor: 'var(--c-blue)' };
    case 'Resolved':      return { borderLeftColor: 'var(--c-success)' };
    default:              return {};
  }
};

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onOpenDetail }) => {
  return (
    <div
      onClick={() => onOpenDetail(problem)}
      className="problem-card"
      style={{ ...getCardAccent(problem.category), borderLeftWidth: '3px' }}
    >
      {/* Top Row */}
      <div className="problem-card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Category + Evidence + ID Badges */}
          <div className="problem-card-badges">
            <span className={getCategoryBadgeClass(problem.category)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span
                className="status-dot"
                style={{ ...getCategoryDotStyle(problem.category), animation: problem.category !== 'Resolved' ? 'pulse-dot 2s ease-in-out infinite' : undefined }}
              />
              {problem.category}
            </span>

            <span className="evidence-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={11} />
              {problem.evidenceGrade}
            </span>

            <span className="badge badge-muted font-mono">
              ID: {problem.id}
            </span>
          </div>

          {/* Title */}
          <h3 className="problem-title">{problem.title}</h3>
        </div>

        {/* Confidence Score */}
        <span className="badge badge-muted font-mono" style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
          Confidence: <strong style={{ color: 'var(--c-text-1)' }}>{problem.confidenceScore}%</strong>
        </span>
      </div>

      {/* Description */}
      <p className="problem-card-description">{problem.description}</p>

      {/* Key Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ background: 'var(--c-page)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: '8px 10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
            Detected Period
          </span>
          <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-1)', fontFamily: 'var(--font-mono)' }}>
            {problem.detectedPeriod}
          </strong>
        </div>

        <div style={{ background: 'var(--c-page)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: '8px 10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
            Financial Impact
          </span>
          <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--c-danger)', fontFamily: 'var(--font-mono)' }}>
            {problem.impact}
          </strong>
        </div>

        <div style={{ background: 'var(--c-page)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: '8px 10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
            Evidence Base
          </span>
          <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-1)' }}>
            {problem.supportingEvidence.length} Sources Verified
          </strong>
        </div>
      </div>

      {/* Footer */}
      <div className="problem-card-footer">
        <div className="problem-footer-left">
          <div className="problem-footer-item" style={{ color: 'var(--c-text-3)' }}>
            <Clock size={13} />
            <span>Last Signal: {problem.detectedTimestamp}</span>
          </div>
        </div>

        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--c-blue)', display: 'flex', alignItems: 'center', gap: '3px' }}>
          Investigate Problem
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
};
