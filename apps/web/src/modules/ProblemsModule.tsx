import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { ProblemItem, ProblemDetailDrawer } from '../components/problems/ProblemDetailDrawer';
import { ProblemCard } from '../components/problems/ProblemCard';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';

interface ProblemsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
  onSelectModule?: (moduleId: any) => void;
  activeSubTab?: ProblemCategoryTab;
  onSubTabChange?: (tab: ProblemCategoryTab) => void;
}

export type ProblemCategoryTab = 'Critical' | 'Attention' | 'Investigation' | 'Resolved';

export const ProblemsModule: React.FC<ProblemsModuleProps> = ({
  workspace,
  onAddToast,
  onSelectModule,
  activeSubTab,
  onSubTabChange,
}) => {
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ProblemCategoryTab>(activeSubTab || 'Critical');

  useEffect(() => {
    if (activeSubTab) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All Periods');
  const [sourceFilter, setSourceFilter] = useState<string>(workspace.name);

  // Detail Drawer State
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Initial Workspace Problems List
  const [problems, setProblems] = useState<ProblemItem[]>([
    {
      id: 'PRB-2019-041',
      title: 'Gross Margin Contraction Across EMEA Operational Sector',
      category: 'Critical',
      severity: 'Critical',
      description:
        'Longitudinal analysis detected a 14.2% gross margin drop between Q2 2019 and Q4 2021 across EMEA distribution hubs ($42.8M total drift).',
      detectedPeriod: '2019 – 2021',
      detectedTimestamp: '2026-10-01 09:14:22',
      impact: '-$42.8M Margin Drift (-14.2%)',
      evidenceGrade: 'G1 Verified',
      confidenceScore: 98.4,
      whatHappened:
        'During the 2019–2021 period, regional supply chain overhead surcharges combined with unhedged EMEA customs tariffs created a compound margin drift of 14.2%. Margin dropped from 42.5% in 2019 to a trough of 28.3% in 2021.',
      affectedMetrics: ['Gross Margin %', 'EMEA COGS Overhead', 'Customs Tariff Penalties'],
      supportingEvidence: [
        { title: 'FY2026 Enterprise Operational Ledger', hash: '0x8a9f42b10e99a110', source: 'Oracle ERP Sync' },
        { title: 'EMEA Freight Audit Ledger', hash: '0x7b3c22f98a12c455', source: 'Customs API' },
        { title: 'Q3 Vendor Requisition Stream', hash: '0x44d1288f33e98124', source: 'Procurement DB' },
      ],
      relatedDocuments: [
        { id: 'doc-1', name: 'EMEA_Logistics_Audit_2021.pdf', type: 'PDF' },
        { id: 'doc-2', name: 'Tariff_Schedule_Escalation.xlsx', type: 'XLSX' },
        { id: 'doc-3', name: 'Executive_Restructuring_Brief.docx', type: 'DOCX' },
      ],
      contributingFactors: [
        {
          factor: 'Logistics Overhead Surcharge Escalation',
          classification: 'Observed data',
          probability: '100% Empirical Fact',
          note: 'Ledger shows freight shipping surcharges increased by 103.2% between Q3 2019 and Q2 2021.',
        },
        {
          factor: 'Unhedged Customs Tariff Rates',
          classification: 'Possible factor',
          probability: '88.4% Probability',
          note: 'Regulatory tariff changes co-occurred with freight spikes, contributing an estimated $18.4M.',
        },
        {
          factor: 'Vendor Delivery Latency Co-variance',
          classification: 'Correlation',
          probability: 'Pearson r = -0.84',
          note: 'Delivery delay days correlate strongly with margin contraction (Does not prove direct causality).',
        },
      ],
      recommendedInvestigation: [
        'Run automated invoice verification against official tariff schedule rules for Q3 2019 – Q4 2021.',
        'Cross-reference delivery delay timestamps against freight contract escalation clauses.',
        'Deploy automated workflow to monitor future EMEA customs tariff variance in real-time.',
      ],
      relatedActions: ['WF-2026-EMEA-Audit', 'ACT-402-Tariff-Review'],
      assignedTo: 'Alex Vance (Lead Analyst)',
    },
    {
      id: 'PRB-2020-089',
      title: 'Supply Chain Freight Latency Bottleneck in APAC Hub',
      category: 'Attention',
      severity: 'High',
      description:
        'Average shipping delay extended from 3.5 days to 14.1 days during Q2 2020, resulting in delayed revenue recognition.',
      detectedPeriod: '2020 – 2021',
      detectedTimestamp: '2026-09-28 14:30:00',
      impact: '14.1 Days Latency Peak ($12.4M Delayed)',
      evidenceGrade: 'G1 Verified',
      confidenceScore: 94.1,
      whatHappened:
        'Port congestion and regional logistics bottlenecks caused shipping transit times to quadruple between Q2 2020 and Q1 2021.',
      affectedMetrics: ['Supply Chain Latency', 'APAC Revenue Recognition'],
      supportingEvidence: [
        { title: 'APAC Shipping Manifest Log', hash: '0x99a1104e7c33e981', source: 'Logistics API' },
      ],
      relatedDocuments: [
        { id: 'doc-4', name: 'APAC_Port_Congestion_Report.pdf', type: 'PDF' },
      ],
      contributingFactors: [
        {
          factor: 'Port Transit Bottleneck',
          classification: 'Observed data',
          probability: '100% Empirical Fact',
          note: 'Dwell time at main container terminals averaged 11.2 days above baseline.',
        },
      ],
      recommendedInvestigation: [
        'Review alternative multimodal freight carrier routes bypassing congested transshipment ports.',
      ],
      relatedActions: ['WF-2020-APAC-Reroute'],
      assignedTo: 'Elena Rostova (Supply Chain Operations)',
    },
    {
      id: 'PRB-2021-014',
      title: 'Vendor Contract SLA Discrepancies in Hardware Procurement',
      category: 'Investigation',
      severity: 'Medium',
      description:
        'Hardware component lead times exceeded agreed contract SLA provisions by an average of 18 days across 4 major vendors.',
      detectedPeriod: '2021 – 2022',
      detectedTimestamp: '2026-09-20 11:15:40',
      impact: '18 Days Over SLA ($4.2M Penalty Exposure)',
      evidenceGrade: 'G2 Parsed',
      confidenceScore: 89.7,
      whatHappened:
        'Contractual terms specified 14-day turnaround for tier-1 silicon components, but empirical fulfillment logs reveal a median turnaround of 32 days.',
      affectedMetrics: ['Procurement SLA Compliance', 'Hardware Build Cycles'],
      supportingEvidence: [
        { title: 'Vendor Master Services Agreement v2', hash: '0x33e981240e99a110', source: 'Contract DB' },
      ],
      relatedDocuments: [
        { id: 'doc-5', name: 'Hardware_Procurement_SLA_Audit.pdf', type: 'PDF' },
      ],
      contributingFactors: [
        {
          factor: 'Global Component Shortage Shock',
          classification: 'External market factor',
          probability: '95% Correlation',
          note: 'Macro silicon fabrication capacity constraints impacted all regional vendors.',
        },
      ],
      recommendedInvestigation: [
        'Audit vendor penalty recovery clauses and cross-check against credit memos received.',
      ],
      relatedActions: ['ACT-310-Contract-Enforcement'],
      assignedTo: 'David Chen (Procurement Counsel)',
    },
    {
      id: 'PRB-2018-002',
      title: 'LATAM Regional Distribution Center Order Misrouting',
      category: 'Resolved',
      severity: 'Low',
      description:
        'Legacy barcode scanning discrepancies resulted in 3.1% outbound shipments routed to incorrect distribution tiers in Q4 2018.',
      detectedPeriod: '2018 – 2019',
      detectedTimestamp: '2026-08-15 08:00:00',
      impact: 'Resolved ($1.8M Recovery Realized)',
      evidenceGrade: 'G1 Verified',
      confidenceScore: 99.2,
      whatHappened:
        'Warehouse scanner software update v4.1 caused SKU digit truncation, causing misplaced pallets. Resolved through automated vision inspection rollout.',
      affectedMetrics: ['Outbound Routing Accuracy', 'Reverse Logistics Cost'],
      supportingEvidence: [
        { title: 'Warehouse Automation Post-Mortem', hash: '0x12c4558a9f42b10e', source: 'Operations Log' },
      ],
      relatedDocuments: [
        { id: 'doc-6', name: 'LATAM_Logistics_Remediation.pdf', type: 'PDF' },
      ],
      contributingFactors: [
        {
          factor: 'SKU Barcode Scanner Firmware Defect',
          classification: 'Root cause confirmed',
          probability: '100% Verified',
          note: 'Firmware patch v4.2 fully corrected SKU digit formatting.',
        },
      ],
      recommendedInvestigation: [
        'Replicate LATAM automated sorting model across EMEA sector hubs.',
      ],
      relatedActions: ['ACT-100-Resolved-Audit'],
      assignedTo: 'Marcus Vance (Automation Lead)',
    },
  ]);

  const filteredProblems = problems.filter((p) => {
    const matchesCategory = p.category === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || p.severity === severityFilter;
    const matchesEvidence = evidenceFilter === 'All' || p.evidenceGrade === evidenceFilter;
    const matchesStatus = statusFilter === 'All' || p.category === statusFilter;
    const matchesDate = dateFilter === 'All Periods' || p.detectedPeriod === dateFilter;
    const matchesSource = sourceFilter === 'All Workspaces' || sourceFilter === workspace.name;
    return (
      matchesCategory &&
      matchesSearch &&
      matchesSeverity &&
      matchesEvidence &&
      matchesStatus &&
      matchesDate &&
      matchesSource
    );
  });

  const handleOpenDetail = (problem: ProblemItem) => {
    setSelectedProblem(problem);
    setIsDrawerOpen(true);
  };

  const handleResolveProblem = (problemId: string) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, category: 'Resolved' } : p))
    );
  };

  const handleActionTrigger = (actionType: string, problem: ProblemItem) => {
    if (actionType === 'create_dashboard') {
      onAddToast(`Opening Dashboard Builder for problem "${problem.title}"`);
      if (onSelectModule) onSelectModule('dashboards');
    } else if (actionType === 'create_report') {
      onAddToast(`Generating Executive Investigation Report PDF for ${problem.id}...`);
    } else if (actionType === 'create_workflow') {
      onAddToast(`Created automated mitigation workflow for ${problem.id}`);
    } else if (actionType === 'investigate') {
      onAddToast(`Switching to Analytics Engine to investigate ${problem.id}`);
      if (onSelectModule) onSelectModule('analytics');
    } else if (actionType === 'assign') {
      onAddToast(`Assigned problem ${problem.id} to Lead Intelligence Officer`);
    }
  };

  const categoryCounts = {
    Critical: problems.filter((p) => p.category === 'Critical').length,
    Attention: problems.filter((p) => p.category === 'Attention').length,
    Investigation: problems.filter((p) => p.category === 'Investigation').length,
    Resolved: problems.filter((p) => p.category === 'Resolved').length,
  };

  return (
    <PageContainer>
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Problems & Anomaly Resolution"
        description="Autonomous pattern detection identifies anomalies, margin drift, and operational bottlenecks from workspace datasets & evidence."
        badge={
          <Badge variant="blue">
            <ShieldCheck size={13} />
            {workspace.name} Boundary
          </Badge>
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Badge variant="destructive" dot>
              Critical: {categoryCounts.Critical}
            </Badge>
            <Badge variant="warning" dot>
              Attention: {categoryCounts.Attention}
            </Badge>
            <Badge variant="blue">
              Investigation: {categoryCounts.Investigation}
            </Badge>
            <Badge variant="success">
              Resolved: {categoryCounts.Resolved}
            </Badge>
          </div>
        }
      />

      <PageContent>
        {/* 2. FILTER & SEARCH CONTROL CARD */}
        <Card shadow={false}>
          <CardContent style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 'var(--sp-3)',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Severity
                </label>
                <Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Severities' },
                    { value: 'Critical', label: 'Critical Only' },
                    { value: 'High', label: 'High Severity' },
                    { value: 'Medium', label: 'Medium Severity' },
                    { value: 'Low', label: 'Low Severity' },
                  ]}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Evidence Grade
                </label>
                <Select
                  value={evidenceFilter}
                  onChange={(e) => setEvidenceFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Evidence Grades' },
                    { value: 'G1 Verified', label: 'G1 Verified Only' },
                    { value: 'G2 Parsed', label: 'G2 Parsed & Above' },
                  ]}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Under Investigation', label: 'Under Investigation' },
                    { value: 'Resolved', label: 'Resolved' },
                  ]}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Detected Period
                </label>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  options={[
                    { value: 'All Periods', label: 'All Periods' },
                    { value: '2010 – 2026', label: '2010 – 2026' },
                    { value: '2019 – 2021', label: '2019 – 2021 (Decline Phase)' },
                    { value: 'Last 12 Months', label: 'Last 12 Months' },
                  ]}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Workspace Source
                </label>
                <Select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  options={[
                    { value: workspace.name, label: `${workspace.name} (Current)` },
                    { value: 'Finance', label: 'Finance Workspace' },
                    { value: 'Research', label: 'Research Workspace' },
                    { value: 'Healthcare', label: 'Healthcare Workspace' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. TABS BAR & LIVE SEARCH ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-4)',
            borderBottom: '1px solid var(--c-border)',
            paddingBottom: 'var(--sp-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            {(['Critical', 'Attention', 'Investigation', 'Resolved'] as ProblemCategoryTab[]).map((tab) => {
              const count = categoryCounts[tab];
              const isActive = activeTab === tab;
              let activeColor = 'var(--c-blue)';
              if (tab === 'Critical') activeColor = 'var(--c-danger)';
              else if (tab === 'Attention') activeColor = '#B7791F';
              else if (tab === 'Resolved') activeColor = 'var(--c-success)';

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    onSubTabChange?.(tab);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--sp-2)',
                    padding: 'var(--sp-2) var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    backgroundColor: isActive ? activeColor : 'var(--c-surface)',
                    color: isActive ? '#FFFFFF' : 'var(--c-text-2)',
                    border: `1px solid ${isActive ? activeColor : 'var(--c-border)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--t-fast)',
                  }}
                >
                  {tab === 'Critical' && <AlertTriangle size={14} />}
                  {tab === 'Attention' && <Clock size={14} />}
                  {tab === 'Investigation' && <HelpCircle size={14} />}
                  {tab === 'Resolved' && <CheckCircle2 size={14} />}
                  <span>{tab}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: 'var(--r-full)',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--c-page)',
                      color: isActive ? '#FFFFFF' : 'var(--c-text-2)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ width: '100%', maxWidth: '320px' }}>
            <Input
              type="text"
              placeholder="Search problems, metrics, IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
        </div>

        {/* 4. PROBLEM CARDS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredProblems.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle size={28} />}
              title="No Problems Found in this Category"
              description="There are currently no active problems matching your search query or selected severity filters."
            />
          ) : (
            filteredProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} onOpenDetail={handleOpenDetail} />
            ))
          )}
        </div>
      </PageContent>

      {/* 5. PROBLEM DETAIL DRAWER */}
      <ProblemDetailDrawer
        problem={selectedProblem}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onActionTrigger={handleActionTrigger}
        onResolveProblem={handleResolveProblem}
        onAddToast={onAddToast}
      />
    </PageContainer>
  );
};
