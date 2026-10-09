import React, { useState } from 'react';
import {
  X,
  FileText,
  Lock,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  Calendar,
  Layers
} from 'lucide-react';
import { EvidenceSource, ClaimItem } from '../../types/evidence';

interface OriginalSourceViewerDrawerProps {
  source: EvidenceSource | null;
  claim: ClaimItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToast: (msg: string) => void;
}

export const OriginalSourceViewerDrawer: React.FC<OriginalSourceViewerDrawerProps> = ({
  source,
  claim,
  isOpen,
  onClose,
  onAddToast,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'checksum'>('content');

  if (!isOpen || !source) return null;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(source.checksum);
    setCopiedHash(true);
    onAddToast(`Copied cryptographic checksum for ${source.name}`);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExportCertificate = () => {
    onAddToast(`Exported SHA-256 evidence certificate for ${source.name}`);
  };

  // Filter or highlight content
  const rawContent = source.fullContent || source.snippet;

  return (
    <div className="source-viewer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="source-viewer-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Original Source Inspection Drawer"
      >
        {/* Drawer Header */}
        <div className="source-viewer-header">
          <div className="header-left">
            <div className="source-icon-badge">
              <FileText size={20} />
            </div>
            <div>
              <div className="source-meta-row">
                <span className="source-type-pill">{source.type}</span>
                <span className="source-rating-pill">Rating: {source.authoritativeRating}</span>
                {source.pageNumber && (
                  <span className="source-page-pill">Page {source.pageNumber}</span>
                )}
                {source.rowNumber && (
                  <span className="source-page-pill">Row #{source.rowNumber}</span>
                )}
              </div>
              <h2 className="source-title">{source.name}</h2>
            </div>
          </div>
          <div className="header-right">
            <button
              type="button"
              className="source-action-btn"
              onClick={handleExportCertificate}
              title="Download Evidence Certificate"
            >
              <Download size={15} />
              <span>Certify</span>
            </button>
            <button
              type="button"
              className="source-close-btn"
              onClick={onClose}
              aria-label="Close original source drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Checksum Bar */}
        <div className="source-checksum-bar">
          <div className="checksum-info">
            <Lock size={14} className="lock-icon" />
            <span className="checksum-label">SHA-256 Cryptographic Checksum:</span>
            <code className="checksum-code">{source.checksum}</code>
          </div>
          <button
            type="button"
            className="copy-hash-btn"
            onClick={handleCopyHash}
            title="Copy Checksum"
          >
            {copiedHash ? <Check size={14} className="copied-text" /> : <Copy size={14} />}
            <span>{copiedHash ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="source-tabs">
          <button
            type="button"
            className={`source-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <FileText size={14} /> Document Text & Citations
          </button>
          <button
            type="button"
            className={`source-tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            <Layers size={14} /> Provenance & Metadata
          </button>
          <button
            type="button"
            className={`source-tab-btn ${activeTab === 'checksum' ? 'active' : ''}`}
            onClick={() => setActiveTab('checksum')}
          >
            <Lock size={14} /> Cryptographic Proof
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="source-viewer-body">
          {activeTab === 'content' && (
            <div className="content-view-pane">
              {/* Search within document */}
              <div className="source-search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter or search within original source text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="source-search-input"
                />
              </div>

              {/* Citations Box Highlight */}
              {source.snippet && (
                <div className="exact-passage-highlight-box">
                  <div className="passage-header">
                    <span className="passage-badge">PRIMARY CITATION PASSAGE</span>
                    {source.sectionTitle && (
                      <span className="section-title-tag">{source.sectionTitle}</span>
                    )}
                  </div>
                  <blockquote className="passage-quote">
                    &ldquo;{source.snippet}&rdquo;
                  </blockquote>
                </div>
              )}

              {/* Full Raw Document View */}
              <div className="raw-document-container">
                <div className="raw-doc-header">
                  <span>Authoritative Raw Content Stream</span>
                  <span className="uri-text">{source.uri}</span>
                </div>
                <pre className="raw-content-text">
                  {rawContent}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="metadata-view-pane">
              <div className="meta-grid">
                <div className="meta-card">
                  <span className="meta-label">Storage URI</span>
                  <span className="meta-val code-val">{source.uri}</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Authoritative Rating</span>
                  <span className="meta-val">{source.authoritativeRating}</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Ingested Timestamp</span>
                  <span className="meta-val">
                    <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                    {source.timestamp}
                  </span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Referencing Claim</span>
                  <span className="meta-val">
                    {claim ? `${claim.claimId} — ${claim.title}` : 'General Reference'}
                  </span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Section / Coordinate</span>
                  <span className="meta-val">{source.sectionTitle || 'Consolidated Document'}</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">Data Ingest Node</span>
                  <span className="meta-val">synaptix-vault-worker-01 (TLS 1.3 Certified)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checksum' && (
            <div className="checksum-view-pane">
              <div className="crypto-audit-box">
                <h4 className="crypto-title">Tamper-Proof Digital Ledger Attestation</h4>
                <p className="crypto-desc">
                  This document content hash was registered into the Synaptix immutable ledger upon extraction. Any bit-level modification to this document would invalidate the cryptographic verification chain.
                </p>
                <div className="crypto-entry">
                  <span className="entry-key">Algorithm</span>
                  <span className="entry-val">SHA-256 (FIPS 180-4 Standard)</span>
                </div>
                <div className="crypto-entry">
                  <span className="entry-key">Hash Digest</span>
                  <span className="entry-val mono">{source.checksum}</span>
                </div>
                <div className="crypto-entry">
                  <span className="entry-key">Ledger Block State</span>
                  <span className="entry-val status-green">Committed & Verified (Block #8,912,044)</span>
                </div>
                <div className="crypto-entry">
                  <span className="entry-key">Verifier Signature</span>
                  <span className="entry-val mono">0x7a89f9102cba8411099238e810f11902</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="source-viewer-footer">
          <div className="footer-left">
            <span className="footer-status-dot" />
            <span>Immutable Source Record — Auditable at any time</span>
          </div>
          <div className="footer-right">
            <button type="button" className="footer-btn secondary" onClick={onClose}>
              Close Viewer
            </button>
            <button
              type="button"
              className="footer-btn primary"
              onClick={() => {
                onAddToast(`Opening external vault connection for ${source.name}`);
              }}
            >
              <ExternalLink size={14} /> Open in Enterprise Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
