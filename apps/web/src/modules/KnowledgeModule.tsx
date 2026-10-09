import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { KnowledgeGraph, GraphNode, GraphEdge } from '../components/knowledge/KnowledgeGraph';
import { EntityDetailDrawer } from '../components/knowledge/EntityDetailDrawer';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Badge } from '../components/ui/Badge';

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
      y: 210,
      color: '#1769E0',
      description: `Central domain boundary container for ${workspace.name} organizational intelligence.`,
      documentCount: workspace.documentCount,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n2',
      label: 'Vendor Operations',
      type: 'Entity',
      x: 220,
      y: 110,
      color: '#D97706',
      description: 'Operational cost center managing vendor requisitions and invoice processing.',
      documentCount: 14,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n3',
      label: 'Gross Margin Variance',
      type: 'Metric',
      x: 580,
      y: 110,
      color: '#059669',
      description: 'Calculated variance metric representing Q3 margin acceleration (+4.2%).',
      documentCount: 8,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n4',
      label: 'KPMG Compliance Audit',
      type: 'Audit',
      x: 180,
      y: 310,
      color: '#7C3AED',
      description: 'Annual executive compliance audit certification and RBAC rule matrix.',
      documentCount: 22,
      evidenceGrade: 'G1 Verified',
    },
    {
      id: 'n5',
      label: 'SAML 2.0 Policy',
      type: 'Governance',
      x: 620,
      y: 310,
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
      y: 60,
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

  const toggleClaimExpansion = (id: string) => {
    setExpandedClaimIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
      <div className="knowledge-filter-section">
        <div className="search-bar-row">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search this workspace's knowledge, claims, or entity triples..."
            className="knowledge-search-input"
          />
        </div>

        {/* Filters Group */}
        <div className="filters-grid">
          {/* Entity Filter */}
          <div className="filter-item">
            <label className="filter-label">Entity</label>
            <select
              value={selectedEntityFilter}
              onChange={(e) => setSelectedEntityFilter(e.target.value)}
              className="filter-select-sm"
            >
              <option value="All">All Entities</option>
              <option value="Vendor Operations">Vendor Operations</option>
              <option value="Gross Margin Variance">Gross Margin Variance</option>
              <option value="SAML 2.0 Policy">SAML 2.0 Policy</option>
            </select>
          </div>

          {/* Document Filter */}
          <div className="filter-item">
            <label className="filter-label">Document</label>
            <select
              value={selectedDocFilter}
              onChange={(e) => setSelectedDocFilter(e.target.value)}
              className="filter-select-sm"
            >
              <option value="All">All Documents</option>
              <option value="Annual Report">Annual Report</option>
              <option value="Financial Dataset">Financial Dataset</option>
              <option value="Transaction Ledger">Transaction Ledger</option>
            </select>
          </div>

          {/* Evidence Grade Filter */}
          <div className="filter-item">
            <label className="filter-label">Evidence Grade</label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="filter-select-sm"
            >
              <option value="All">All Grades</option>
              <option value="G1 Verified">G1 Verified</option>
              <option value="G2 Parsed">G2 Parsed</option>
              <option value="G3 Inferred">G3 Inferred</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="filter-item">
            <label className="filter-label">Confidence</label>
            <select
              value={selectedConfidenceFilter}
              onChange={(e) => setSelectedConfidenceFilter(e.target.value)}
              className="filter-select-sm"
            >
              <option value="All">All Confidence</option>
              <option value="95+">95%+ High Confidence</option>
              <option value="90+">90%+ Medium</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="filter-item">
            <label className="filter-label">Source</label>
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="filter-select-sm"
            >
              <option value="All">All Sources</option>
              <option value="Annual Report">Annual Report</option>
              <option value="Ledger">Transaction Ledger</option>
            </select>
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
      <section className="claims-section" aria-label="Synthesized Knowledge Claims">
        <div className="section-header-row">
          <div>
            <h2 className="section-heading-title">Verified Claims & Intelligence ({filteredClaims.length})</h2>
            <p className="section-subtitle">Synthesized statements backed by cryptographic evidence chains</p>
          </div>
        </div>

        <div className="claims-list">
          {filteredClaims.map((cl) => {
            const isExpanded = expandedClaimIds.has(cl.id);

            return (
              <div key={cl.id} className="claim-card-wrapper">
                {/* Top Claim Header */}
                <div className="claim-header-row">
                  <div className="claim-meta-left">
                    <span className="evidence-grade-badge">
                      <ShieldCheck size={14} className="shield-green" /> {cl.evidenceGrade}
                    </span>
                    <span className="confidence-chip">{cl.confidenceScore}% Confidence</span>
                    <span className="verified-time-chip">Verified {cl.lastVerified}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-toggle-evidence"
                    onClick={() => toggleClaimExpansion(cl.id)}
                  >
                    <span>{isExpanded ? 'Hide Evidence' : 'Inspect Evidence'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Claim Statement */}
                <h3 className="claim-statement-text">"{cl.claim}"</h3>

                {/* Related Entities & Sources Row */}
                <div className="claim-meta-footer">
                  <div className="sources-group">
                    <span className="meta-lbl">Sources:</span>
                    {cl.supportingSources.map((src, i) => (
                      <span key={i} className="source-pill">
                        <FileText size={12} /> {src}
                      </span>
                    ))}
                  </div>

                  <div className="entities-group">
                    <span className="meta-lbl">Entities:</span>
                    {cl.relatedEntities.map((ent, i) => (
                      <button
                        key={i}
                        type="button"
                        className="entity-chip-btn"
                        onClick={() => {
                          const matchingNode = initialNodes.find((n) => n.label === ent);
                          if (matchingNode) setSelectedNode(matchingNode);
                          else onAddToast(`Inspecting entity ${ent}`);
                        }}
                      >
                        <Tag size={12} /> {ent}
                      </button>
                    ))}
                  </div>
                </div>

                {/* EXPANDABLE EVIDENCE VIEW CONTAINER */}
                {isExpanded && (
                  <div className="expandable-evidence-container animate-fade-in-up">
                    <div className="evidence-inner-card">
                      <div className="evidence-header-sm">
                        <Layers size={15} className="layers-cyan" />
                        <h4>Evidence Chain & Verification Manifest</h4>
                      </div>

                      {/* Fingerprint */}
                      <div className="hash-display-row">
                        <span className="hash-lbl">Cryptographic SHA-256 Fingerprint:</span>
                        <code className="hash-code-val">{cl.evidenceHash}</code>
                      </div>

                      {/* Citation Excerpts */}
                      <div className="citations-box">
                        <span className="citations-title">Direct Source Citations:</span>
                        <div className="citation-lines-list">
                          {cl.citations.map((cit, i) => (
                            <div key={i} className="citation-line-item">
                              <FileText size={13} className="doc-blue" />
                              <span>{cit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Triples */}
                      <div className="triples-box">
                        <span className="triples-title">Extracted Knowledge Triples:</span>
                        <div className="triples-code-list">
                          {cl.triples.map((t, i) => (
                            <code key={i} className="triple-code">{t}</code>
                          ))}
                        </div>
                      </div>

                      {/* SAML Proof */}
                      <div className="saml-proof-footer">
                        <CheckCircle2 size={14} className="check-green" />
                        <span>Governed by SAML 2.0 RBAC Audit Policy • Verified Immutable</span>
                      </div>
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
