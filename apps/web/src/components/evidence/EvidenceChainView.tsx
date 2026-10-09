import React from 'react';
import {
  FileText,
  Quote,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';
import { ClaimItem } from '../../types/evidence';

interface EvidenceChainViewProps {
  claim: ClaimItem;
  onOpenSource: (sourceId: string) => void;
}

export const EvidenceChainView: React.FC<EvidenceChainViewProps> = ({ claim, onOpenSource }) => {
  const getGradeMeta = (grade: ClaimItem['grade']) => {
    switch (grade) {
      case 'G2':
        return {
          label: 'G2 — Action-Proven',
          desc: 'Empirically validated through executed automated action & ledger settlement.',
          icon: <ShieldCheck size={18} className="grade-icon g2" />,
          colorClass: 'grade-badge-g2',
        };
      case 'G1':
        return {
          label: 'G1 — Verified',
          desc: 'Cryptographically matched and cross-checked against authoritative source.',
          icon: <ShieldCheck size={18} className="grade-icon g1" />,
          colorClass: 'grade-badge-g1',
        };
      case 'G0':
        return {
          label: 'G0 — Extracted / Unverified',
          desc: 'Direct extraction without complete cross-source corroboration.',
          icon: <Layers size={18} className="grade-icon g0" />,
          colorClass: 'grade-badge-g0',
        };
      case 'Contradicted':
        return {
          label: 'Contradicted — Evidence Conflict',
          desc: 'Authoritative evidence indicates this claim is invalid or superseded.',
          icon: <AlertOctagon size={18} className="grade-icon contradicted" />,
          colorClass: 'grade-badge-contradicted',
        };
    }
  };

  const gradeMeta = getGradeMeta(claim.grade);

  return (
    <div className="evidence-chain-container" aria-label="Visual Evidence Chain">
      <div className="chain-header">
        <span className="chain-caption">AUDITABLE EVIDENCE CHAIN</span>
        <span className="chain-flow-tag">Claim → Source → Evidence → Verification → Grade</span>
      </div>

      <div className="chain-flow-steps">
        {/* Step 1: Claim */}
        <div className="chain-step-node step-claim">
          <div className="step-badge">1. Claim</div>
          <div className="step-content-card">
            <div className="step-card-header">
              <span className="step-id">{claim.claimId}</span>
              <span className="step-category">{claim.category}</span>
            </div>
            <p className="step-title">{claim.title}</p>
            <p className="step-body-quote">{claim.claimText}</p>
          </div>
        </div>

        <div className="chain-connector">
          <ArrowRight size={16} />
        </div>

        {/* Step 2: Source */}
        <div className="chain-step-node step-source">
          <div className="step-badge">2. Source ({claim.sources.length})</div>
          <div className="step-content-card">
            <div className="step-card-header">
              <span className="step-meta">
                <Database size={12} /> {claim.sources[0]?.type || 'Document'}
              </span>
              <span className="step-rating">{claim.sources[0]?.authoritativeRating}</span>
            </div>
            <p className="step-source-name" title={claim.sources[0]?.name}>
              {claim.sources[0]?.name}
            </p>
            <div className="step-checksum">
              <Lock size={10} /> {claim.sources[0]?.checksum.substring(0, 20)}...
            </div>
            <button
              type="button"
              className="open-source-inline-btn"
              onClick={() => onOpenSource(claim.sources[0]?.id)}
            >
              <FileText size={12} /> Open Original Source
            </button>
          </div>
        </div>

        <div className="chain-connector">
          <ArrowRight size={16} />
        </div>

        {/* Step 3: Evidence (Passages) */}
        <div className="chain-step-node step-evidence">
          <div className="step-badge">3. Evidence ({claim.supportingPassages.length} Citations)</div>
          <div className="step-content-card">
            <div className="step-card-header">
              <span className="step-meta">
                <Quote size={12} /> Citation Proof
              </span>
              <span className="step-relevance">
                {Math.round((claim.supportingPassages[0]?.relevanceScore || 0.95) * 100)}% Match
              </span>
            </div>
            <p className="step-passage-text">
              &ldquo;{claim.supportingPassages[0]?.text.substring(0, 110)}...&rdquo;
            </p>
            <span className="step-location-tag">
              {claim.supportingPassages[0]?.location}
            </span>
          </div>
        </div>

        <div className="chain-connector">
          <ArrowRight size={16} />
        </div>

        {/* Step 4: Verification */}
        <div className="chain-step-node step-verification">
          <div className="step-badge">4. Verification</div>
          <div className="step-content-card">
            <div className="step-card-header">
              <span className="step-meta">Method</span>
              <span className={`status-pill ${claim.verification.status}`}>
                {claim.verification.status.toUpperCase()}
              </span>
            </div>
            <p className="step-verifier-name">{claim.verifier}</p>
            <p className="step-verification-method">{claim.verification.method}</p>
            <span className="step-verified-time">{claim.lastVerification}</span>
          </div>
        </div>

        <div className="chain-connector">
          <ArrowRight size={16} />
        </div>

        {/* Step 5: Grade */}
        <div className="chain-step-node step-grade">
          <div className="step-badge">5. Grade</div>
          <div className={`step-content-card grade-final-card ${gradeMeta.colorClass}`}>
            <div className="grade-icon-wrapper">{gradeMeta.icon}</div>
            <div className="grade-label-title">{gradeMeta.label}</div>
            <div className="grade-confidence-pill">
              Confidence: {Math.round(claim.confidence * 100)}%
            </div>
            <p className="grade-desc-mini">{gradeMeta.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
