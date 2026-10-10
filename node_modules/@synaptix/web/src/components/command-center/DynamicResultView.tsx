import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  BarChart3,
  Table as TableIcon,
  LayoutDashboard,
  CheckSquare,
  Workflow,
  ShieldAlert,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { WorkspaceItem } from '../../types/workspace';

export type ResultType =
  | 'Answer'
  | 'Insight'
  | 'Chart'
  | 'Table'
  | 'Dashboard'
  | 'Action plan'
  | 'Workflow'
  | 'Approval request'
  | 'Report';

export interface CommandResultData {
  id: string;
  query: string;
  resultType: ResultType;
  answerText?: string;
  sourcesText?: string[];
  confidenceScore: number;
  riskLevel: 'Low Risk (Read-Only)' | 'Medium Risk (Review Recommended)' | 'High Risk (RBAC Approval Required)';
  timestamp: string;
  evidenceHash: string;
  knowledgeTriples?: string[];
  chartData?: { label: string; value: number; year: string }[];
  tableData?: { id: string; col1: string; col2: string; col3: string; status: string }[];
  actionPlanSteps?: { step: number; title: string; desc: string; done: boolean }[];
  workflowNodes?: { id: string; name: string; status: 'completed' | 'active' | 'queued' }[];
  approvalInfo?: { title: string; amount?: string; requester: string; reason: string; approved?: boolean };
  /** Real RAG answer with citations — populated when documents are indexed */
  ragAnswer?: import('../../lib/rag/types').RagAnswer;
}

interface DynamicResultViewProps {
  workspace: WorkspaceItem;
  result: CommandResultData;
  onAddToast: (msg: string) => void;
}

