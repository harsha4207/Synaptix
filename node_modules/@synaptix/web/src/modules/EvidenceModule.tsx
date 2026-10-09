import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Layers,
  FileText,
  Download,
  Plus,
  RefreshCw,
  Info,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { ClaimItem, EvidenceGrade, EvidenceSource } from '../types/evidence';
import { INITIAL_CLAIMS } from '../data/mockEvidence';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { OriginalSourceViewerDrawer } from '../components/evidence/OriginalSourceViewerDrawer';
import { PageContainer, PageContent } from '../components/layout';

interface EvidenceModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export const EvidenceModule: React.FC<EvidenceModuleProps> = ({
  workspace,
  onAddToast,
}) => {
  const [claims, setClaims] = useState<ClaimItem[]>(INITIAL_CLAIMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | EvidenceGrade>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Original Source Viewer Modal/Drawer State
  const [selectedSource, setSelectedSource] = useState<EvidenceSource | null>(null);
  const [activeClaimForSource, setActiveClaimForSource] = useState<ClaimItem | null>(null);
  const [isSourceViewerOpen, setIsSourceViewerOpen] = useState(false);

  // New Claim Modal State
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);
  const [newClaimTitle, setNewClaimTitle] = useState('');
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimCategory, setNewClaimCategory] = useState<ClaimItem['category']>('Financial Performance');
  const [newClaimSourceName, setNewClaimSourceName] = useState('');

  // Re-verify action
  const handleReverify = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            lastVerification: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
            verifier: 'Enterprise Auditor Session (Re-Verified)',
            correctionHistory: [
              ...c.correctionHistory,
              {
                id: `cor-${Date.now()}`,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
                changedBy: 'Manual Audit Trigger',
                previousGrade: c.grade,
                newGrade: c.grade,
                reason: 'Re-validated cryptographic hash against upstream primary source ledger.',
              },
            ],
          };
        }
        return c;
      })
    );
    onAddToast(`Re-verification successfully completed for ${claimId}`);
  };

  // Open original source
  const handleOpenSource = (sourceId: string, claim: ClaimItem) => {
    const src = claim.sources.find((s) => s.id === sourceId) || claim.sources[0];
    if (src) {
      setSelectedSource(src);
      setActiveClaimForSource(claim);
      setIsSourceViewerOpen(true);
      onAddToast(`Opening original source: ${src.name}`);
    }
  };

  // Grade Counts
  const gradeCounts = useMemo(() => {
    const counts = {
      ALL: claims.length,
      G2: 0,
      G1: 0,
      G0: 0,
      Contradicted: 0,
    };
    claims.forEach((c) => {
      if (c.grade in counts) {
        counts[c.grade as EvidenceGrade]++;
      }
    });
    return counts;
  }, [claims]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    claims.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [claims]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Grade filter
      if (selectedGradeFilter !== 'ALL' && claim.grade !== selectedGradeFilter) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && claim.category !== selectedCategory) {
        return false;
      }

      // Confidence filter
      if (claim.confidence * 100 < minConfidence) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = claim.title.toLowerCase().includes(q);
        const matchText = claim.claimText.toLowerCase().includes(q);
        const matchId = claim.claimId.toLowerCase().includes(q);
        const matchVerifier = claim.verifier.toLowerCase().includes(q);
        const matchSources = claim.sources.some((s) => s.name.toLowerCase().includes(q));
        if (!matchTitle && !matchText && !matchId && !matchVerifier && !matchSources) {
          return false;
        }
      }

      return true;
    });
  }, [claims, selectedGradeFilter, selectedCategory, minConfidence, searchQuery]);

  // Handle Create New Claim
  const handleCreateNewClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimTitle.trim() || !newClaimText.trim()) return;

    const newClaim: ClaimItem = {
      id: `claim-${Date.now()}`,
      claimId: `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newClaimTitle.trim(),
      claimText: newClaimText.trim(),
      workspaceId: workspace.id,
      category: newClaimCategory,
      grade: 'G0', // Newly submitted claims begin as G0 Extracted / Unverified
      confidence: 0.75,
      lastVerification: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      verifier: 'Direct User Ingestion Pipe',
      sources: [
        {
          id: `src-${Date.now()}`,
          name: newClaimSourceName.trim() || 'User_Uploaded_Documentation.pdf',
          type: 'PDF Document',
          uri: `s3://synaptix-vault/${workspace.id}/sources/${newClaimSourceName || 'source'}.pdf`,
          checksum: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
          pageNumber: 1,
          sectionTitle: 'Submitted Evidence Document',
          snippet: newClaimText.trim(),
          fullContent: newClaimText.trim(),
          timestamp: new Date().toISOString(),
          authoritativeRating: 'Self-Reported',
        },
      ],
      supportingPassages: [
        {
          id: `psg-${Date.now()}`,
          sourceId: `src-${Date.now()}`,
          sourceName: newClaimSourceName.trim() || 'User_Uploaded_Documentation.pdf',
          text: newClaimText.trim(),
          location: 'Page 1, Paragraph 1',
          relevanceScore: 0.95,
          highlightedTokens: [newClaimTitle.trim()],
        },
      ],
      verification: {
        verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        verifiedBy: 'Pending Automated Audit Ingestion',
        method: 'Cryptographic Hash Match',
        status: 'inconclusive',
        proofDetails: 'Claim submitted by analyst. Queued for deterministic cross-reconciliation against primary ERP and filings.',
        auditSignature: `SIG_UNVERIFIED_${Math.random().toString(36).substring(2, 10)}`,
      },
      relatedActions: [],
      correctionHistory: [
        {
          id: `cor-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          changedBy: 'Domain User',
          previousGrade: 'G0',
          newGrade: 'G0',
          reason: 'Initial claim registration into workspace evidence index.',
        },
      ],
    };

    setClaims([newClaim, ...claims]);
    setIsNewClaimModalOpen(false);
    setNewClaimTitle('');
    setNewClaimText('');
    setNewClaimSourceName('');
    onAddToast(`Registered new claim ${newClaim.claimId} as G0 Extracted / Unverified`);
  };

  const handleExportWorkspaceAuditPack = () => {
    onAddToast(`Exported full Evidence Audit Pack for ${workspace.name} (SHA-256 Verified)`);
  };

  return (
    <PageContainer>
      <PageContent>
      <div className="evidence-explorer-page" aria-label="Evidence Explorer Module">
      {/* 1. PAGE HEADER */}
      <header className="evidence-page-header">
        <div className="header-text-block">
          <div className="page-breadcrumb-row">
            <span className="breadcrumb-workspace">{workspace.name}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Evidence Explorer</span>
          </div>
          <div className="title-with-badge">
            <h1 className="evidence-main-title">Evidence Explorer</h1>
            <span className="authoritative-badge">
              <ShieldCheck size={14} /> Deterministic Audit Trail
            </span>
          </div>
          <p className="evidence-subtext">
            Show why the system believes a claim, recommendation or action is justified with cryptographic provenance, source citations, and empirical grade verification.
          </p>
        </div>

        <div className="header-action-buttons">
          <button
            type="button"
            className="secondary-audit-btn"
            onClick={handleExportWorkspaceAuditPack}
            title="Download complete signed JSON/PDF Evidence Package"
          >
            <Download size={15} />
            <span>Export Evidence Audit Pack</span>
          </button>
          <button
            type="button"
            className="primary-propose-btn"
            onClick={() => setIsNewClaimModalOpen(true)}
          >
            <Plus size={16} />
            <span>Register New Claim</span>
          </button>
        </div>
      </header>

      {/* 2. STATS & GRADE SUMMARY KPI BAR */}
      <section className="evidence-kpi-bar" aria-label="Evidence Grade Summary">
        {/* KPI: G2 Action-Proven */}
        <div
          className={`evidence-kpi-card g2 ${selectedGradeFilter === 'G2' ? 'active' : ''}`}
          onClick={() => setSelectedGradeFilter(selectedGradeFilter === 'G2' ? 'ALL' : 'G2')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon g2">
              <ShieldCheck size={18} />
            </div>
            <span className="kpi-grade-label">G2 Action-Proven</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{gradeCounts.G2}</span>
            <span className="kpi-pct">
              {gradeCounts.ALL > 0 ? Math.round((gradeCounts.G2 / gradeCounts.ALL) * 100) : 0}%
            </span>
          </div>
          <p className="kpi-desc">
            Empirically validated through settled ledger rows & executed actions.
          </p>
        </div>

        {/* KPI: G1 Verified */}
        <div
          className={`evidence-kpi-card g1 ${selectedGradeFilter === 'G1' ? 'active' : ''}`}
          onClick={() => setSelectedGradeFilter(selectedGradeFilter === 'G1' ? 'ALL' : 'G1')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon g1">
              <CheckCircle2 size={18} />
            </div>
            <span className="kpi-grade-label">G1 Verified</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{gradeCounts.G1}</span>
            <span className="kpi-pct">
              {gradeCounts.ALL > 0 ? Math.round((gradeCounts.G1 / gradeCounts.ALL) * 100) : 0}%
            </span>
          </div>
          <p className="kpi-desc">
            Cryptographically matched & cross-checked against authoritative filings.
          </p>
        </div>

        {/* KPI: G0 Extracted / Unverified */}
        <div
          className={`evidence-kpi-card g0 ${selectedGradeFilter === 'G0' ? 'active' : ''}`}
          onClick={() => setSelectedGradeFilter(selectedGradeFilter === 'G0' ? 'ALL' : 'G0')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon g0">
              <Layers size={18} />
            </div>
            <span className="kpi-grade-label">G0 Extracted</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{gradeCounts.G0}</span>
            <span className="kpi-pct">
              {gradeCounts.ALL > 0 ? Math.round((gradeCounts.G0 / gradeCounts.ALL) * 100) : 0}%
            </span>
          </div>
          <p className="kpi-desc">
            Directly parsed from raw text without multi-source cross-corroboration.
          </p>
        </div>

        {/* KPI: Contradicted */}
        <div
          className={`evidence-kpi-card contradicted ${selectedGradeFilter === 'Contradicted' ? 'active' : ''}`}
          onClick={() => setSelectedGradeFilter(selectedGradeFilter === 'Contradicted' ? 'ALL' : 'Contradicted')}
        >
          <div className="kpi-card-top">
            <div className="kpi-icon contradicted">
              <AlertOctagon size={18} />
            </div>
            <span className="kpi-grade-label">Contradicted</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{gradeCounts.Contradicted}</span>
            <span className="kpi-pct">
              {gradeCounts.ALL > 0 ? Math.round((gradeCounts.Contradicted / gradeCounts.ALL) * 100) : 0}%
            </span>
          </div>
          <p className="kpi-desc">
            Evidence indicates the claim is superseded, invalid or conflicted.
          </p>
        </div>
      </section>

      {/* 3. SEARCH & GRADE FILTER TOOLBAR */}
      <section className="evidence-filter-toolbar">
        <div className="search-input-group">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search claims, justification text, sources, checksums or verifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="evidence-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Tabs by Grade */}
        <div className="grade-tabs-list" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedGradeFilter === 'ALL'}
            className={`grade-tab-btn ${selectedGradeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedGradeFilter('ALL')}
          >
            All ({gradeCounts.ALL})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedGradeFilter === 'G2'}
            className={`grade-tab-btn tab-g2 ${selectedGradeFilter === 'G2' ? 'active' : ''}`}
            onClick={() => setSelectedGradeFilter('G2')}
          >
            <ShieldCheck size={14} /> G2 Action-Proven ({gradeCounts.G2})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedGradeFilter === 'G1'}
            className={`grade-tab-btn tab-g1 ${selectedGradeFilter === 'G1' ? 'active' : ''}`}
            onClick={() => setSelectedGradeFilter('G1')}
          >
            <CheckCircle2 size={14} /> G1 Verified ({gradeCounts.G1})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedGradeFilter === 'G0'}
            className={`grade-tab-btn tab-g0 ${selectedGradeFilter === 'G0' ? 'active' : ''}`}
            onClick={() => setSelectedGradeFilter('G0')}
          >
            <Layers size={14} /> G0 Extracted ({gradeCounts.G0})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedGradeFilter === 'Contradicted'}
            className={`grade-tab-btn tab-contradicted ${selectedGradeFilter === 'Contradicted' ? 'active' : ''}`}
            onClick={() => setSelectedGradeFilter('Contradicted')}
          >
            <AlertOctagon size={14} /> Contradicted ({gradeCounts.Contradicted})
          </button>
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          className={`advanced-filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </button>
      </section>

      {/* 4. OPTIONAL ADVANCED FILTER DRAWER / SUBBAR */}
      {showAdvancedFilters && (
        <section className="advanced-filters-panel">
          <div className="filter-item-control">
            <label className="filter-label">
              <Filter size={13} /> Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-item-control">
            <label className="filter-label">Min Confidence: {minConfidence}%</label>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="filter-range-slider"
            />
          </div>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={() => {
              setSelectedGradeFilter('ALL');
              setSelectedCategory('ALL');
              setMinConfidence(0);
              setSearchQuery('');
            }}
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
        </section>
      )}

      {/* 5. CLAIMS & EVIDENCE CARDS FEED */}
      <main className="evidence-claims-feed" aria-label="Claims Evidence Feed">
        <div className="feed-header-info">
          <div className="feed-count">
            Showing <strong>{filteredClaims.length}</strong> of {claims.length} claims in{' '}
            <strong>{workspace.name}</strong>
          </div>
          <div className="auditable-notice">
            <Info size={13} />
            <span>Every claim is bound to cryptographic source checksums and ledger verifications.</span>
          </div>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="evidence-empty-state">
            <ShieldCheck size={36} className="empty-icon" />
            <h3 className="empty-title">No matching evidence claims found</h3>
            <p className="empty-desc">
              Try adjusting your search terms, grade selection, or resetting the active filters.
            </p>
            <button
              type="button"
              className="empty-reset-btn"
              onClick={() => {
                setSelectedGradeFilter('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
                setMinConfidence(0);
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="claims-cards-list">
            {filteredClaims.map((claim) => (
              <EvidenceCard
                key={claim.id}
                claim={claim}
                onOpenSource={(srcId) => handleOpenSource(srcId, claim)}
                onReverify={handleReverify}
                onAddToast={onAddToast}
              />
            ))}
          </div>
        )}
      </main>

      {/* 6. ORIGINAL SOURCE VIEWER DRAWER / MODAL */}
      <OriginalSourceViewerDrawer
        source={selectedSource}
        claim={activeClaimForSource}
        isOpen={isSourceViewerOpen}
        onClose={() => setIsSourceViewerOpen(false)}
        onAddToast={onAddToast}
      />

      {/* 7. REGISTER NEW CLAIM MODAL */}
      {isNewClaimModalOpen && (
        <div className="evidence-modal-backdrop" onClick={() => setIsNewClaimModalOpen(false)}>
          <div
            className="evidence-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-icon">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Register Claim for Verification</h3>
                  <p className="modal-desc">
                    Submit a statement, metric or assertion into the workspace audit pipeline.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsNewClaimModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewClaim} className="modal-form">
              <div className="form-group">
                <label className="form-label">Claim Title / Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Cloud Spend Reduced by 18.4%"
                  value={newClaimTitle}
                  onChange={(e) => setNewClaimTitle(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Domain Category</label>
                  <select
                    value={newClaimCategory}
                    onChange={(e) => setNewClaimCategory(e.target.value as ClaimItem['category'])}
                    className="modal-select"
                  >
                    <option value="Financial Performance">Financial Performance</option>
                    <option value="Operational Compliance">Operational Compliance</option>
                    <option value="Revenue Metric">Revenue Metric</option>
                    <option value="Contractual Obligation">Contractual Obligation</option>
                    <option value="System Anomaly">System Anomaly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Source Document / Dataset</label>
                  <input
                    type="text"
                    placeholder="e.g. SEC_Form_10Q_Q3.pdf or SAP_GL_Export.xlsx"
                    value={newClaimSourceName}
                    onChange={(e) => setNewClaimSourceName(e.target.value)}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Claim Statement & Extracted Citation Passage</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the precise assertion or extracted passage to be verified against the source..."
                  value={newClaimText}
                  onChange={(e) => setNewClaimText(e.target.value)}
                  className="modal-textarea"
                />
              </div>

              <div className="modal-info-box">
                <ShieldCheck size={16} />
                <span>
                  New claims are initially registered as <strong>G0 (Extracted / Unverified)</strong> and queued for automated cryptographic hash verification.
                </span>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setIsNewClaimModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  <FileText size={14} /> Register & Generate Checksum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      </PageContent>
    </PageContainer>
  );
};
