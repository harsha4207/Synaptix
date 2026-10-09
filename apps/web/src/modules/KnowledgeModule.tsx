import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Layers,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { KnowledgeGraph, GraphNode, GraphEdge } from '../components/knowledge/KnowledgeGraph';
import { EntityDetailDrawer } from '../components/knowledge/EntityDetailDrawer';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface KnowledgeModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export interface ClaimItemData {
  id: string;
  claim: string;
  supportingSources: string[];
  relatedEntities: string[];
  evidenceGrade: 'G1 Verified' | 'G2 Parsed' | 'G3 Inferred';
  confidenceScore: number;
  lastVerified: string;
  evidenceHash: string;
  citations: string[];
  triples: string[];
}

export const KnowledgeModule: React.FC<KnowledgeModuleProps> = ({
  workspace,
  onAddToast,
}) => {
  // Mock Graph Nodes tailored to workspace
  const initialNodes: GraphNode[] = [
    {
      id: 'n1',
      label: `${workspace.name} Workspace`,
      type: 'Boundary',
      x: 400,
      y: 220,
      color: '#1769E0',
      description: `Central domain boundary container for ${workspace.name} organizational intelligence.`,
      documentCount: workspace.documentCount,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n2',
      label: 'Vendor Operations',
      type: 'Entity',
      x: 210,
      y: 125,
      color: '#D97706',
      description: 'Operational cost center managing vendor requisitions and invoice processing.',
      documentCount: 14,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n3',
      label: 'Gross Margin Variance',
      type: 'Metric',
      x: 590,
      y: 125,
      color: '#059669',
      description: 'Calculated variance metric representing Q3 margin acceleration (+4.2%).',
      documentCount: 8,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n4',
      label: 'KPMG Compliance Audit',
      type: 'Audit',
      x: 190,
      y: 320,
      color: '#7C3AED',
      description: 'Annual executive compliance audit certification and RBAC rule matrix.',
      documentCount: 22,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n5',
      label: 'SAML 2.0 Policy',
      type: 'Governance',
      x: 610,
      y: 320,
      color: '#0D9488',
      description: 'Identity and access control policy governing action approval workflow execution.',
      documentCount: 12,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n6',
      label: 'Capital Requisition #8821',
      type: 'Action Item',
      x: 400,
      y: 52,
      color: '#EF4444',
      description: 'Pending policy requisition ($150,000) awaiting executive RBAC sign-off.',
      documentCount: 4,
      evidenceGrade: 'G2 Parsed',
    }
  ];

  // Mock Graph Edges
  const initialEdges: GraphEdge[] = [
    { id: 'e1', source: 'n1', target: 'n2', label: 'contains_node' },
    { id: 'e2', source: 'n1', target: 'n3', label: 'has_metric' },
    { id: 'e3', source: 'n1', target: 'n4', label: 'audited_by' },
    { id: 'e4', source: 'n1', target: 'n5', label: 'governed_by' },
    { id: 'e5', source: 'n2', target: 'n6', label: 'has_requisition' },
    { id: 'e6', source: 'n3', target: 'n2', label: 'evaluated_in' },
    { id: 'e7', source: 'n5', target: 'n6', label: 'validates' },
  ];

  // Mock Claims List
  const initialClaims: ClaimItemData[] = [
    {
      id: 'cl-1',
      claim: `Gross Margin forecast accelerated by +4.2% following ${workspace.name} vendor optimization.`,
      supportingSources: ['Annual Report FY2026', 'Financial Dataset v4', 'Transaction Ledger Q3'],
      relatedEntities: ['Vendor Operations', 'Gross Margin Variance', `${workspace.name} Workspace`],
      evidenceGrade: 'G1 Verified',
      confidenceScore: 98,
      lastVerified: '10 minutes ago',
      evidenceHash: 'sha256-7f9a2b1c4e7d3a5b6c8d9e0f1a2b3c4d5e6f7a8b',
      citations: [
        `${workspace.name}_annual_forecast_FY26.pdf (p.14, paragraph 3)`,
        `Q3_Financial_Model.xlsx (Sheet 2, Cell B14)`,
      ],
      triples: [
        `[${workspace.name}] --(has_metric)--> [Gross Margin Variance]`,
        `[Gross Margin Variance] --(evaluated_in)--> [Vendor Operations]`,
      ],
    },
    {
      id: 'cl-2',
      claim: 'Unusual expense variance flagged in Operations budget ($42,500 unallocated requisition).',
      supportingSources: ['Vendor Ledger Q3', 'Audit Log File'],
      relatedEntities: ['Vendor Operations', 'Capital Requisition #8821'],
      evidenceGrade: 'G1 Verified',
      confidenceScore: 94,
      lastVerified: '25 minutes ago',
      evidenceHash: 'sha256-9c4d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
      citations: [
        `Vendor_Ledger_Q3_2026.csv (Lines 412-480)`,
        `RBAC_Audit_Rules_v2.json`,
      ],
      triples: [
        `[Vendor Operations] --(has_requisition)--> [Capital Requisition #8821]`,
        `[SAML 2.0 Policy] --(validates)--> [Capital Requisition #8821]`,
      ],
    },
    {
      id: 'cl-3',
      claim: 'SAML 2.0 RBAC governance policy enforces multi-factor authorization for capital actions.',
      supportingSources: ['Governance Policy docx', 'RBAC Matrix json'],
      relatedEntities: ['SAML 2.0 Policy', 'KPMG Compliance Audit'],
      evidenceGrade: 'G1 Verified',
      confidenceScore: 99,
      lastVerified: '1 hour ago',
      evidenceHash: 'sha256-3a1b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
      citations: [
        `${workspace.name.toLowerCase()}_governance_policy.docx (p.8)`,
        `SAML2_RBAC_Matrix.json`,
      ],
      triples: [
        `[${workspace.name}] --(governed_by)--> [SAML 2.0 Policy]`,
        `[KPMG Compliance Audit] --(certifies)--> [SAML 2.0 Policy]`,
      ],
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('All');
  const [selectedDocFilter, setSelectedDocFilter] = useState('All');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');
  const [selectedConfidenceFilter, setSelectedConfidenceFilter] = useState('All');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All');

  // Selected Node & Drawer State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Expandable Evidence Cards State
  const [expandedClaimIds, setExpandedClaimIds] = useState<Set<string>>(new Set(['cl-1']));
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleClaimExpansion = (id: string) => {
    setExpandedClaimIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    onAddToast('Copied SHA-256 fingerprint to clipboard');
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const renderKnowledgeTriple = (triple: string) => {
    const match = triple.match(/\[(.*?)\]\s*--(.*?)-->\s*\[(.*?)\]/);
    if (match) {
      const [, subject, relation, object] = match;
      const cleanRelation = relation.replace(/[()]/g, '').trim();
      return (
        <div className="flex flex-wrap items-center gap-2 p-2 sm:p-2.5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs font-mono shadow-xs">
          <span className="px-2 py-0.5 rounded bg-[var(--c-page)] border border-[var(--c-border)] font-semibold text-[var(--c-text-1)]">
            {subject}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--c-blue-soft)] text-[var(--c-blue)] text-[11px] font-bold">
            <ArrowRight size={11} />
            {cleanRelation}
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--c-page)] border border-[var(--c-border)] font-semibold text-[var(--c-text-1)]">
            {object}
          </span>
        </div>
      );
    }
    return (
      <div className="p-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs font-mono text-[var(--c-text-1)]">
        {triple}
      </div>
    );
  };

  // Filtered Claims List
  const filteredClaims = initialClaims.filter((cl) => {
    const matchesSearch =
      cl.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cl.relatedEntities.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity = selectedEntityFilter === 'All' || cl.relatedEntities.includes(selectedEntityFilter);
    const matchesGrade = selectedGradeFilter === 'All' || cl.evidenceGrade === selectedGradeFilter;
    const matchesSource = selectedSourceFilter === 'All' || cl.supportingSources.some((s) => s.includes(selectedSourceFilter));

    return matchesSearch && matchesEntity && matchesGrade && matchesSource;
  });

  return (
    <PageContainer>
      {/* 1. TOP HEADER */}
      <PageHeader
        title={`${workspace.name} Organizational Intelligence`}
        description="Synthesized claims, semantic entities, and cryptographically verified knowledge graph."
        breadcrumb={`SYNAPTIX COMMAND / ${workspace.name.toUpperCase()} / KNOWLEDGE GRAPH`}
        badge={
          <Badge variant="blue">
            <ShieldCheck size={13} style={{ marginRight: '4px' }} />
            {workspace.domain} Knowledge Boundary
          </Badge>
        }
      />

      <PageContent>
        {/* 2. KNOWLEDGE SEARCH & MULTI-FILTER BAR */}
        <div className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-xs p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
          {/* Top Search Bar */}
          <div className="w-full min-w-0">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search this workspace's knowledge, claims, or entity triples..."
              leftIcon={<Search size={18} className="text-[var(--c-text-3)]" />}
              className="h-[52px] sm:h-[54px] text-xs sm:text-sm w-full rounded-xl border-[var(--c-border)] bg-[var(--c-surface)] shadow-none focus-visible:border-[var(--c-blue)] focus-visible:ring-2 focus-visible:ring-[var(--c-blue)]/20 transition-all"
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* 5-Column Responsive Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
            {/* Entity Filter */}
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label htmlFor="filter-entity" className="text-xs sm:text-[13px] font-semibold text-[var(--c-text-2)] leading-none select-none">
                Entity
              </label>
              <div className="relative flex items-center w-full min-w-0">
                <select
                  id="filter-entity"
                  value={selectedEntityFilter}
                  onChange={(e) => setSelectedEntityFilter(e.target.value)}
                  className="w-full h-12 px-3.5 pr-8 text-xs sm:text-[13px] font-medium bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text-1)] hover:border-[var(--c-border-2)] hover:bg-[var(--c-surface-2)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue)]/20 focus:outline-none cursor-pointer appearance-none transition-all truncate"
                >
                  <option value="All">All Entities</option>
                  <option value="Vendor Operations">Vendor Operations</option>
                  <option value="Gross Margin Variance">Gross Margin Variance</option>
                  <option value="SAML 2.0 Policy">SAML 2.0 Policy</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)] pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Document Filter */}
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label htmlFor="filter-doc" className="text-xs sm:text-[13px] font-semibold text-[var(--c-text-2)] leading-none select-none">
                Document
              </label>
              <div className="relative flex items-center w-full min-w-0">
                <select
                  id="filter-doc"
                  value={selectedDocFilter}
                  onChange={(e) => setSelectedDocFilter(e.target.value)}
                  className="w-full h-12 px-3.5 pr-8 text-xs sm:text-[13px] font-medium bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text-1)] hover:border-[var(--c-border-2)] hover:bg-[var(--c-surface-2)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue)]/20 focus:outline-none cursor-pointer appearance-none transition-all truncate"
                >
                  <option value="All">All Documents</option>
                  <option value="Annual Report">Annual Report</option>
                  <option value="Financial Dataset">Financial Dataset</option>
                  <option value="Transaction Ledger">Transaction Ledger</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)] pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Evidence Grade Filter */}
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label htmlFor="filter-grade" className="text-xs sm:text-[13px] font-semibold text-[var(--c-text-2)] leading-none select-none">
                Evidence Grade
              </label>
              <div className="relative flex items-center w-full min-w-0">
                <select
                  id="filter-grade"
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                  className="w-full h-12 px-3.5 pr-8 text-xs sm:text-[13px] font-medium bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text-1)] hover:border-[var(--c-border-2)] hover:bg-[var(--c-surface-2)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue)]/20 focus:outline-none cursor-pointer appearance-none transition-all truncate"
                >
                  <option value="All">All Grades</option>
                  <option value="G1 Verified">G1 Verified</option>
                  <option value="G2 Parsed">G2 Parsed</option>
                  <option value="G3 Inferred">G3 Inferred</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)] pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Confidence Filter */}
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label htmlFor="filter-confidence" className="text-xs sm:text-[13px] font-semibold text-[var(--c-text-2)] leading-none select-none">
                Confidence
              </label>
              <div className="relative flex items-center w-full min-w-0">
                <select
                  id="filter-confidence"
                  value={selectedConfidenceFilter}
                  onChange={(e) => setSelectedConfidenceFilter(e.target.value)}
                  className="w-full h-12 px-3.5 pr-8 text-xs sm:text-[13px] font-medium bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text-1)] hover:border-[var(--c-border-2)] hover:bg-[var(--c-surface-2)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue)]/20 focus:outline-none cursor-pointer appearance-none transition-all truncate"
                >
                  <option value="All">All Confidence</option>
                  <option value="95+">95%+ High Confidence</option>
                  <option value="90+">90%+ Medium</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)] pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Source Filter */}
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label htmlFor="filter-source" className="text-xs sm:text-[13px] font-semibold text-[var(--c-text-2)] leading-none select-none">
                Source
              </label>
              <div className="relative flex items-center w-full min-w-0">
                <select
                  id="filter-source"
                  value={selectedSourceFilter}
                  onChange={(e) => setSelectedSourceFilter(e.target.value)}
                  className="w-full h-12 px-3.5 pr-8 text-xs sm:text-[13px] font-medium bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl text-[var(--c-text-1)] hover:border-[var(--c-border-2)] hover:bg-[var(--c-surface-2)] focus:border-[var(--c-blue)] focus:ring-2 focus:ring-[var(--c-blue)]/20 focus:outline-none cursor-pointer appearance-none transition-all truncate"
                >
                  <option value="All">All Sources</option>
                  <option value="Annual Report">Annual Report</option>
                  <option value="Ledger">Transaction Ledger</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--c-text-3)] pointer-events-none shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE KNOWLEDGE GRAPH VISUALIZATION */}
        <KnowledgeGraph
          nodes={initialNodes}
          edges={initialEdges}
          onSelectNode={(node) => setSelectedNode(node)}
          selectedNodeId={selectedNode?.id}
        />

        {/* 4. SYNTHESIZED CLAIMS & EVIDENCE RESULTS */}
        <section className="claims-section-container" aria-label="Synthesized Knowledge Claims">
          <div className="claims-section-header-row">
            <div>
              <h2 className="claims-section-title">
                Verified Claims & Intelligence ({filteredClaims.length})
              </h2>
              <p className="claims-section-subtitle">
                Synthesized statements backed by cryptographic evidence chains
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-left">
            {filteredClaims.map((cl) => {
              const isExpanded = expandedClaimIds.has(cl.id);

              return (
                <div key={cl.id} className="claim-verified-card">
                  {/* Top Claim Header */}
                  <div className="claim-header-row">
                    <div className="claim-badges-group">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--c-success-bg)] text-[var(--c-success)] border border-[var(--c-success-border)]">
                        <ShieldCheck size={13} />
                        <span>{cl.evidenceGrade}</span>
                      </span>
                      <Badge variant="blue" size="sm" className="font-semibold">
                        {cl.confidenceScore}% Confidence
                      </Badge>
                      <span className="text-xs text-[var(--c-text-3)] font-medium">
                        Verified {cl.lastVerified}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleClaimExpansion(cl.id)}
                      className="text-xs font-semibold text-[var(--c-text-2)] hover:text-[var(--c-blue)] gap-1.5 h-8 shrink-0"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? 'Hide Evidence' : 'Inspect Evidence'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                  </div>

                  {/* Claim Statement */}
                  <div className="claim-statement-text">
                    "{cl.claim}"
                  </div>

                  {/* Related Entities & Sources Row */}
                  <div className="claim-meta-details-row">
                    {/* Sources */}
                    <div className="claim-meta-item">
                      <span className="claim-meta-item-label">Sources:</span>
                      {cl.supportingSources.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--c-page)] border border-[var(--c-border)] text-xs text-[var(--c-text-2)] font-medium"
                        >
                          <FileText size={12} className="text-[var(--c-text-3)] shrink-0" />
                          <span>{src}</span>
                        </span>
                      ))}
                    </div>

                    {/* Entities */}
                    <div className="claim-meta-item">
                      <span className="claim-meta-item-label">Entities:</span>
                      {cl.relatedEntities.map((ent, i) => (
                        <button
                          key={i}
                          type="button"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--c-blue-soft)] border border-[var(--c-blue-subtle)] text-[var(--c-blue)] text-xs font-semibold hover:bg-[var(--c-blue-muted)] transition-colors cursor-pointer"
                          onClick={() => {
                            const matchingNode = initialNodes.find((n) => n.label === ent);
                            if (matchingNode) setSelectedNode(matchingNode);
                            else onAddToast(`Inspecting entity ${ent}`);
                          }}
                        >
                          <Tag size={12} />
                          <span>{ent}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* EXPANDABLE EVIDENCE VIEW CONTAINER */}
                  {isExpanded && (
                    <div className="claim-evidence-chain-panel">
                      {/* Evidence Title */}
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--c-text-1)] uppercase tracking-wider">
                        <Layers size={15} className="text-[var(--c-blue)] shrink-0" />
                        <span>Evidence Chain & Verification Manifest</span>
                      </div>

                      {/* Fingerprint */}
                      <div className="claim-fingerprint-row">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="font-bold text-[var(--c-text-3)] shrink-0">Cryptographic SHA-256 Fingerprint:</span>
                          <code className="font-mono text-xs text-[var(--c-blue)] font-semibold break-all select-all">
                            {cl.evidenceHash}
                          </code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyHash(cl.evidenceHash)}
                          className="h-7 px-2.5 text-xs text-[var(--c-text-2)] hover:text-[var(--c-blue)] shrink-0 gap-1.5"
                          title="Copy fingerprint"
                        >
                          {copiedHash === cl.evidenceHash ? (
                            <>
                              <Check size={13} className="text-emerald-500" />
                              <span className="text-emerald-600 font-semibold text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Direct Source Citations */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-[var(--c-text-3)] uppercase tracking-wider">
                          Direct Source Citations:
                        </span>
                        <div className="flex flex-col gap-2">
                          {cl.citations.map((cit, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 p-2.5 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text-1)]"
                            >
                              <FileText size={14} className="text-[var(--c-blue)] shrink-0" />
                              <span className="font-medium leading-relaxed">{cit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Extracted Knowledge Triples */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold text-[var(--c-text-3)] uppercase tracking-wider">
                          Extracted Knowledge Triples:
                        </span>
                        <div className="flex flex-col gap-2">
                          {cl.triples.map((t, i) => (
                            <React.Fragment key={i}>
                              {renderKnowledgeTriple(t)}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* SAML Proof Footer */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--c-border)] text-xs text-[var(--c-text-2)] font-medium">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Governed by SAML 2.0 RBAC Audit Policy • Verified Immutable</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      {/* 5. ENTITY DETAIL INSPECTOR DRAWER */}
      <EntityDetailDrawer
        workspace={workspace}
        node={selectedNode}
        allNodes={initialNodes}
        allEdges={initialEdges}
        onClose={() => setSelectedNode(null)}
        onAddToast={onAddToast}
      />
      </PageContent>
    </PageContainer>
  );
};
