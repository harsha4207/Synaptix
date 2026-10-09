import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  AlertOctagon,
  CheckSquare,
  Activity,
  GitCommit,
  Quote,
  Database,
  Lock,
  Layers
} from 'lucide-react';
import { ClaimItem, EvidenceGrade } from '../../types/evidence';
import { EvidenceChainView } from './EvidenceChainView';

interface EvidenceCardProps {
  claim: ClaimItem;
  onOpenSource: (sourceId: string, claim: ClaimItem) => void;
  onReverify: (claimId: string) => void;
  onAddToast: (msg: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  claim,
  onOpenSource,
  onReverify,
  onAddToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chain' | 'history'>('details');

  const getGradeBadge = (grade: EvidenceGrade) => {
    switch (grade) {
      case 'G2':
        return (
          <span className="evidence-grade-badge grade-g2" title="Action-Proven: Empirically validated through executed automated action & ledger settlement">
            <ShieldCheck size={14} />
            <span className="grade-title">G2</span>
            <span className="grade-subtext">Action-Proven</span>
          </span>
        );
      case 'G1':
        return (
          <span className="evidence-grade-badge grade-g1" title="Verified: Cryptographically matched and cross-checked against authoritative source">
            <ShieldCheck size={14} />
            <span className="grade-title">G1</span>
            <span className="grade-subtext">Verified</span>
          </span>
        );
      case 'G0':
        return (
          <span className="evidence-grade-badge grade-g0" title="Extracted / Unverified: Direct extraction without full cross-corroboration">
            <Layers size={14} />
            <span className="grade-title">G0</span>
            <span className="grade-subtext">Extracted / Unverified</span>
          </span>
        );
      case 'Contradicted':
        return (
          <span className="evidence-grade-badge grade-contradicted" title="Contradicted: Authoritative evidence indicates this claim may be incorrect or superseded">
            <AlertOctagon size={14} />
            <span className="grade-title">Contradicted</span>
            <span className="grade-subtext">Conflicting Evidence</span>
          </span>
        );
    }
  };

  return (
    <div className={`evidence-card-box ${claim.grade === 'Contradicted' ? 'is-contradicted' : ''}`}>
      {/* 1. TOP BAR: Claim Header, ID, Grade Badge & Quick Metrics */}
      <div className="evidence-card-header">
        <div className="claim-identity-row">
          <span className="claim-id-badge">{claim.claimId}</span>
          <span className="claim-category-badge">{claim.category}</span>
          {getGradeBadge(claim.grade)}
        </div>

        <div className="header-meta-actions">
          <div className="confidence-pill" title="Statistical & Deterministic Verification Confidence">
            <span className="conf-label">Confidence</span>
            <span className="conf-value">{Math.round(claim.confidence * 100)}%</span>
          </div>

          <button
            type="button"
            className="expand-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse Evidence Breakdown' : 'Expand Complete Evidence Breakdown'}
          >
            <span>{isExpanded ? 'Collapse' : 'Audit Evidence'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* 2. PRIMARY CLAIM STATEMENT (Claim) */}
      <div className="claim-statement-section">
        <h3 className="claim-title">{claim.title}</h3>
        <p className="claim-text-body">{claim.claimText}</p>
        
        {claim.grade === 'Contradicted' && claim.contradictionReason && (
          <div className="contradiction-alert-box">
            <AlertOctagon size={16} className="alert-icon" />
            <div className="contradiction-text">
              <strong>Contradiction Warning:</strong> {claim.contradictionReason}
            </div>
          </div>
        )}
      </div>

      {/* 3. VISUAL SUMMARY BAR (Sources + Last Verification + Related Actions preview) */}
      <div className="claim-summary-bar">
        <div className="summary-item">
          <Database size={13} />
          <span>{claim.sources.length} Authoritative Sources</span>
        </div>
        <div className="summary-separator" />
        <div className="summary-item">
          <Clock size={13} />
          <span>Verified: {claim.lastVerification}</span>
        </div>
        <div className="summary-separator" />
        <div className="summary-item">
          <Activity size={13} />
          <span>{claim.relatedActions.length} Related Actions</span>
        </div>
        <div className="summary-separator" />
        <div className="summary-item">
          <History size={13} />
          <span>{claim.correctionHistory.length} Revision Logs</span>
        </div>
      </div>

      {/* 4. EXPANDABLE DETAILED EVIDENCE BREAKDOWN */}
      {isExpanded && (
        <div className="evidence-expanded-wrapper">
          {/* Sub-Navigation Tabs */}
          <div className="evidence-subtabs-nav">
            <button
              type="button"
              className={`subtab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <FileText size={14} /> Full Evidence & Verification Stack
            </button>
            <button
              type="button"
              className={`subtab-btn ${activeTab === 'chain' ? 'active' : ''}`}
              onClick={() => setActiveTab('chain')}
            >
              <ArrowRight size={14} /> Visual Evidence Chain
            </button>
            <button
              type="button"
              className={`subtab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} /> Correction History ({claim.correctionHistory.length})
            </button>
          </div>

          {/* TAB 1: FULL EVIDENCE BREAKDOWN (Claim ↓ Supporting evidence ↓ Evidence grade ↓ Source ↓ Verification ↓ Related action) */}
          {activeTab === 'details' && (
            <div className="vertical-evidence-stack">
              {/* SECTION A: SUPPORTING EVIDENCE (Passages & Citations) */}
              <div className="stack-block">
                <div className="block-title-row">
                  <div className="block-icon">
                    <Quote size={15} />
                  </div>
                  <div>
                    <h4 className="block-heading">1. Supporting Evidence & Citations</h4>
                    <span className="block-subheading">
                      Exact extracted passages and cryptographic matching citations.
                    </span>
                  </div>
                </div>

                <div className="passages-list">
                  {claim.supportingPassages.map((psg) => (
                    <div key={psg.id} className="passage-item-card">
                      <div className="psg-header">
                        <span className="psg-source-tag">{psg.sourceName}</span>
                        <span className="psg-location-tag">{psg.location}</span>
                        <span className="psg-relevance">
                          {Math.round(psg.relevanceScore * 100)}% Match
                        </span>
                      </div>
                      <blockquote className="psg-quote-text">
                        &ldquo;{psg.text}&rdquo;
                      </blockquote>
                      {psg.highlightedTokens && psg.highlightedTokens.length > 0 && (
                        <div className="token-chips-row">
                          <span className="tokens-label">Verified Tokens:</span>
                          {psg.highlightedTokens.map((t, idx) => (
                            <span key={idx} className="token-chip">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: EVIDENCE GRADE & JUSTIFICATION */}
              <div className="stack-block">
                <div className="block-title-row">
                  <div className="block-icon">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <h4 className="block-heading">2. Evidence Grade Assessment</h4>
                    <span className="block-subheading">
                      Classification of evidence rigor and empirical auditability.
                    </span>
                  </div>
                </div>

                <div className="grade-explanation-card">
                  <div className="grade-header-row">
                    {getGradeBadge(claim.grade)}
                    <span className="grade-conf-badge">
                      Deterministic Confidence: {Math.round(claim.confidence * 100)}%
                    </span>
                  </div>
                  <p className="grade-rationale">
                    {claim.grade === 'G2' && 'This claim is classified as G2 Action-Proven because it has been corroborated against settled immutable financial transactions and validated via automated ledger reconciliation.'}
                    {claim.grade === 'G1' && 'This claim is classified as G1 Verified because it has been cryptographically validated against authoritative official documents, though not yet directly acted upon in financial execution.'}
                    {claim.grade === 'G0' && 'This claim is classified as G0 Extracted / Unverified because it was parsed directly from preliminary draft documents without multi-source cross-verification.'}
                    {claim.grade === 'Contradicted' && 'This claim is flagged as CONTRADICTED because newer, legally binding amendments or verified ledger rows explicitly supersede the statement.'}
                  </p>
                </div>
              </div>

              {/* SECTION C: AUTHORITATIVE SOURCES (With Open Original Source trigger) */}
              <div className="stack-block">
                <div className="block-title-row">
                  <div className="block-icon">
                    <Database size={15} />
                  </div>
                  <div>
                    <h4 className="block-heading">3. Authoritative Sources</h4>
                    <span className="block-subheading">
                      Immutable document or ledger references underpinning this claim.
                    </span>
                  </div>
                </div>

                <div className="sources-list-grid">
                  {claim.sources.map((src) => (
                    <div key={src.id} className="source-row-card">
                      <div className="source-info-main">
                        <div className="source-type-line">
                          <span className="src-type">{src.type}</span>
                          <span className="src-rating">Trust: {src.authoritativeRating}</span>
                        </div>
                        <h5 className="src-name">{src.name}</h5>
                        <div className="src-checksum">
                          <Lock size={11} />
                          <code>{src.checksum.substring(0, 24)}...</code>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="open-source-btn"
                        onClick={() => onOpenSource(src.id, claim)}
                        title="Open full original source with line highlights and checksum certification"
                      >
                        <ExternalLink size={14} />
                        <span>Open Original Source</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: VERIFICATION RECORD */}
              <div className="stack-block">
                <div className="block-title-row">
                  <div className="block-icon">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="block-heading">4. Verification & Audit Proof</h4>
                    <span className="block-subheading">
                      Audit signature and reconciliation engine trace.
                    </span>
                  </div>
                </div>

                <div className="verification-details-card">
                  <div className="verif-grid">
                    <div className="verif-item">
                      <span className="verif-label">Auditor / Engine</span>
                      <span className="verif-val">{claim.verification.verifiedBy}</span>
                    </div>
                    <div className="verif-item">
                      <span className="verif-label">Method</span>
                      <span className="verif-val">{claim.verification.method}</span>
                    </div>
                    <div className="verif-item">
                      <span className="verif-label">Timestamp</span>
                      <span className="verif-val">{claim.verification.verifiedAt}</span>
                    </div>
                    <div className="verif-item">
                      <span className="verif-label">Audit Signature</span>
                      <span className="verif-val mono-val">{claim.verification.auditSignature}</span>
                    </div>
                  </div>
                  <div className="proof-details-box">
                    <span className="proof-label">Proof Details:</span>
                    <p className="proof-text">{claim.verification.proofDetails}</p>
                  </div>
                </div>
              </div>

              {/* SECTION E: RELATED ACTIONS */}
              <div className="stack-block">
                <div className="block-title-row">
                  <div className="block-icon">
                    <CheckSquare size={15} />
                  </div>
                  <div>
                    <h4 className="block-heading">5. Related Governed Actions</h4>
                    <span className="block-subheading">
                      Automations, journal postings, or workflows triggered or justified by this evidence.
                    </span>
                  </div>
                </div>

                <div className="actions-list">
                  {claim.relatedActions.map((act) => (
                    <div key={act.id} className="related-action-item">
                      <div className="action-item-header">
                        <span className="act-title">{act.name}</span>
                        <span className={`act-status-tag ${act.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {act.status}
                        </span>
                      </div>
                      <p className="act-impact">{act.impactSummary}</p>
                      <span className="act-time">Executed / Scheduled: {act.executedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL EVIDENCE CHAIN */}
          {activeTab === 'chain' && (
            <div className="evidence-chain-tab-pane">
              <EvidenceChainView
                claim={claim}
                onOpenSource={(srcId) => onOpenSource(srcId, claim)}
              />
            </div>
          )}

          {/* TAB 3: CORRECTION HISTORY */}
          {activeTab === 'history' && (
            <div className="correction-history-pane">
              <div className="history-timeline">
                {claim.correctionHistory.map((cor, idx) => (
                  <div key={cor.id} className="history-timeline-entry">
                    <div className="entry-marker">
                      <GitCommit size={14} />
                      {idx < claim.correctionHistory.length - 1 && <div className="timeline-line" />}
                    </div>
                    <div className="entry-content-box">
                      <div className="entry-header">
                        <span className="entry-time">{cor.timestamp}</span>
                        <span className="entry-actor">{cor.changedBy}</span>
                        <div className="grade-transition-pill">
                          <span className="prev-grade">{cor.previousGrade}</span>
                          <ArrowRight size={12} />
                          <span className="next-grade">{cor.newGrade}</span>
                        </div>
                      </div>
                      <p className="entry-reason">{cor.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD ACTION FOOTER */}
          <div className="evidence-card-footer">
            <div className="footer-left-info">
              <ShieldCheck size={14} />
              <span>Immutable cryptographic hash registered in Synaptix Audit Trail.</span>
            </div>
            <div className="footer-actions">
              <button
                type="button"
                className="card-footer-btn outline"
                onClick={() => {
                  onReverify(claim.id);
                }}
              >
                <Clock size={13} /> Re-Verify Evidence
              </button>
              <button
                type="button"
                className="card-footer-btn primary"
                onClick={() => {
                  onAddToast(`Exported auditable PDF verification pack for ${claim.claimId}`);
                }}
              >
                Export Audit Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