export const DynamicResultView: React.FC<DynamicResultViewProps> = ({
  workspace,
  result,
  onAddToast,
}) => {
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>(
    result.approvalInfo?.approved ? 'approved' : 'pending'
  );

  return (
    <div className="dynamic-result-card-wrapper" aria-label={`Result type: ${result.resultType}`}>
      {/* Result Type Badge Header */}
      <div className="result-type-header">
        <div className="type-badge-pill">
          {result.resultType === 'Chart' && <BarChart3 size={14} />}
          {result.resultType === 'Table' && <TableIcon size={14} />}
          {result.resultType === 'Insight' && <TrendingUp size={14} />}
          {result.resultType === 'Dashboard' && <LayoutDashboard size={14} />}
          {result.resultType === 'Action plan' && <CheckSquare size={14} />}
          {result.resultType === 'Workflow' && <Workflow size={14} />}
          {result.resultType === 'Approval request' && <ShieldAlert size={14} />}
          {result.resultType === 'Report' && <FileText size={14} />}
          {result.resultType === 'Answer' && <Sparkles size={14} />}
          <span>{result.resultType} Output</span>
        </div>

        <div className="result-header-meta">
          <span className="confidence-chip">{result.confidenceScore}% Confidence</span>
          <span className="timestamp-chip">{result.timestamp}</span>
        </div>
      </div>

      {/* 1. ANSWER RESULT TYPE */}
      {result.resultType === 'Answer' && (
        <div className="result-content-body answer-body">
          <p className="narrative-text">{result.answerText}</p>

          {result.sourcesText && result.sourcesText.length > 0 && (
            <div className="citations-inline-box">
              <span className="citations-label">Sources Referenced:</span>
              <div className="citation-pills-list">
                {result.sourcesText.map((src, i) => (
                  <span key={i} className="citation-pill">
                    <FileText size={12} /> {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. INSIGHT RESULT TYPE */}
      {result.resultType === 'Insight' && (
        <div className="result-content-body insight-body">
          <div className="insight-metric-highlight">
            <div className="highlight-left">
              <span className="metric-label">Key Model Variance</span>
              <span className="metric-large-num">+4.2%</span>
            </div>
            <div className="highlight-right">
              <span className="severity-pill positive">
                <CheckCircle2 size={13} /> Positive Variance
              </span>
              <span className="scope-tag">{workspace.name} Boundary</span>
            </div>
          </div>
          <p className="narrative-text">{result.answerText}</p>
        </div>
      )}

      {/* 3. CHART RESULT TYPE */}
      {result.resultType === 'Chart' && (
        <div className="result-content-body chart-body">
          <h4 className="chart-title">Revenue Trajectory & Forecast (2010–2026)</h4>
          <p className="chart-subtitle">Historical financial synthesis & predictive reasoning model</p>

          <div className="svg-chart-container">
            {/* SVG Visual Bar/Line Chart */}
            <svg viewBox="0 0 600 180" className="revenue-svg-chart">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
              <line x1="40" y1="160" x2="580" y2="160" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Data Bars */}
              {(result.chartData || [
                { year: '2010', label: '2010', value: 12.4 },
                { year: '2014', label: '2014', value: 24.8 },
                { year: '2018', label: '2018', value: 48.2 },
                { year: '2022', label: '2022', value: 86.5 },
                { year: '2026', label: '2026 (Est)', value: 124.2 },
              ]).map((pt, i) => {
                const barWidth = 44;
                const x = 70 + i * 110;
                const height = (pt.value / 130) * 130;
                const y = 160 - height;
                const isForecast = pt.year.includes('2026');

                return (
                  <g key={pt.year} className="bar-group">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="4"
                      fill={isForecast ? 'url(#blueGradient)' : '#1769E0'}
                      opacity={isForecast ? 0.9 : 0.85}
                    />
                    <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B1F3A">
                      ${pt.value}M
                    </text>
                    <text x={x + barWidth / 2} y="175" textAnchor="middle" fontSize="11" fill="#64748B">
                      {pt.year}
                    </text>
                  </g>
                );
              })}

              {/* Gradient definition for forecast bar */}
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1769E0" />
                  <stop offset="100%" stopColor="#0B1F3A" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <p className="narrative-text small">{result.answerText}</p>
        </div>
      )}

      {/* 4. TABLE RESULT TYPE */}
      {result.resultType === 'Table' && (
        <div className="result-content-body table-body">
          <h4 className="table-title">Detected Variance & Anomaly Audit</h4>
          <div className="mini-data-table-wrapper">
            <table className="mini-ds-table">
              <thead>
                <tr>
                  <th>Category / Item</th>
                  <th>Amount</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(result.tableData || [
                  { id: 't1', col1: 'Vendor Operations Requisition', col2: '$42,500', col3: 'High Risk', status: 'Pending Review' },
                  { id: 't2', col1: 'IT Infrastructure Licensing', col2: '$18,200', col3: 'Medium Risk', status: 'Verified' },
                  { id: 't3', col1: 'Travel & Expense Discrepancy', col2: '$6,400', col3: 'Medium Risk', status: 'Flagged' },
                ]).map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold">{row.col1}</td>
                    <td className="mono">{row.col2}</td>
                    <td>
                      <span className={`risk-tag-sm ${row.col3.toLowerCase().replace(/[^a-z]/g, '')}`}>
                        {row.col3}
                      </span>
                    </td>
                    <td>
                      <span className="status-tag-sm">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="narrative-text small">{result.answerText}</p>
        </div>
      )}

      {/* 5. DASHBOARD RESULT TYPE */}
      {result.resultType === 'Dashboard' && (
        <div className="result-content-body dashboard-body">
          <h4 className="dashboard-title">{workspace.name} Executive Intelligence Card</h4>
          <div className="dashboard-tiles-grid">
            <div className="dash-tile">
              <span className="dash-tile-lbl">Domain Documents</span>
              <span className="dash-tile-val">{workspace.documentCount}</span>
              <span className="dash-tile-sub">100% Ingested</span>
            </div>
            <div className="dash-tile">
              <span className="dash-tile-lbl">Connected Datasets</span>
              <span className="dash-tile-val">{workspace.datasetCount}</span>
              <span className="dash-tile-sub">Schemas Live</span>
            </div>
            <div className="dash-tile highlight">
              <span className="dash-tile-lbl">Pending Actions</span>
              <span className="dash-tile-val">{workspace.pendingActionCount || 2}</span>
              <span className="dash-tile-sub">Awaiting Approval</span>
            </div>
          </div>
          <p className="narrative-text small">{result.answerText}</p>
        </div>
      )}

      {/* 6. ACTION PLAN RESULT TYPE */}
      {result.resultType === 'Action plan' && (
        <div className="result-content-body plan-body">
          <h4 className="plan-title">Synthesized Operational Execution Plan</h4>
          <div className="action-steps-sequence">
            {(result.actionPlanSteps || [
              { step: 1, title: 'Extract Vendor Requisition Logs', desc: 'Pull all unallocated expense claims from Q3 ledger.', done: true },
              { step: 2, title: 'Verify SAML 2.0 Authorization', desc: 'Cross-reference approving manager credentials against RBAC policy.', done: true },
              { step: 3, title: 'Generate Executive Compliance Audit', desc: 'Compile cryptographic evidence hash for approval review.', done: false },
            ]).map((s) => (
              <div key={s.step} className={`step-row-item ${s.done ? 'step-done' : ''}`}>
                <div className="step-num-badge">{s.done ? <CheckCircle2 size={14} /> : s.step}</div>
                <div className="step-text-content">
                  <h5 className="step-item-title">{s.title}</h5>
                  <p className="step-item-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. WORKFLOW RESULT TYPE */}
      {result.resultType === 'Workflow' && (
        <div className="result-content-body workflow-body">
          <h4 className="workflow-title">Automated Reasoning Pipeline</h4>
          <div className="workflow-diagram-row">
            {(result.workflowNodes || [
              { id: 'w1', name: 'Data Ingestion', status: 'completed' },
              { id: 'w2', name: 'Anomaly Detection', status: 'completed' },
              { id: 'w3', name: 'RBAC Authorization', status: 'active' },
              { id: 'w4', name: 'Audit Trail Hashing', status: 'queued' },
            ]).map((node, i, arr) => (
              <React.Fragment key={node.id}>
                <div className={`wf-node-box ${node.status}`}>
                  <span className="wf-node-status-dot" />
                  <span className="wf-node-name">{node.name}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight size={14} className="wf-arrow-icon" />}
              </React.Fragment>
            ))}
          </div>
          <p className="narrative-text small">{result.answerText}</p>
        </div>
      )}

      {/* 8. APPROVAL REQUEST RESULT TYPE */}
      {result.resultType === 'Approval request' && (
        <div className="result-content-body approval-body">
          <div className="approval-alert-banner">
            <Lock size={18} className="lock-icon-amber" />
            <div>
              <h4 className="approval-banner-title">
                {result.approvalInfo?.title || 'Capital Requisition #8821 ($150,000)'}
              </h4>
              <p className="approval-banner-desc">
                {result.approvalInfo?.reason || 'Requires Executive RBAC sign-off before ledger execution.'}
              </p>
            </div>
          </div>

          <div className="approval-controls-row">
            {approvalStatus === 'pending' ? (
              <>
                <button
                  type="button"
                  className="btn-approve-action"
                  onClick={() => {
                    setApprovalStatus('approved');
                    onAddToast('Action Approved & Governed in Audit Log');
                  }}
                >
                  <CheckCircle2 size={14} /> Approve Action
                </button>
                <button
                  type="button"
                  className="btn-reject-action"
                  onClick={() => {
                    setApprovalStatus('rejected');
                    onAddToast('Action Rejected by User');
                  }}
                >
                  <AlertTriangle size={14} /> Reject
                </button>
              </>
            ) : (
              <div className={`approval-result-pill ${approvalStatus}`}>
                {approvalStatus === 'approved' ? (
                  <>
                    <CheckCircle2 size={15} /> Action Approved & Executed (SAML 2.0 Verified)
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} /> Action Rejected
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. REPORT RESULT TYPE */}
      {result.resultType === 'Report' && (
        <div className="result-content-body report-body">
          <div className="report-header-box">
            <FileText size={22} className="report-doc-icon" />
            <div>
              <h4 className="report-title">{workspace.name} Compliance & Revenue Audit Report</h4>
              <span className="report-subtitle">Generated by Synaptix Reasoning Engine v2.4</span>
            </div>
          </div>
          <p className="narrative-text">{result.answerText}</p>
          <div className="report-action-footer">
            <button
              type="button"
              className="btn-download-report"
              onClick={() => onAddToast(`Downloaded ${workspace.name} Report PDF`)}
            >
              <Download size={14} /> Download Report (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Result Card Footer Actions */}
      <div className="result-card-action-bar">
        <div className="evidence-hash-tag">
          <Layers size={13} />
          <span>Evidence: </span>
          <code className="hash-code">{result.evidenceHash.substring(0, 16)}...</code>
        </div>

        <div className="card-quick-btns">
          <button
            type="button"
            className="btn-card-icon"
            onClick={() => onAddToast('Exported result data to workspace')}
            title="Export Result"
          >
            <ExternalLink size={13} /> Export
          </button>
        </div>
      </div>
    </div>
  );
};
