import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Link2,
  CheckCircle2,
  ChevronRight,
  Database,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type CausationDistinction =
  | 'Observed'
  | 'Correlated'
  | 'Potential driver'
  | 'Verified explanation';

export interface InsightItem {
  id: string;
  title: string;
  distinction: CausationDistinction;
  period: string;
  magnitude: string;
  supportingData: string;
  confidenceScore: number;
  description: string;
  relatedMetrics: string[];
  evidenceGrade: string;
  actionableRecommendation?: string;
}

interface InsightPanelProps {
  insights: InsightItem[];
  onDrillDown: (insight: InsightItem) => void;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ insights, onDrillDown }) => {
  const getDistinctionStyle = (distinction: CausationDistinction) => {
    switch (distinction) {
      case 'Observed':
        return {
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          badgeVariant: 'blue' as const,
          icon: <Database style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Direct empirical observation from active dataset',
        };
      case 'Correlated':
        return {
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
          badgeVariant: 'warning' as const,
          icon: <Link2 style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Statistical co-variance (Does not prove causation)',
        };
      case 'Potential driver':
        return {
          bgColor: '#F5F3FF',
          borderColor: '#DDD6FE',
          badgeVariant: 'navy' as const,
          icon: <HelpCircle style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'High-probability explanatory candidate undergoing verification',
        };
      case 'Verified explanation':
        return {
          bgColor: '#EAF7EE',
          borderColor: '#C4EDCF',
          badgeVariant: 'success' as const,
          icon: <CheckCircle2 style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Root cause confirmed by multi-source cross-validation',
        };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--c-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--c-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--sp-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--sp-3)',
          borderBottom: '1px solid var(--c-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div
            style={{
              padding: 6,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(23, 105, 224, 0.08)',
              color: 'var(--c-blue)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--c-text-1)', margin: 0 }}>
              Automated AI Insights
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: 0 }}>
              Autonomous pattern recognition & rigor-checked governance
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            padding: '2px 8px',
            backgroundColor: 'var(--c-page)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text-2)',
          }}
        >
          {insights.length} Detected
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {insights.map((insight) => {
          const style = getDistinctionStyle(insight.distinction);

          return (
            <div
              key={insight.id}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${style.borderColor}`,
                backgroundColor: style.bgColor,
                padding: 'var(--sp-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    <h4 style={{ fontWeight: 700, color: 'var(--c-text-1)', fontSize: 'var(--text-sm)', margin: 0 }}>
                      {insight.title}
                    </h4>
                    <Badge variant={style.badgeVariant}>
                      {style.icon}
                      {insight.distinction}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-2)', lineHeight: 1.5, margin: 0 }}>
                    {insight.description}
                  </p>
                </div>

                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'var(--c-surface)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-text-1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ShieldCheck size={13} style={{ color: 'var(--c-success)' }} />
                  {insight.evidenceGrade}
                </span>
              </div>

              {/* Data points row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 'var(--sp-2)',
                  paddingTop: 'var(--sp-2)',
                  borderTop: `1px solid ${style.borderColor}`,
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ color: 'var(--c-text-3)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Period</span>
                  <strong style={{ color: 'var(--c-text-1)' }}>{insight.period}</strong>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ color: 'var(--c-text-3)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Magnitude</span>
                  <strong style={{ color: 'var(--c-text-1)' }}>{insight.magnitude}</strong>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ color: 'var(--c-text-3)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Supporting Data</span>
                  <strong style={{ color: 'var(--c-text-2)' }}>{insight.supportingData}</strong>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ color: 'var(--c-text-3)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Confidence</span>
                  <strong style={{ color: 'var(--c-blue)' }}>{insight.confidenceScore}%</strong>
                </div>
              </div>

              {insight.actionableRecommendation && (
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--c-text-1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--sp-2)',
                  }}
                >
                  <Sparkles size={15} style={{ color: 'var(--c-blue)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--c-text-1)' }}>Recommended Action: </strong>
                    {insight.actionableRecommendation}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ color: 'var(--c-text-3)', fontStyle: 'italic', fontSize: '11px' }}>{style.note}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDrillDown(insight)}
                  leftIcon={<FileSpreadsheet size={13} />}
                  rightIcon={<ChevronRight size={13} />}
                >
                  Drill Down to Data
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
