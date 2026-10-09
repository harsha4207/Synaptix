import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckSquare,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { GovernedActionItem, ActionPreviewModal } from '../components/actions/ActionPreviewModal';
import { ActionCard } from '../components/actions/ActionCard';
import { PageContainer, PageHeader, PageContent } from '../components/layout';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';

interface ActionsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export type ActionStatusTab =
  | 'Pending'
  | 'Approved'
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Unknown'
  | 'Rolled Back';

export const ActionsModule: React.FC<ActionsModuleProps> = ({ workspace, onAddToast }) => {
  const [activeTab, setActiveTab] = useState<ActionStatusTab>('Pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [systemFilter, setSystemFilter] = useState<string>('All');

  const [selectedAction, setSelectedAction] = useState<GovernedActionItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const [actions, setActions] = useState<GovernedActionItem[]>([
    {
      id: 'ACT-2026-901',
      name: 'Reallocate Q4 Budget Thresholds in Oracle ERP',
      requestedBy: 'Alex Vance (Lead Intelligence Officer)',
      workspace: 'Finance',
      riskTier: 'Critical',
      affectedSystems: ['Oracle ERP Finance', 'Corporate Treasury Vault', 'SAP S/4HANA'],
      changesSummary: 'UPDATE accounts SET q4_cap = 14500000 WHERE cost_center = "EMEA-DIST-04"',
      evidenceGrade: 'G1 Verified',
      evidenceHash: '0x8a9f42b10e99a110',
      approvalStatus: 'Pending',
      verificationStatus: 'Pending Verification',
      statusCategory: 'Pending',
      goalUnderstood: 'Rebalance EMEA cost center budget ceiling by +$14.5M to mitigate freight surcharges.',
      planSummary: '1. Verify tariff schedule. 2. Lock treasury escrow. 3. Mutate Oracle ERP allocation table.',
      planVersion: 'v1.2',
      planHash: '0x8a9f42b10e',
      isPlanValid: true,
      reversibility: 'Fully Reversible',
      verificationMethod: 'Cryptographic Dual-Key Ledger Audit Hash',
      steps: [
        {
          stepIndex: 1,
          title: 'Verify EMEA Customs Tariff Schedule',
          system: 'Customs API',
          description: 'Validates official EU tariff schedules for Q3/Q4 2026.',
          isApproved: true,
        },
        {
          stepIndex: 2,
          title: 'Escrow Treasury Allocation',
          system: 'Corporate Treasury Vault',
          description: 'Holds $14.5M in dual-key governed escrow bucket.',
          isApproved: true,
        },
        {
          stepIndex: 3,
          title: 'Mutate Oracle ERP General Ledger Cap',
          system: 'Oracle ERP Finance',
          description: 'Updates active cost center ceiling table with verified signature.',
          isApproved: true,
        },
      ],
    },
    {
      id: 'ACT-2026-884',
      name: 'Deploy Automated Freight Reroute in APAC Hub',
      requestedBy: 'System Auto-Planner (Rigor v4)',
      workspace: 'Finance',
      riskTier: 'High',
      affectedSystems: ['APAC Logistics Network', 'Freight Broker API'],
      changesSummary: 'SET default_carrier = "Oceanic Freight Partners" WHERE latency_days > 8.0',
      evidenceGrade: 'G1 Verified',
      evidenceHash: '0x7b3c22f98a12c455',
      approvalStatus: 'Approved',
      verificationStatus: 'Verified',
      statusCategory: 'Approved',
      goalUnderstood: 'Reroute high-latency shipments around port bottlenecks to reduce delivery delay from 14.1 days to 4.0 days.',
      planSummary: '1. Probe alternative shipping routes. 2. Execute partner carrier contract. 3. Update routing table.',
      planVersion: 'v2.0',
      planHash: '0x7b3c22f98a',
      isPlanValid: true,
      reversibility: 'Fully Reversible',
      verificationMethod: 'G1 Verified Ledger Audit',
      steps: [
        {
          stepIndex: 1,
          title: 'Probe Multimodal Shipping Options',
          system: 'Logistics Matrix',
          description: 'Identifies non-congested ports for Q3 APAC containers.',
          isApproved: true,
        },
        {
          stepIndex: 2,
          title: 'Enforce Secondary Carrier Allocation SLA',
          system: 'Freight Broker API',
          description: 'Locks in backup capacity contract rate of $2,400/TEU.',
          isApproved: true,
        },
      ],
    },
    {
      id: 'ACT-2026-871',
      name: 'Synchronize Latency Telemetry with Customs DB',
      requestedBy: 'Worker Daemon (Sched-Sync-30)',
      workspace: 'Finance',
      riskTier: 'Medium',
      affectedSystems: ['Customs API', 'Telemetry Aggregator'],
      changesSummary: 'SYNC latency_records WITH customs_broker_stream INTERVAL 300s',
      evidenceGrade: 'G2 Parsed',
      evidenceHash: '0x44d1288f33e98124',
      approvalStatus: 'Running',
      verificationStatus: 'Pending Verification',
      statusCategory: 'Running',
      goalUnderstood: 'Continuous background reconciliation between customs broker clearance timestamps and ERP ledger.',
      planSummary: '1. Open streaming gateway. 2. Poll delta batch. 3. Compute telemetry hashes.',
      planVersion: 'v1.0',
      planHash: '0x44d1288f33',
      isPlanValid: true,
      reversibility: 'Fully Reversible',
      verificationMethod: 'Delta Hash Signature',
      steps: [
        {
          stepIndex: 1,
          title: 'Initialize Streaming Gateway Pipe',
          system: 'Customs API',
          description: 'Opens TLS 1.3 socket to broker stream.',
          isApproved: true,
        },
      ],
    },
    {
      id: 'ACT-2026-850',
      name: 'Recover Contract Penalty Credits from Silicon Vendors',
      requestedBy: 'David Chen (Procurement Counsel)',
      workspace: 'Finance',
      riskTier: 'Medium',
      affectedSystems: ['SAP S/4HANA', 'Vendor Portal API'],
      changesSummary: 'APPLY credit_memo_id = "CM-99410" AMOUNT = 1840000.00 TO open_payable',
      evidenceGrade: 'G1 Verified',
      evidenceHash: '0x33e981240e99a110',
      approvalStatus: 'Completed',
      verificationStatus: 'Verified',
      statusCategory: 'Completed',
      goalUnderstood: 'Enforce SLA contractual penalty deduction of $1.84M against late hardware deliveries.',
      planSummary: '1. Validate SLA threshold breach logs. 2. Post credit memo. 3. Issue vendor clearance receipt.',
      planVersion: 'v1.4',
      planHash: '0x33e981240e',
      isPlanValid: true,
      reversibility: 'Irreversible (Executed)',
      verificationMethod: 'Dual Ledger Signature + Wire Receipt',
      steps: [
        {
          stepIndex: 1,
          title: 'Compile Verified SLA Breach Dossier',
          system: 'SLA Engine',
          description: 'Calculates 18 days average delay penalty metrics.',
          isApproved: true,
        },
        {
          stepIndex: 2,
          title: 'Inject Credit Adjustment to General Ledger',
          system: 'SAP S/4HANA',
          description: 'Offsets $1.84M from pending hardware payable voucher.',
          isApproved: true,
        },
      ],
    },
    {
      id: 'ACT-2026-812',
      name: 'Cross-Domain Tariff Rule Engine Injection',
      requestedBy: 'System Auto-Planner',
      workspace: 'Finance',
      riskTier: 'Critical',
      affectedSystems: ['Tariff Rule Engine', 'Global Gateway'],
      changesSummary: 'MUTATE rule_definition = "EMEA_CUSTOMS_RULE_SET_2026" WHERE version = 4.1',
      evidenceGrade: 'G1 Verified',
      evidenceHash: '0x99a1104e7c33e981',
      approvalStatus: 'Rejected',
      verificationStatus: 'Verification Failed',
      statusCategory: 'Failed',
      goalUnderstood: 'Attempted to rewrite customs calculation matrix rules without secondary human cryptographic sign-off.',
      planSummary: '1. Probe rule engine. 2. Execute rule update.',
      planVersion: 'v0.9',
      planHash: '0x99a1104e7c',
      isPlanValid: false,
      reversibility: 'Fully Reversible',
      verificationMethod: 'Cryptographic Rule Audit Hash',
      steps: [
        {
          stepIndex: 1,
          title: 'Test Rule Set Boundary Limits',
          system: 'Tariff Rule Engine',
          description: 'Simulation detected boundary overflow on category 4 goods.',
          isApproved: false,
        },
      ],
    },
    {
      id: 'ACT-2026-799',
      name: 'Autonomous Carrier Route Modification Probe',
      requestedBy: 'AI Reasoning Pipeline',
      workspace: 'Finance',
      riskTier: 'High',
      affectedSystems: ['Carrier API', 'Routing Matrix'],
      changesSummary: 'POST /v2/routes/override { carrier: "Unverified Third Party Freight" }',
      evidenceGrade: 'G3 Ungraded',
      evidenceHash: '0x12c4558a9f42b10e',
      approvalStatus: 'Pending',
      verificationStatus: 'Unknown (Inconclusive)',
      statusCategory: 'Unknown',
      goalUnderstood: 'Carrier gateway responded with ambiguous HTTP 504 status code during route modification confirmation.',
      planSummary: '1. Ping carrier gateway. 2. Transmit route change payload. 3. Await receipt.',
      planVersion: 'v1.1',
      planHash: '0x12c4558a9f',
      isPlanValid: true,
      reversibility: 'Indeterminate',
      verificationMethod: 'Carrier Inconclusive Receipt',
      steps: [
        {
          stepIndex: 1,
          title: 'Transmit Carrier Routing Packet',
          system: 'Carrier API',
          description: 'Network timeout occurred prior to cryptographic ACK receipt.',
          isApproved: true,
        },
      ],
    },
    {
      id: 'ACT-2026-760',
      name: 'Emergency Freight Price Cap Override',
      requestedBy: 'Operations Director',
      workspace: 'Finance',
      riskTier: 'Critical',
      affectedSystems: ['Freight Ledger', 'Corporate Treasury'],
      changesSummary: 'OVERRIDE max_allowable_surcharge = $5000/TEU (ROLLED BACK)',
      evidenceGrade: 'G1 Verified',
      evidenceHash: '0x558a9f42b10e99a1',
      approvalStatus: 'Executed & Rolled Back',
      verificationStatus: 'Verified Rollback',
      statusCategory: 'Rolled Back',
      goalUnderstood: 'Temporary price cap override was tested, verified ineffective, and reverted cleanly to previous baseline state.',
      planSummary: '1. Backup state snapshot. 2. Apply override. 3. Revert to snapshot.',
      planVersion: 'v1.0',
      planHash: '0x558a9f42b1',
      isPlanValid: true,
      reversibility: 'Fully Reversible (Reverted)',
      verificationMethod: 'Cryptographic Snapshot Diff Match',
      steps: [
        {
          stepIndex: 1,
          title: 'Capture Pre-Execution State Snapshot',
          system: 'Freight Ledger',
          description: 'Captured SHA-256 state snapshot of all active surcharge limits.',
          isApproved: true,
        },
        {
          stepIndex: 2,
          title: 'Execute State Rollback Protocol',
          system: 'Freight Ledger',
          description: 'Successfully restored ledger variables to pre-override hash.',
          isApproved: true,
        },
      ],
    },
  ]);

  const filteredActions = actions.filter((action) => {
    const matchesTab = action.statusCategory === activeTab;
    const matchesSearch =
      action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.affectedSystems.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = riskFilter === 'All' || action.riskTier === riskFilter;
    const matchesSystem =
      systemFilter === 'All' ||
      action.affectedSystems.some((s) => s.toLowerCase().includes(systemFilter.toLowerCase()));
    return matchesTab && matchesSearch && matchesRisk && matchesSystem;
  });

  const handleOpenPreview = (action: GovernedActionItem) => {
    setSelectedAction(action);
    setIsPreviewOpen(true);
  };

  const handleApprove = (id: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, approvalStatus: 'Approved', statusCategory: 'Approved' }
          : a
      )
    );
    onAddToast(`Action ${id} successfully approved with cryptographic signature!`);
  };

  const handleReject = (id: string, reason: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              approvalStatus: 'Rejected',
              statusCategory: 'Failed',
              verificationStatus: `Rejected: ${reason}`,
            }
          : a
      )
    );
    onAddToast(`Action ${id} rejected`);
  };

  const handleModifyPlan = (id: string, updatedPlan: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              planSummary: updatedPlan,
              planVersion: 'v1.3 (Edited by Admin)',
            }
          : a
      )
    );
    onAddToast(`Action ${id} plan updated successfully`);
  };

  const handleQuickExecute = (id: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, statusCategory: 'Running', approvalStatus: 'Running' } : a
      )
    );
    onAddToast(`Action ${id}: Execution initiated...`);

    setTimeout(() => {
      setActions((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, statusCategory: 'Completed', verificationStatus: 'Verified' }
            : a
        )
      );
      onAddToast(`Action ${id}: Cryptographically verified & completed!`);
    }, 1200);
  };

  const handleRollback = (id: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              statusCategory: 'Rolled Back',
              changesSummary: `ROLLED BACK: Reverted state to pre-execution snapshot (${a.changesSummary})`,
            }
          : a
      )
    );
    onAddToast(`Action ${id} rolled back to previous snapshot cleanly`);
  };

  const tabCounts = {
    Pending: actions.filter((a) => a.statusCategory === 'Pending').length,
    Approved: actions.filter((a) => a.statusCategory === 'Approved').length,
    Running: actions.filter((a) => a.statusCategory === 'Running').length,
    Completed: actions.filter((a) => a.statusCategory === 'Completed').length,
    Failed: actions.filter((a) => a.statusCategory === 'Failed').length,
    Unknown: actions.filter((a) => a.statusCategory === 'Unknown').length,
    'Rolled Back': actions.filter((a) => a.statusCategory === 'Rolled Back').length,
  };

  return (
    <PageContainer>
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Governed Actions Center"
        description="Cryptographically governed operational action queue, authorization review, audit trail, and instant rollback controls."
        badge={
          <Badge variant="blue">
            <ShieldCheck size={13} style={{ marginRight: '4px' }} />
            Governed Execution Authority
          </Badge>
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Badge variant="warning" dot>
              Pending: {tabCounts.Pending}
            </Badge>
            <Badge variant="blue">
              Approved: {tabCounts.Approved}
            </Badge>
            <Badge variant="success">
              Completed: {tabCounts.Completed}
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--sp-3)',
                alignItems: 'flex-end',
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Filter by Risk Tier
                </label>
                <Select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Risk Tiers' },
                    { value: 'Critical', label: 'Critical Risk Only' },
                    { value: 'High', label: 'High Risk' },
                    { value: 'Medium', label: 'Medium Risk' },
                    { value: 'Low', label: 'Low Risk' },
                  ]}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Filter by Connected System
                </label>
                <Select
                  value={systemFilter}
                  onChange={(e) => setSystemFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Connected Systems' },
                    { value: 'Oracle', label: 'Oracle ERP Systems' },
                    { value: 'SAP', label: 'SAP S/4HANA' },
                    { value: 'Treasury', label: 'Corporate Treasury' },
                    { value: 'Vault', label: 'Regulatory Vault' },
                  ]}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  Workspace Boundary
                </label>
                <Select
                  value={workspace.name}
                  onChange={() => {}}
                  options={[
                    { value: workspace.name, label: `${workspace.name} (Current Workspace)` },
                    { value: 'All', label: 'All Authorized Workspaces' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. TABS BAR & LIVE SEARCH */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {(
              [
                'Pending',
                'Approved',
                'Running',
                'Completed',
                'Failed',
                'Unknown',
                'Rolled Back',
              ] as ActionStatusTab[]
            ).map((tab) => {
              const count = tabCounts[tab];
              const isActive = activeTab === tab;
              let activeColor = 'var(--c-blue)';
              if (tab === 'Pending') activeColor = '#B7791F';
              else if (tab === 'Completed') activeColor = 'var(--c-success)';
              else if (tab === 'Failed') activeColor = 'var(--c-danger)';
              else if (tab === 'Rolled Back') activeColor = 'var(--c-navy)';

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--sp-2)',
                    padding: 'var(--sp-2) var(--sp-3)',
                    borderRadius: 'var(--r-md)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    backgroundColor: isActive ? activeColor : 'var(--c-surface)',
                    color: isActive ? '#FFFFFF' : 'var(--c-text-2)',
                    border: `1px solid ${isActive ? activeColor : 'var(--c-border)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--t-fast)',
                  }}
                >
                  <span>{tab}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 5px',
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

          <div style={{ width: '100%', maxWidth: '300px' }}>
            <Input
              type="text"
              placeholder="Search actions, systems, IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
        </div>

        {/* 4. UNKNOWN NOTICE ALERT IF SELECTED */}
        {activeTab === 'Unknown' && (
          <div
            style={{
              padding: 'var(--sp-4)',
              backgroundColor: 'var(--c-warning-bg)',
              border: '1px solid var(--c-warning-border)',
              borderRadius: 'var(--r-lg)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--sp-3)',
            }}
          >
            <AlertTriangle size={18} color="var(--c-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-1)', display: 'block' }}>
                Unknown State: Inconclusive Telemetry Verification
              </strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-2)', marginTop: '2px' }}>
                Synaptix Command does not treat unknown status as failure or success. Actions in this queue require manual ledger reconciliation or re-probing of partner gateway telemetries.
              </p>
            </div>
          </div>
        )}

        {/* 5. ACTION CARDS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filteredActions.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={28} />}
              title={`No Actions in ${activeTab} Queue`}
              description="There are currently no governed actions matching this status tab or filter selection."
            />
          ) : (
            filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onPreviewAction={handleOpenPreview}
                onQuickApprove={handleApprove}
                onQuickExecute={handleQuickExecute}
                onRollback={handleRollback}
              />
            ))
          )}
        </div>
      </PageContent>

      {/* 6. ACTION PREVIEW & GOVERNANCE MODAL */}
      <ActionPreviewModal
        action={selectedAction}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onModifyPlan={handleModifyPlan}
        onAddToast={onAddToast}
      />
    </PageContainer>
  );
};
