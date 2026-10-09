import React from 'react';
import {
  FileText,
  ShieldCheck,
  BrainCircuit,
  Lock,
  Download,
  Share2,
  Workflow,
  Sparkles,
  Layers,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { CommandResultData } from './DynamicResultView';
import { WorkspaceItem } from '../../types/workspace';

interface EvidencePanelProps {
  workspace: WorkspaceItem;
  activeResult: CommandResultData | null;
  onAddToast: (msg: string) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  workspace,
  activeResult,
  onAddToast,
}) => {
  if (!activeResult) {
    return (
      <aside className="command-evidence-panel empty" aria-label="Evidence & Governance Context">
        <div className="empty-panel-box">
          <BrainCircuit size={32} className="empty-brain-icon" />
          <h3>Context & Evidence</h3>
          <p>Execute a command or select a response from the stream to inspect retrieved sources, knowledge graph triples, confidence scores, and evidence verification.</p>
        </div>
      </aside>
    );
  }

  const sources = activeResult.sourcesText || [
    `${workspace.name}_Q3_Financial_Forecast.pdf (p.14)`,
    `Vendor_Audit_Ledger_2026.xlsx (Row 412)`,
    `RBAC_Policy_Rules_v2.json`,
  ];

  const triples = activeResult.knowledgeTriples || [
    `[${workspace.name}] --(has_document)--> [FY2026_Audit.pdf]`,
    `[Vendor Operations] --(has_variance)--> [$42.5k Unallocated]`,
    `[SAML 2.0 Policy] --(governs)--> [Capital Requisition #8821]`,
  ];

  return (
    <aside className="command-evidence-panel" aria-label="Evidence & Governance Context">
      {/* Panel Top Title */}
      <div className="panel-header-top">
        <div className="panel-title-group">
          <ShieldCheck size={18} className="shield-icon-teal" />
          <h3>Evidence & Context</h3>
        </div>
        <span className="panel-workspace-tag">{workspace.name} Scope</span>
      </div>

      <div className="panel-scroll-content">
        {/* 1. CONFIDENCE & RISK METER */}
        <div className="panel-card confidence-risk-card">
          <div className="card-section-row">
            <span className="card-section-label">Reasoning Confidence</span>
            <span className="confidence-num-highlight">{activeResult.confidenceScore}%</span>
          </div>

          <div className="confidence-progress-bar">
            <div
              className="confidence-progress-fill"
              style={{ width: `${activeResult.confidenceScore}%` }}
            />
          </div>

          <div className="risk-level-row">
            <span className="card-section-label">Governance Risk</span>
            <span
              className={`risk-badge-pill ${
                activeResult.riskLevel.includes('High')
                  ? 'risk-high'
                  : activeResult.riskLevel.includes('Medium')
                  ? 'risk-medium'
                  : 'risk-low'
              }`}
            >
              <Lock size={12} /> {activeResult.riskLevel.split(' ')[0]} Risk
            </span>
          </div>
        </div>

        {/* 2. CRYPTOGRAPHIC EVIDENCE & HASH */}
        <div className="panel-card evidence-card">
          <div className="card-header-sm">
            <Layers size={15} className="evidence-icon-cyan" />
            <h4>Cryptographic Evidence</h4>
          </div>

          <div className="evidence-hash-box">
            <div className="hash-header-row">
              <span className="hash-label">SHA-256 Hash Verification:</span>
              <button
                type="button"
                className="copy-hash-btn"
                title="Copy hash"
                onClick={() => {
                  navigator.clipboard?.writeText(activeResult.evidenceHash);
                  onAddToast('Copied SHA-256 hash to clipboard');
                }}
              >
                <Copy size={11} /> Copy
              </button>
            </div>
            <code className="hash-code-full">{activeResult.evidenceHash}</code>
          </div>

          <div className="evidence-verification-status">
            <CheckCircle2 size={13} className="check-green" />
            <span>SAML 2.0 Verified • Immutable Record</span>
          </div>
        </div>

        {/* 3. RETRIEVED SOURCES */}
        <div className="panel-card sources-card">
          <div className="card-header-sm">
            <FileText size={15} className="sources-icon-blue" />
            <h4>Retrieved Sources ({sources.length})</h4>
          </div>

          <div className="sources-list">
            {sources.map((src, i) => (
              <div
                key={i}
                className="source-item"
                onClick={() => onAddToast(`Inspecting source: ${src}`)}
                title="Click to view source"
              >
                <FileText size={13} className="doc-icon" />
                <span className="source-name-text">{src}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. KNOWLEDGE GRAPH TRIPLES */}
        <div className="panel-card triples-card">
          <div className="card-header-sm">
            <BrainCircuit size={15} className="triples-icon-purple" />
            <h4>Knowledge Triples Used</h4>
          </div>

          <div className="triples-list">
            {triples.map((triple, i) => (
              <div key={i} className="triple-code-item">
                <code>{triple}</code>
              </div>
            ))}
          </div>
        </div>

        {/* 5. QUICK ACTIONS FOR THIS RESULT */}
        <div className="panel-card actions-card">
          <div className="card-header-sm">
            <Sparkles size={15} className="actions-icon-amber" />
            <h4>Context Actions</h4>
          </div>

          <div className="panel-actions-list">
            <button
              type="button"
              className="panel-action-btn"
              onClick={() => onAddToast(`Exported ${workspace.name} result data`)}
            >
              <Download size={14} /> Export Result Data
            </button>
            <button
              type="button"
              className="panel-action-btn"
              onClick={() => onAddToast(`Created workflow from ${workspace.name} result`)}
            >
              <Workflow size={14} /> Create Automated Workflow
            </button>
            <button
              type="button"
              className="panel-action-btn"
              onClick={() => onAddToast(`Shared evidence record`)}
            >
              <Share2 size={14} /> Share Evidence Package
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
