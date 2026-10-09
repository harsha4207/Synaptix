import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  TrendingDown,
  FileText,
  CheckCircle2,
  HelpCircle,
  Link2,
  BarChart3,
  Workflow,
  UserPlus,
  Sparkles,
  Database,
  Check
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export type RigorClassification =
  | 'Observed data'
  | 'Correlation'
  | 'Possible factor'
  | 'Verified evidence'
  | 'External market factor'
  | 'Root cause confirmed';

export interface ProblemItem {
  id: string;
  title: string;
  category: 'Critical' | 'Attention' | 'Investigation' | 'Resolved';
  severity: 'High' | 'Medium' | 'Low' | 'Critical';
  description: string;
  detectedPeriod: string;
  detectedTimestamp: string;
  impact: string;
  evidenceGrade: string;
  confidenceScore: number;
  whatHappened: string;
  affectedMetrics: string[];
  supportingEvidence: {
    title: string;
    hash: string;
    source: string;
  }[];
  relatedDocuments: {
    id: string;
    name: string;
    type: string;
  }[];
  contributingFactors: {
    factor: string;
    classification: RigorClassification;
    probability: string;
    note: string;
  }[];
  recommendedInvestigation: string[];
  relatedActions: string[];
  assignedTo?: string;
}

interface ProblemDetailDrawerProps {
  problem: ProblemItem | null;
  isOpen: boolean;
  onClose: () => void;
  onActionTrigger: (actionType: string, problem: ProblemItem) => void;
  onResolveProblem: (problemId: string) => void;
  onAddToast: (msg: string) => void;
}

