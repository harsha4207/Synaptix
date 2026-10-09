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
  Check
} from 'lucide-react';
import { WorkspaceItem } from '../types/workspace';
import { WorkflowStepNode, WorkflowNodeType } from '../components/workflows/WorkflowNode';
import { WorkflowCanvas } from '../components/workflows/WorkflowCanvas';
import { StepConfigDrawer } from '../components/workflows/StepConfigDrawer';
import { DryRunModal } from '../components/workflows/DryRunModal';
import { PageContainer, PageContent } from '../components/layout';

interface WorkflowsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export const WorkflowsModule: React.FC<WorkflowsModuleProps> = ({ workspace, onAddToast }) => {
  // Natural Language Prompt State
  const [nlPrompt, setNlPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Workflow Metadata & Status
  const [workflowName, setWorkflowName] = useState<string>(
    'Invoice Verification & High-Value Approval'
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // Active testing state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isDryRunOpen, setIsDryRunOpen] = useState<boolean>(false);

  // Selected Step for Configuration Drawer
  const [selectedNode, setSelectedNode] = useState<WorkflowStepNode | null>(null);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);

  // Initial Default Workflow Pipeline Nodes
  const [steps, setSteps] = useState<WorkflowStepNode[]>([
    {
      id: 'step-1',
      type: 'Trigger',
      name: 'Document Upload Event',
      configSummary: 'When a new vendor invoice (PDF/XLSX) is uploaded to Finance workspace',
      status: 'Configured',
      details: {
        triggerEvent: 'workspace.documents.upload',
      },
    },
    {
      id: 'step-2',
      type: 'Data extraction',
      name: 'Extract Invoice Fields & OCR',
      configSummary: 'Parse vendor name, line items, invoice total amount, and tax ID',
      status: 'Configured',
      details: {
        extractionFields: ['vendorName', 'invoiceAmount', 'currency', 'taxId', 'invoiceDate'],
      },
    },
    {
      id: 'step-3',
      type: 'Condition',
      name: 'Duplicate Check & Threshold Rule',
      configSummary: 'Verify isDuplicate == false AND invoiceAmount > ₹100,000',
      status: 'Configured',
      details: {
        conditionExpression: 'invoiceAmount > 100000 && isDuplicate == false',
      },
    },
    {
      id: 'step-4',
      type: 'AI analysis',
      name: 'Anomaly & Compliance Scan',
      configSummary: 'Scan for pricing drift, abnormal freight surcharges, and tariff schedule mismatches',
      status: 'Configured',
      details: {
        aiModel: 'Synaptix Rigor Engine v4',
      },
    },
    {
      id: 'step-5',
      type: 'Approval',
      name: 'Finance Controller Sign-off',
      configSummary: 'Route high-value invoices to Finance Lead / Controller for dual authorization',
      status: 'Configured',
      details: {
        approverRole: 'Finance Lead / Controller',
      },
    },
    {
      id: 'step-6',
      type: 'Notification',
      name: 'Dispatch Approval Alert',
      configSummary: 'Send real-time interactive approval card to Slack #finance-approvals',
      status: 'Configured',
      details: {
        channel: 'Enterprise Slack #finance-approvals',
      },
    },
    {
      id: 'step-7',
      type: 'Verification',
      name: 'Cryptographic G1 Ledger Hash',
      configSummary: 'Generate tamper-evident evidence hash and log to immutable audit ledger',
      status: 'Configured',
      details: {
        verificationRule: 'G1 Ledger Proof Generated',
      },
    },
  ]);

  // Handle Natural Language Workflow Generation
  const handleGenerateWorkflow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    onAddToast('Interpreting natural-language automation prompt...');

    setTimeout(() => {
      setIsGenerating(false);
      setWorkflowName('Invoice Ingestion, OCR & Approval Pipeline');

      // Convert into: Trigger → Data Extraction → Condition → AI Analysis → Approval → Notification → Verification
      const generatedSteps: WorkflowStepNode[] = [
        {
          id: `step-${Date.now()}-1`,
          type: 'Trigger',
          name: 'Invoice Upload Trigger',
          configSummary: 'Fires when any new PDF/DOCX invoice is added to the domain',
          status: 'Configured',
        },
        {
          id: `step-${Date.now()}-2`,
          type: 'Data extraction',
          name: 'Extract Amount & Vendor Metadata',
          configSummary: 'Extracts invoice total, vendor name, and line items via OCR engine',
          status: 'Configured',
        },
        {
          id: `step-${Date.now()}-3`,
          type: 'Condition',
          name: 'Amount > ₹100,000 & Duplicate Check',
          configSummary: 'Filters out duplicate invoices and matches amount > ₹100,000',
          status: 'Configured',
        },
        {
          id: `step-${Date.now()}-4`,
          type: 'Approval',
          name: 'Managerial Sign-Off',
          configSummary: 'Requires Controller approval before release',
          status: 'Configured',
        },
        {
          id: `step-${Date.now()}-5`,
          type: 'Notification',
          name: 'Approval Notification',
          configSummary: 'Dispatches notification to Slack #finance-approvals and email',
          status: 'Configured',
        },
        {
          id: `step-${Date.now()}-6`,
          type: 'Verification',
          name: 'Cryptographic Evidence Logging',
          configSummary: 'Commits G1 verified evidence hash to workspace audit record',
          status: 'Configured',
        },
      ];

      setSteps(generatedSteps);
      setIsSaved(false);
      onAddToast('Generated visual workflow pipeline from natural language!');
    }, 800);
  };

