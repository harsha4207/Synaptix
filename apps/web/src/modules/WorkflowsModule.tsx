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
import { PageContainer, PageContent, PageHeader } from '../components/layout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

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
    if (!nlPrompt.trim()) return;
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
      {/* 1. STANDARDIZED PAGE HEADER */}
      <PageHeader
        title="Workflows & Automation"
        description={`Automated reasoning pipelines, event triggers and multi-step execution plans for ${workspace.name}.`}
        breadcrumb={
          <div className="flex items-center gap-2">
            <span>{workspace.name}</span>
            <span className="text-[var(--c-text-3)]">/</span>
            <span className="text-[var(--c-blue)]">Workflows & Automation</span>
          </div>
        }
        badge={
          <Badge variant="blue">
            <Sparkles size={13} />
            Deterministic Pipelines
          </Badge>
        }
      />

      <PageContent>
        {/* 2. REFINED CREATE AN AUTOMATION PANEL */}
        {/* 2. REFINED CREATE AN AUTOMATION PANEL */}
        <div className="nl-prompt-panel">
          <div className="nl-prompt-header">
            <div className="nl-prompt-header-left">
              <div className="nl-prompt-icon-badge">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="nl-prompt-title-group">
                <h2 className="nl-prompt-title">Create an Automation</h2>
                <p className="nl-prompt-subtitle">Generate multi-step reasoning pipelines using natural language</p>
              </div>
            </div>
            <span className="nl-prompt-badge">
              {workspace.name} Domain Sandbox
            </span>
          </div>

          <form
            onSubmit={handleGenerateWorkflow}
            className="nl-prompt-form"
          >
            <div className="nl-prompt-input-wrapper">
              <input
                type="text"
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                placeholder="Describe what should happen automatically (e.g. When a new invoice is uploaded, extract the amount, check for duplicates, and send invoices above ₹100,000 for approval)..."
                className="nl-prompt-input"
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="nl-prompt-btn-primary"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Convert to Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="nl-prompt-examples-row">
            <span className="nl-prompt-examples-label">Try example:</span>
            <button
              type="button"
              onClick={() => {
                setNlPrompt(
                  'When a new invoice is uploaded, extract the amount, check for duplicates, and send invoices above ₹100,000 for approval.'
                );
                handleGenerateWorkflow();
              }}
              className="nl-prompt-example-chip"
            >
              “When a new invoice is uploaded, extract the amount, check for duplicates, and send invoices above ₹100,000 for approval.”
            </button>
          </div>
        </div>

        {/* 3. WORKFLOW OVERVIEW CARD */}
        <div className="w-full bg-[var(--c-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--c-border)] shadow-xs transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 min-w-0">
            {/* Left: Workflow metadata */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[var(--c-blue-soft)] text-[var(--c-blue)] border border-[rgba(23,105,224,0.15)] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Workflow className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => {
                      setWorkflowName(e.target.value);
                      setIsSaved(false);
                    }}
                    style={{
                      fontWeight: 800,
                      fontSize: '18px',
                      color: 'var(--c-text-1)',
                      background: 'transparent',
                      border: '1px solid transparent',
                      borderRadius: '8px',
                      padding: '2px 8px',
                      outline: 'none',
                      width: '100%',
                      maxWidth: '480px',
                    }}
                    className="hover:border-[var(--c-border)] hover:bg-[var(--c-surface-2)] focus:border-[var(--c-blue)] focus:bg-[var(--c-surface)] transition-all font-display text-base sm:text-lg"
                    aria-label="Workflow Name"
                  />
                  {!isSaved && (
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200 select-none">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--c-text-2)] mt-1 font-normal">
                  Visual Workflow Engine with Cryptographic Verification • <span className="font-medium text-[var(--c-text-1)]">{steps.length} Steps Active</span>
                </p>
              </div>
            </div>

            {/* Right: Action Buttons (Power, Test, Dry Run, Save) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--c-border)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEnabled(!isEnabled);
                  onAddToast(isEnabled ? 'Workflow disabled' : 'Workflow enabled and listening for triggers');
                }}
                leftIcon={<Power size={14} className={isEnabled ? 'text-emerald-600' : 'text-[var(--c-text-3)]'} />}
              >
                {isEnabled ? 'Enabled' : 'Disabled'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestWorkflow}
                disabled={isTesting}
                leftIcon={<Play size={14} className={`text-[var(--c-blue)] ${isTesting ? 'animate-spin' : ''}`} />}
              >
                {isTesting ? 'Testing...' : 'Test Run'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDryRunOpen(true)}
                leftIcon={<Zap size={14} className="text-amber-600" />}
              >
                Dry Run
              </Button>

              <Button
                variant={showSaveSuccess ? 'default' : 'blue'}
                size="sm"
                onClick={handleSaveWorkflow}
                leftIcon={showSaveSuccess ? <Check size={14} /> : <Save size={14} />}
              >
                {showSaveSuccess ? 'Saved!' : 'Save Workflow'}
              </Button>
            </div>
          </div>
        </div>

        {/* 4. VISUAL WORKFLOW EDITOR CANVAS */}
        <div className="w-full bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)] p-5 sm:p-7 shadow-xs min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[var(--c-border)] gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[var(--c-text-1)] uppercase tracking-wider text-xs">
                Visual Execution Sequence
              </span>
              <span className="text-[11px] text-[var(--c-text-3)] font-medium">
                (Trigger → Conditions → Actions → Notifications)
              </span>
            </div>
            <span className="text-xs text-[var(--c-text-3)]">
              Click any step node to configure parameters in right inspector
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