export const ProblemDetailDrawer: React.FC<ProblemDetailDrawerProps> = ({
  problem,
  isOpen,
  onClose,
  onActionTrigger,
  onResolveProblem,
  onAddToast,
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [isResolvedSuccess, setIsResolvedSuccess] = useState(false);

  if (!isOpen || !problem) return null;

  const getRigorBadge = (classification: RigorClassification) => {
    switch (classification) {
      case 'Observed data':
        return {
          variant: 'blue' as const,
          icon: <Database style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Direct empirical fact from ledger/dataset',
        };
      case 'Correlation':
        return {
          variant: 'warning' as const,
          icon: <Link2 style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Statistical co-variance (Does not imply causality)',
        };
      case 'Possible factor':
        return {
          variant: 'navy' as const,
          icon: <HelpCircle style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Hypothesized candidate undergoing verification',
        };
      case 'Verified evidence':
      case 'Root cause confirmed':
        return {
          variant: 'success' as const,
          icon: <CheckCircle2 style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Root cause confirmed with cryptographic G1 proof',
        };
      case 'External market factor':
        return {
          variant: 'warning' as const,
          icon: <AlertTriangle style={{ width: 13, height: 13, marginRight: 4 }} />,
          note: 'Macroeconomic / external industry condition',
        };
    }
  };

  const handleResolveClick = () => {
    setIsResolving(true);
    setTimeout(() => {
      setIsResolving(false);
      setIsResolvedSuccess(true);
      onResolveProblem(problem.id);
      onAddToast(`Problem "${problem.title}" marked as Resolved`);
      setTimeout(() => {
        setIsResolvedSuccess(false);
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(11, 31, 58, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fade-in 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 780,
          height: '100%',
          backgroundColor: 'var(--c-surface)',
          borderLeft: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slide-in-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: 'var(--sp-5) var(--sp-6)',
            borderBottom: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-page)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--sp-4)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
              <Badge
                variant={
                  problem.category === 'Critical'
                    ? 'destructive'
                    : problem.category === 'Attention'
                    ? 'warning'
                    : problem.category === 'Resolved'
                    ? 'success'
                    : 'blue'
                }
              >
                {problem.category} Severity
              </Badge>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#EAF7EE',
                  color: '#1B6A34',
                  border: '1px solid #C4EDCF',
                }}
              >
                <ShieldCheck style={{ width: 13, height: 13 }} />
                {problem.evidenceGrade}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>
                ID: {problem.id}
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--c-text-1)', margin: 0 }}>
              {problem.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--c-text-3)',
            }}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {isResolvedSuccess && (
          <div
            style={{
              backgroundColor: 'var(--c-success)',
              color: '#fff',
              padding: 'var(--sp-3) var(--sp-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Problem status updated to RESOLVED in workspace ledger.</span>
          </div>
        )}

        {/* Governance Actions Bar */}
        <div
          style={{
            padding: 'var(--sp-3) var(--sp-6)',
            backgroundColor: 'var(--c-navy)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--sp-2)',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: '#A0C4F7', flexShrink: 0 }}>
            Available Governance Actions:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexShrink: 0 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActionTrigger('investigate', problem)}
              style={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              leftIcon={<Sparkles size={14} style={{ color: '#7EB6FF' }} />}
            >
              Investigate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActionTrigger('create_dashboard', problem)}
              style={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              leftIcon={<BarChart3 size={14} style={{ color: '#38D39F' }} />}
            >
              Create Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActionTrigger('create_report', problem)}
              style={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              leftIcon={<FileText size={14} style={{ color: '#F8B84E' }} />}
            >
              Create Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActionTrigger('create_workflow', problem)}
              style={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              leftIcon={<Workflow size={14} style={{ color: '#C084FC' }} />}
            >
              Create Workflow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onActionTrigger('assign', problem)}
              style={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              leftIcon={<UserPlus size={14} style={{ color: '#A5B4FC' }} />}
            >
              Assign
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResolveClick}
              disabled={isResolving || problem.category === 'Resolved'}
              isLoading={isResolving}
              style={{ backgroundColor: 'var(--c-success)', color: '#fff', borderColor: 'var(--c-success)' }}
              leftIcon={<Check size={14} />}
            >
              Resolve
            </Button>
          </div>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--sp-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-5)',
            fontSize: 'var(--text-xs)',
            color: 'var(--c-text-1)',
          }}
        >
          {/* Key Metrics row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--sp-3)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <span
                style={{
                  color: 'var(--c-text-3)',
                  fontSize: '10px',
                  display: 'block',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Detected Period
              </span>
              <strong style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-sm)' }}>{problem.detectedPeriod}</strong>
            </div>

            <div
              style={{
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <span
                style={{
                  color: 'var(--c-text-3)',
                  fontSize: '10px',
                  display: 'block',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Measured Impact
              </span>
              <strong style={{ color: 'var(--c-danger)', fontSize: 'var(--text-sm)' }}>{problem.impact}</strong>
            </div>

            <div
              style={{
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <span
                style={{
                  color: 'var(--c-text-3)',
                  fontSize: '10px',
                  display: 'block',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                }}
              >
                Confidence Score
              </span>
              <strong style={{ color: 'var(--c-blue)', fontSize: 'var(--text-sm)' }}>{problem.confidenceScore}%</strong>
            </div>
          </div>

          {/* What happened */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <h3
              style={{
                fontWeight: 700,
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: 0,
              }}
            >
              <AlertTriangle size={15} style={{ color: 'var(--c-warning)' }} />
              What happened?
            </h3>
            <p
              style={{
                color: 'var(--c-text-2)',
                lineHeight: 1.6,
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
                margin: 0,
              }}
            >
              {problem.whatHappened}
            </p>
          </div>

          {/* Timeline & affected metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <h4
                style={{
                  fontWeight: 700,
                  color: 'var(--c-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: 0,
                }}
              >
                <Clock size={15} style={{ color: 'var(--c-text-3)' }} />
                Detection Timeline
              </h4>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>
                Timestamp: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-1)' }}>{problem.detectedTimestamp}</strong>
              </p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>
                Active Period: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-1)' }}>{problem.detectedPeriod}</strong>
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <h4
                style={{
                  fontWeight: 700,
                  color: 'var(--c-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: 0,
                }}
              >
                <TrendingDown size={15} style={{ color: 'var(--c-danger)' }} />
                Affected Metrics
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {problem.affectedMetrics.map((m) => (
                  <span
                    key={m}
                    style={{
                      padding: '2px 8px',
                      backgroundColor: 'var(--c-surface)',
                      border: '1px solid var(--c-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--c-text-1)',
                      fontWeight: 600,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contributing factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3
                style={{
                  fontWeight: 700,
                  color: 'var(--c-text-1)',
                  fontSize: 'var(--text-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: 0,
                }}
              >
                <HelpCircle size={15} style={{ color: '#7C3AED' }} />
                Potential Contributing Factors & Rigor Classification
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--c-text-3)', fontStyle: 'italic' }}>
                No AI speculation presented as fact
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {problem.contributingFactors.map((f, i) => {
                const style = getRigorBadge(f.classification);
                return (
                  <div
                    key={i}
                    style={{
                      padding: 'var(--sp-3) var(--sp-4)',
                      backgroundColor: 'var(--c-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--c-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--sp-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <strong style={{ color: 'var(--c-text-1)' }}>{f.factor}</strong>
                      <Badge variant={style.variant}>
                        {style.icon}
                        {f.classification}
                      </Badge>
                    </div>
                    <p style={{ margin: 0, color: 'var(--c-text-2)', lineHeight: 1.5, fontSize: '11px' }}>{f.note}</p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--c-text-3)',
                        paddingTop: 6,
                        borderTop: '1px solid var(--c-border)',
                      }}
                    >
                      <span>
                        Probability Weight: <strong style={{ color: 'var(--c-text-1)' }}>{f.probability}</strong>
                      </span>
                      <span style={{ fontStyle: 'italic' }}>{style.note}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supporting evidence & related documents */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <h4
                style={{
                  fontWeight: 700,
                  color: 'var(--c-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: 0,
                }}
              >
                <ShieldCheck size={15} style={{ color: 'var(--c-success)' }} />
                Supporting Evidence Hashes
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {problem.supportingEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--c-surface)',
                      padding: 'var(--sp-2) var(--sp-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--c-border)',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--c-text-1)' }}>{ev.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--c-text-3)' }}>
                      Hash: {ev.hash}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--c-blue)' }}>Source: {ev.source}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                backgroundColor: 'var(--c-page)',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--c-border)',
              }}
            >
              <h4
                style={{
                  fontWeight: 700,
                  color: 'var(--c-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: 0,
                }}
              >
                <FileText size={15} style={{ color: 'var(--c-blue)' }} />
                Related Documents
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {problem.relatedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: 'var(--c-surface)',
                      padding: 'var(--sp-2) var(--sp-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--c-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--c-text-1)' }}>{doc.name}</span>
                    <Badge variant="blue">{doc.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Investigation Steps */}
          <div
            style={{
              padding: 'var(--sp-4)',
              backgroundColor: '#EFF6FF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #BFDBFE',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-2)',
            }}
          >
            <h3
              style={{
                fontWeight: 700,
                color: '#1E3A8A',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                margin: 0,
              }}
            >
              <Sparkles size={15} style={{ color: 'var(--c-blue)' }} />
              Recommended Investigation Steps
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#1E40AF', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {problem.recommendedInvestigation.map((step, idx) => (
                <li key={idx} style={{ lineHeight: 1.5 }}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