  // Node Selection & Config Drawer
  const handleSelectNode = (node: WorkflowStepNode) => {
    setSelectedNode(node);
    setIsConfigDrawerOpen(true);
  };

  const handleSaveNodeConfig = (updatedNode: WorkflowStepNode) => {
    setSteps((prev) => prev.map((s) => (s.id === updatedNode.id ? updatedNode : s)));
    setIsSaved(false);
  };

  const handleDeleteNode = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setIsSaved(false);
    onAddToast('Deleted step from workflow');
  };

  const handleDuplicateNode = (node: WorkflowStepNode) => {
    const newNode: WorkflowStepNode = {
      ...node,
      id: `step-${Date.now()}`,
      name: `${node.name} (Copy)`,
    };
    setSteps((prev) => [...prev, newNode]);
    setIsSaved(false);
    onAddToast(`Duplicated step: "${newNode.name}"`);
  };

  const handleAddNode = (type: WorkflowNodeType, afterIndex?: number) => {
    const newNode: WorkflowStepNode = {
      id: `step-${Date.now()}`,
      type,
      name: `New ${type} Step`,
      configSummary: `Configured ${type} rule`,
      status: 'Configured',
    };

    if (afterIndex !== undefined) {
      const updated = [...steps];
      updated.splice(afterIndex, 0, newNode);
      setSteps(updated);
    } else {
      setSteps((prev) => [...prev, newNode]);
    }

    setIsSaved(false);
    onAddToast(`Added ${type} step to workflow`);
  };

  // Workflow Test Action (Animates execution through nodes)
  const handleTestWorkflow = () => {
    setIsTesting(true);
    onAddToast('Executing live workflow pipeline test...');

    // Reset status to configured
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'Configured' })));

    let current = 0;
    const interval = setInterval(() => {
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === current) return { ...s, status: 'Running' };
          if (idx < current) return { ...s, status: 'Passed' };
          return s;
        })
      );

      current++;
      if (current > steps.length) {
        clearInterval(interval);
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'Passed' })));
        setIsTesting(false);
        onAddToast('All workflow steps passed test execution!');
      }
    }, 450);
  };

  // Save Workflow
  const handleSaveWorkflow = () => {
    setIsSaved(true);
    setShowSaveSuccess(true);
    onAddToast(`Saved automation "${workflowName}" to ${workspace.name} Workspace`);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  return (
    <PageContainer>
      <PageContent>
      {/* TOP NATURAL-LANGUAGE AUTOMATION BUILDER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold tracking-tight">Create an Automation</h1>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-mono">
            {workspace.name} Domain Sandbox
          </span>
        </div>

        <form onSubmit={handleGenerateWorkflow} className="relative flex items-center">
          <input
            type="text"
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="“Describe what should happen automatically...” (e.g., When a new invoice is uploaded, extract the amount, check for duplicates, and send invoices above ₹100,000 for approval.)"
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-4 pr-32 py-3 text-sm text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="absolute right-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                Convert
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-blue-300">Try example prompt:</span>
          <button
            onClick={() => {
              setNlPrompt(
                'When a new invoice is uploaded, extract the amount, check for duplicates, and send invoices above ₹100,000 for approval.'
              );
              handleGenerateWorkflow();
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-blue-100 text-left transition-all hover:scale-[1.01]"
          >
            “When a new invoice is uploaded, extract the amount, check for duplicates, and send invoices above ₹100,000 for approval.”
          </button>
        </div>
      </div>

      {/* TOP WORKFLOW TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => {
                    setWorkflowName(e.target.value);
                    setIsSaved(false);
                  }}
                  className="font-extrabold text-slate-900 text-lg bg-transparent hover:bg-slate-100 border-b border-transparent hover:border-slate-300 rounded px-1 outline-none transition-colors"
                />
                {!isSaved && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                    Unsaved Changes
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Visual Workflow Engine with Cryptographic Verification ({steps.length} Steps)
              </p>
            </div>
          </div>

          {/* Action Buttons: Save, Test, Dry Run, Enable/Disable */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsEnabled(!isEnabled);
                onAddToast(isEnabled ? 'Workflow disabled' : 'Workflow enabled and listening for triggers');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                isEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {isEnabled ? 'Enabled' : 'Disabled'}
            </button>

            <button
              onClick={handleTestWorkflow}
              disabled={isTesting}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-blue-600 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing...' : 'Test'}
            </button>

            <button
              onClick={() => setIsDryRunOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Dry Run
            </button>

            <button
              onClick={handleSaveWorkflow}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                showSaveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {showSaveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Workflow
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* VISUAL WORKFLOW EDITOR CANVAS */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-6 min-h-[500px]">
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-200/60 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Visual Execution Sequence (Trigger → Conditions → Actions → Notifications)
          </span>
          <span className="text-slate-400 font-mono">
            Click any node to configure parameters in right inspector
          </span>
        </div>

        <WorkflowCanvas
          steps={steps}
          selectedNodeId={selectedNode?.id || null}
          onSelectNode={handleSelectNode}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
        />
      </div>

      {/* RIGHT STEP CONFIGURATION DRAWER */}
      <StepConfigDrawer
        node={selectedNode}
        isOpen={isConfigDrawerOpen}
        onClose={() => setIsConfigDrawerOpen(false)}
        onSaveNode={handleSaveNodeConfig}
        onAddToast={onAddToast}
      />

      {/* DRY RUN SIMULATION MODAL */}
      <DryRunModal
        isOpen={isDryRunOpen}
        onClose={() => setIsDryRunOpen(false)}
        workflowName={workflowName}
        steps={steps}
        onAddToast={onAddToast}
      />
      </PageContent>
    </PageContainer>
  );
};
