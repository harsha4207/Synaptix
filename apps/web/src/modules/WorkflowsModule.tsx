import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  ArrowRight,
  Save,
  Play,
  Zap,
  RefreshCw,
  Power,
  Check,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Sliders,
  ShieldCheck,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { WorkflowStepNode, WorkflowNodeType } from '../components/workflows/WorkflowNode';
import { WorkflowCanvas } from '../components/workflows/WorkflowCanvas';
import { StepConfigDrawer } from '../components/workflows/StepConfigDrawer';
import { DryRunModal } from '../components/workflows/DryRunModal';

interface WorkflowsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

interface WorkflowListItem {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  stepCount: number;
  isEnabled: boolean;
  lastExecuted: string;
  successRate: string;
  executionCount: number;
}

interface ExecutionLogItem {
  id: string;
  workflowName: string;
  trigger: string;
  timestamp: string;
  duration: string;
  status: 'success' | 'running' | 'failed' | 'approval_required';
  details: string;
}

export const WorkflowsModule: React.FC<WorkflowsModuleProps> = ({ workspace, onAddToast }) => {
  // Mode: 'list' (default summary) vs 'editor' (visual canvas)
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');

  // List of Workflows in Workspace
  const [workflowList, setWorkflowList] = useState<WorkflowListItem[]>([
    {
      id: 'wf-1',
      name: 'Invoice Verification & High-Value Approval',
      description: 'OCR vendor invoices, verify duplicate records, and route > ₹100,000 for dual Controller sign-off',
      triggerEvent: 'Document Upload (PDF/XLSX)',
      stepCount: 7,
      isEnabled: true,
      lastExecuted: '12m ago',
      successRate: '99.4%',
      executionCount: 142,
    },
    {
      id: 'wf-2',
      name: 'EMEA Freight Surcharge & Tariff Scan',
      description: 'Monitor daily customs feeds and trigger alert when shipping surcharges exceed 15% variance',
      triggerEvent: 'Daily Schedule (09:00 UTC)',
      stepCount: 5,
      isEnabled: true,
      lastExecuted: '2h ago',
      successRate: '100%',
      executionCount: 88,
    },
    {
      id: 'wf-3',
      name: 'Compliance Precedent & Policy Audit',
      description: 'Cross-reference newly uploaded vendor contracts against KPMG and SAML 2.0 governance matrices',
      triggerEvent: 'Contract Ingest Event',
      stepCount: 4,
      isEnabled: false,
      lastExecuted: '1d ago',
      successRate: '98.1%',
      executionCount: 54,
    },
  ]);

  // Recent Executions History
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogItem[]>([
    {
      id: 'exec-1',
      workflowName: 'Invoice Verification & High-Value Approval',
      trigger: 'Upload: Vendor_Invoice_4892.pdf',
      timestamp: '12m ago',
      duration: '1.4s',
      status: 'success',
      details: 'OCR complete. Duplicate check passed. Escrow verified.',
    },
    {
      id: 'exec-2',
      workflowName: 'EMEA Freight Surcharge & Tariff Scan',
      trigger: 'Scheduled Cron Event',
      timestamp: '2h ago',
      duration: '2.8s',
      status: 'success',
      details: 'Evaluated 48 freight ledger rows. Variance at +3.4% (Below threshold).',
    },
    {
      id: 'exec-3',
      workflowName: 'Invoice Verification & High-Value Approval',
      trigger: 'Upload: CapEx_Ledger_Requisition.xlsx',
      timestamp: '3h ago',
      duration: '0.9s',
      status: 'approval_required',
      details: 'Requisition amount ($42,500) exceeded threshold. Awaiting Controller Dual Sign-Off.',
    },
  ]);

  // Editor State
  const [workflowName, setWorkflowName] = useState<string>('Invoice Verification & High-Value Approval');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [nlPrompt, setNlPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDryRunOpen, setIsDryRunOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowStepNode | null>(null);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);

  // Workflow Pipeline Steps
  const [steps, setSteps] = useState<WorkflowStepNode[]>([
    {
      id: 'step-1',
      type: 'Trigger',
      name: 'Document Upload Event',
      configSummary: 'When a new vendor invoice (PDF/XLSX) is uploaded to Finance workspace',
      status: 'Configured',
      details: { triggerEvent: 'workspace.documents.upload' },
    },
    {
      id: 'step-2',
      type: 'Data extraction',
      name: 'Extract Invoice Fields & OCR',
      configSummary: 'Parse vendor name, line items, invoice total amount, and tax ID',
      status: 'Configured',
      details: { extractionFields: ['vendorName', 'invoiceAmount', 'currency', 'taxId', 'invoiceDate'] },
    },
    {
      id: 'step-3',
      type: 'Condition',
      name: 'Duplicate Check & Threshold Rule',
      configSummary: 'Verify isDuplicate == false AND invoiceAmount > ₹100,000',
      status: 'Configured',
      details: { conditionExpression: 'invoiceAmount > 100000 && isDuplicate == false' },
    },
    {
      id: 'step-4',
      type: 'AI analysis',
      name: 'Anomaly & Compliance Scan',
      configSummary: 'Scan for pricing drift, abnormal freight surcharges, and tariff schedule mismatches',
      status: 'Configured',
      details: { aiModel: 'Synaptix Rigor Engine v4' },
    },
    {
      id: 'step-5',
      type: 'Approval',
      name: 'Finance Controller Sign-off',
      configSummary: 'Route high-value invoices to Finance Lead / Controller for dual authorization',
      status: 'Configured',
      details: { approverRole: 'Finance Lead / Controller' },
    },
    {
      id: 'step-6',
      type: 'Notification',
      name: 'Dispatch Approval Alert',
      configSummary: 'Send real-time interactive approval card to Slack #finance-approvals',
      status: 'Configured',
      details: { channel: 'Enterprise Slack #finance-approvals' },
    },
    {
      id: 'step-7',
      type: 'Verification',
      name: 'Cryptographic G1 Ledger Hash',
      configSummary: 'Generate tamper-evident evidence hash and log to immutable audit ledger',
      status: 'Configured',
      details: { verificationRule: 'G1 Ledger Proof Generated' },
    },
  ]);

  const handleCreateNewWorkflow = () => {
    setWorkflowName('New Autonomous Agent Workflow');
    setIsEnabled(true);
    setSteps([
      {
        id: `step-${Date.now()}-1`,
        type: 'Trigger',
        name: 'Event Trigger',
        configSummary: 'When new operational signal or document is detected',
        status: 'Configured',
      },
      {
        id: `step-${Date.now()}-2`,
        type: 'AI analysis',
        name: 'AI Reasoning & Evaluation',
        configSummary: 'Synthesize context and check organizational policy constraints',
        status: 'Configured',
      },
      {
        id: `step-${Date.now()}-3`,
        type: 'Approval',
        name: 'Human-in-the-Loop Approval',
        configSummary: 'Mandatory verification before mutation',
        status: 'Configured',
      },
    ]);
    setViewMode('editor');
  };

  const handleEditWorkflow = (wf: WorkflowListItem) => {
    setWorkflowName(wf.name);
    setIsEnabled(wf.isEnabled);
    setViewMode('editor');
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflowList((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, isEnabled: !wf.isEnabled } : wf))
    );
    onAddToast('Workflow status updated');
  };

  const handleGenerateWorkflow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlPrompt.trim()) return;
    setIsGenerating(true);
    onAddToast('Generating workflow pipeline from prompt...');

    setTimeout(() => {
      setIsGenerating(false);
      setWorkflowName(`Automated Pipeline: ${nlPrompt.substring(0, 36)}...`);
      onAddToast('✓ Workflow pipeline generated');
    }, 1000);
  };

  const handleSaveWorkflow = () => {
    onAddToast(`✓ Saved workflow: ${workflowName}`);
    setViewMode('list');
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* ============================================================== */}
      {/* 1. DEFAULT VIEW: WORKFLOWS LIST & EXECUTION MONITORING          */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Agent Workflows & Automation
                </h1>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {workflowList.filter((w) => w.isEnabled).length} Active Pipelines
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Build, execute, and monitor autonomous reasoning pipelines with human-in-the-loop authorization gates.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNewWorkflow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#1769E0',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(23, 105, 224, 0.2)',
              }}
            >
              <Plus size={15} />
              <span>Create Workflow</span>
            </button>
          </div>

          {/* 4 High-Value KPI Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 2px rgba(11, 31, 58, 0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>ACTIVE WORKFLOWS</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                {workflowList.filter((w) => w.isEnabled).length} / {workflowList.length}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>Enforced on {workspace.name}</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 2px rgba(11, 31, 58, 0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>TOTAL EXECUTIONS</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>342</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Across all trigger events</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 2px rgba(11, 31, 58, 0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>SUCCESS RATE</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>99.4%</div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>Zero unhandled failures</div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 2px rgba(11, 31, 58, 0.04)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase' }}>PENDING APPROVALS</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>1 Gate Active</div>
              <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>Requires Controller sign-off</div>
            </div>
          </div>

          {/* MY WORKFLOWS SECTION */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Workflow size={16} style={{ color: '#1769E0' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Configured Agent Pipelines</h3>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>{workflowList.length} Registered</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {workflowList.map((wf) => (
                <div
                  key={wf.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderBottom: '1px solid #F1F5F9',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '280px', flex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: wf.isEnabled ? '#EFF6FF' : '#F1F5F9',
                        color: wf.isEnabled ? '#1769E0' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Workflow size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{wf.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{wf.description}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{wf.stepCount} Steps</span> • {wf.triggerEvent}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      Last run: <strong style={{ color: '#0F172A' }}>{wf.lastExecuted}</strong>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleWorkflow(wf.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: wf.isEnabled ? '#ECFDF5' : '#F1F5F9',
                        color: wf.isEnabled ? '#059669' : '#64748B',
                      }}
                    >
                      {wf.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditWorkflow(wf)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#1769E0',
                        cursor: 'pointer',
                      }}
                    >
                      Edit Pipeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT EXECUTIONS & PENDING APPROVALS */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(11, 31, 58, 0.04)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: '#64748B' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Recent Execution Logs & Approvals</h3>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Real-time event stream</span>
            </div>

            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Pipeline</th>
                  <th style={{ padding: '10px 12px' }}>Trigger Payload</th>
                  <th style={{ padding: '10px 12px' }}>Duration</th>
                  <th style={{ padding: '10px 12px' }}>Execution Trace</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {executionLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      {log.status === 'success' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', background: '#ECFDF5', padding: '2px 7px', borderRadius: '999px', fontWeight: 600, fontSize: '11px' }}>
                          <CheckCircle2 size={11} /> Success
                        </span>
                      )}
                      {log.status === 'approval_required' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#DC2626', background: '#FEF2F2', padding: '2px 7px', borderRadius: '999px', fontWeight: 600, fontSize: '11px' }}>
                          <AlertTriangle size={11} /> Gate Active
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 12px', fontWeight: 600, color: '#0F172A' }}>{log.workflowName}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{log.trigger}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{log.duration}</td>
                    <td style={{ padding: '12px 12px', color: '#475569', fontSize: '11px' }}>{log.details}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {log.status === 'approval_required' ? (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToast('Opening approval sign-off...');
                            setViewMode('editor');
                          }}
                          style={{ padding: '4px 8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Review Gate
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{log.timestamp}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ADVANCED WORKFLOW CANVAS EDITOR (Opened on Create/Edit)     */}
      {/* ============================================================== */}
      {viewMode === 'editor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Return & Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '12px 18px', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#1769E0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                <ArrowLeft size={14} />
                <span>Back to Workflows</span>
              </button>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 8px', width: '360px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsDryRunOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: '#0F172A', cursor: 'pointer' }}
              >
                <Play size={13} style={{ color: '#059669' }} />
                <span>Dry Run</span>
              </button>
              <button
                type="button"
                onClick={handleSaveWorkflow}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: '#1769E0', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#FFFFFF', cursor: 'pointer' }}
              >
                <Save size={13} />
                <span>Save Workflow</span>
              </button>
            </div>
          </div>

          {/* AI Generation Prompt */}
          <form onSubmit={handleGenerateWorkflow} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Sparkles size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#1769E0' }} />
              <input
                type="text"
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                placeholder="Describe an automation in natural language (e.g. When a freight invoice > ₹100,000 arrives, scan for tariff variance and alert Controller)..."
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating || !nlPrompt.trim()}
              style={{ padding: '8px 16px', background: '#0B1F3A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              {isGenerating ? 'Synthesizing...' : 'Generate Steps'}
            </button>
          </form>

          {/* Visual Pipeline Canvas */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px' }}>
            <WorkflowCanvas
              steps={steps}
              onSelectStep={(step) => {
                setSelectedNode(step);
                setIsConfigDrawerOpen(true);
              }}
              onReorderSteps={setSteps}
              selectedStepId={selectedNode?.id}
            />
          </div>

          {/* Step Config Drawer */}
          <StepConfigDrawer
            node={selectedNode}
            isOpen={isConfigDrawerOpen}
            onClose={() => setIsConfigDrawerOpen(false)}
            onSave={(updated) => {
              setSteps((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
              setIsConfigDrawerOpen(false);
              onAddToast(`Updated step: ${updated.name}`);
            }}
          />

          {/* Dry Run Modal */}
          <DryRunModal
            isOpen={isDryRunOpen}
            onClose={() => setIsDryRunOpen(false)}
            workflowName={workflowName}
            steps={steps}
            onAddToast={onAddToast}
          />
        </div>
      )}
    </div>
  );
};

export default WorkflowsModule;
