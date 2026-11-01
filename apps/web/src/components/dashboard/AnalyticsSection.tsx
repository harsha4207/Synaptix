import React, { useState } from 'react';
import {
  LineChart,
  Workflow,
  Database,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { ActivityChart } from './ActivityChart';
import { WorkflowChart } from './WorkflowChart';
import {
  AiActivityPoint,
  WorkflowTrendPoint,
  IngestionTrendPoint,
  EvidenceDistribution
} from './types';

interface AnalyticsSectionProps {
  activityData: AiActivityPoint[];
  workflowData: WorkflowTrendPoint[];
  ingestionData: IngestionTrendPoint[];
  evidenceDist: EvidenceDistribution;
  onNavigateToAnalytics?: () => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  activityData,
  workflowData,
  ingestionData,
  evidenceDist,
  onNavigateToAnalytics,
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'workflows' | 'ingestion' | 'evidence'>('activity');

  return (
    <section
      className="dash-card-static dash-stagger-3"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
      aria-label="Intelligence Analytics"
    >
      {/* SECTION HEADER WITH SUB-TABS & EXTERNAL ACTION */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: activeTab === 'activity' ? 600 : 500,
              color: activeTab === 'activity' ? '#1769E0' : '#64748B',
              background: activeTab === 'activity' ? '#EFF6FF' : 'transparent',
              border: activeTab === 'activity' ? '1px solid #BFDBFE' : '1px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            <Cpu size={14} />
            <span>AI Reasoning Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflows')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: activeTab === 'workflows' ? 600 : 500,
              color: activeTab === 'workflows' ? '#1769E0' : '#64748B',
              background: activeTab === 'workflows' ? '#EFF6FF' : 'transparent',
              border: activeTab === 'workflows' ? '1px solid #BFDBFE' : '1px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            <Workflow size={14} />
            <span>Agent Operations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ingestion')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: activeTab === 'ingestion' ? 600 : 500,
              color: activeTab === 'ingestion' ? '#1769E0' : '#64748B',
              background: activeTab === 'ingestion' ? '#EFF6FF' : 'transparent',
              border: activeTab === 'ingestion' ? '1px solid #BFDBFE' : '1px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            <Database size={14} />
            <span>Knowledge Ingestion</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: activeTab === 'evidence' ? 600 : 500,
              color: activeTab === 'evidence' ? '#1769E0' : '#64748B',
              background: activeTab === 'evidence' ? '#EFF6FF' : 'transparent',
              border: activeTab === 'evidence' ? '1px solid #BFDBFE' : '1px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            <ShieldCheck size={14} />
            <span>Evidence Grades</span>
          </button>
        </div>

        {onNavigateToAnalytics && (
          <button
            type="button"
            onClick={onNavigateToAnalytics}
            className="dash-btn-ghost"
            style={{ fontSize: '11px', height: '30px' }}
          >
            <LineChart size={13} />
            <span>Open Analytics Engine</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: AI ACTIVITY */}
      {activeTab === 'activity' && (
        <div>
          <div className="dash-two-col">
            <div style={{ minHeight: '260px' }}>
              <ActivityChart data={activityData} />
            </div>

            {/* Side Telemetry Stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '18px 20px',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                    Reasoning Pipeline Performance
                  </span>
                  <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    Normal
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Multi-tier adaptive routing automatically assigns simple analytical lookups to low-latency fast models and high-dimensional synthesis to Gemini 2.5.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Average Latency</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>142ms</div>
                  <div style={{ fontSize: '10px', color: '#16A34A', marginTop: '2px' }}>-18ms vs prior week</div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Grounding Accuracy</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>99.2%</div>
                  <div style={{ fontSize: '10px', color: '#16A34A', marginTop: '2px' }}>Zero hallucinations gated</div>
                </div>
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Adaptive Model Selection:</span>
                <span style={{ fontWeight: 600, color: '#1769E0' }}>Gemini 2.5 Flash / Pro Auto</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: WORKFLOWS */}
      {activeTab === 'workflows' && (
        <div>
          <div className="dash-two-col">
            <div style={{ minHeight: '260px' }}>
              <WorkflowChart data={workflowData} />
            </div>

            {/* Workflow Operational Health */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '18px 20px',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                    Agent Execution Telemetry
                  </span>
                  <span style={{ fontSize: '10px', background: '#ECFDF5', color: '#065F46', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    99.4% Pass Rate
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Automated background jobs and cron schedules execute in isolated sandboxes. Actions exceeding financial or policy thresholds automatically pause for human dual sign-off.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Total Executions</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>284 Runs</div>
                  <div style={{ fontSize: '10px', color: '#16A34A', marginTop: '2px' }}>0 Failed runs</div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Sign-Off Gated</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#D97706' }}>2 Awaiting</div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Dual controller rule</div>
                </div>
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '11px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Automated Rollback Snapshots:</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>100% Prepared</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: KNOWLEDGE INGESTION */}
      {activeTab === 'ingestion' && (
        <div className="dash-two-col">
          <div style={{ minHeight: '260px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Semantic Chunk Indexing Over Time
            </h4>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
              Cumulative vector chunks extracted from tabular datasets and unstructured documents.
            </p>
            {/* SVG Step Line for Ingestion */}
            <svg viewBox="0 0 540 180" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {ingestionData.map((d, i) => {
                const x = 40 + (i / Math.max(ingestionData.length - 1, 1)) * 460;
                const maxChunks = Math.max(...ingestionData.map((x) => x.chunks), 10);
                const y = 140 - (d.chunks / maxChunks) * 110;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#1769E0" />
                    <text x={x} y="160" textAnchor="middle" fontSize="10" fill="#64748B">
                      {d.label}
                    </text>
                    <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="#0F172A">
                      {d.chunks}
                    </text>
                  </g>
                );
              })}
              {ingestionData.length > 1 && (
                <polyline
                  points={ingestionData
                    .map((d, i) => {
                      const x = 40 + (i / (ingestionData.length - 1)) * 460;
                      const maxChunks = Math.max(...ingestionData.map((x) => x.chunks), 10);
                      const y = 140 - (d.chunks / maxChunks) * 110;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#1769E0"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              )}
            </svg>
          </div>

          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Vector Memory Health
              </h4>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                High-dimensional vector embeddings are stored with strict workspace partition tags. Cosine search indices are refreshed after each document commit.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Vector Index Health</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>100% Intact</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Embedding Dim</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>768 Float32</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: EVIDENCE DISTRIBUTION */}
      {activeTab === 'evidence' && (
        <div className="dash-two-col">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Evidence Verification Distribution
            </h4>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              Audit distribution of claims extracted from workspace knowledge sources categorized by cryptographic verification standard.
            </p>

            {/* Distribution Bar */}
            <div
              style={{
                height: '14px',
                width: '100%',
                background: '#F1F5F9',
                borderRadius: '999px',
                overflow: 'hidden',
                display: 'flex',
                marginTop: '4px',
              }}
            >
              <div style={{ width: `${evidenceDist.g2Pct}%`, background: '#10B981' }} title={`G2 Cryptographic: ${evidenceDist.g2Pct}%`} />
              <div style={{ width: `${evidenceDist.g1Pct}%`, background: '#1769E0' }} title={`G1 Direct Source: ${evidenceDist.g1Pct}%`} />
              <div style={{ width: `${evidenceDist.g0Pct}%`, background: '#F59E0B' }} title={`G0 Model Anchor: ${evidenceDist.g0Pct}%`} />
            </div>

            {/* Legend Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10B981' }} />
                  <span style={{ fontWeight: 500, color: '#0F172A' }}>Grade G2 (Cryptographic Ledger Grounded)</span>
                </div>
                <strong style={{ color: '#0F172A' }}>{evidenceDist.g2Pct}% ({evidenceDist.g2Count} claims)</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1769E0' }} />
                  <span style={{ fontWeight: 500, color: '#0F172A' }}>Grade G1 (Direct Source Citation Verified)</span>
                </div>
                <strong style={{ color: '#0F172A' }}>{evidenceDist.g1Pct}% ({evidenceDist.g1Count} claims)</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#F59E0B' }} />
                  <span style={{ fontWeight: 500, color: '#0F172A' }}>Grade G0 (Model Self-Consistency Anchor)</span>
                </div>
                <strong style={{ color: '#0F172A' }}>{evidenceDist.g0Pct}% ({evidenceDist.g0Count} claims)</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#DC2626' }} />
                  <span style={{ fontWeight: 500, color: '#0F172A' }}>Contradictions Detected</span>
                </div>
                <strong style={{ color: evidenceDist.contradictedCount > 0 ? '#DC2626' : '#16A34A' }}>
                  {evidenceDist.contradictedCount} Active
                </strong>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldCheck size={16} style={{ color: '#16A34A' }} />
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Evidence Standards Notice
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.55, margin: 0 }}>
                Evidence grading indicates verifiable provenance and direct textual anchor matching against corporate filings or financial ledgers. Grades establish chain of custody and citation veracity, but do not substitute for executive oversight.
              </p>
            </div>

            <div
              style={{
                marginTop: '16px',
                padding: '10px 12px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#1E40AF',
              }}
            >
              Zero ungrounded hallucinations permitted by the EMLM Reasoning Gate.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

