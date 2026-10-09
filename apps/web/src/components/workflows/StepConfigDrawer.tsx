import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  ShieldCheck
} from 'lucide-react';
import { WorkflowStepNode, WorkflowNodeType } from './WorkflowNode';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormField } from '../ui/FormField';

interface StepConfigDrawerProps {
  node: WorkflowStepNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNode: (updatedNode: WorkflowStepNode) => void;
  onAddToast: (msg: string) => void;
}

export const StepConfigDrawer: React.FC<StepConfigDrawerProps> = ({
  node,
  isOpen,
  onClose,
  onSaveNode,
  onAddToast,
}) => {
  if (!isOpen || !node) return null;

  const [name, setName] = useState(node.name);
  const [type, setType] = useState<WorkflowNodeType>(node.type);
  const [configSummary, setConfigSummary] = useState(node.configSummary);
  const [conditionExpression, setConditionExpression] = useState(
    node.details?.conditionExpression || 'amount > 100000 && isDuplicate == false'
  );
  const [approverRole, setApproverRole] = useState(
    node.details?.approverRole || 'Finance Lead / Controller'
  );
  const [channel, setChannel] = useState(node.details?.channel || 'Enterprise Slack #finance-approvals');
  const [connectorType, setConnectorType] = useState(
    node.details?.connectorType || 'SAP ERP S/4HANA Finance'
  );

  useEffect(() => {
    setName(node.name);
    setType(node.type);
    setConfigSummary(node.configSummary);
    if (node.details?.conditionExpression) setConditionExpression(node.details.conditionExpression);
    if (node.details?.approverRole) setApproverRole(node.details.approverRole);
    if (node.details?.channel) setChannel(node.details.channel);
    if (node.details?.connectorType) setConnectorType(node.details.connectorType);
  }, [node]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNode({
      ...node,
      name,
      type,
      configSummary,
      details: {
        ...node.details,
        conditionExpression,
        approverRole,
        channel,
        connectorType,
      },
    });
    onAddToast(`Updated step configuration: "${name}"`);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(11, 31, 58, 0.35)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fade-in 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          height: '100%',
          backgroundColor: 'var(--c-surface)',
          borderLeft: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          animation: 'slide-in-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderBottom: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-page)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div
              style={{
                padding: 'var(--sp-2)',
                backgroundColor: 'rgba(23, 105, 224, 0.1)',
                color: 'var(--c-blue)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--c-text-1)', margin: 0 }}>
                Step Configuration
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: 0 }}>
                Parameters, rules & routing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--c-text-3)',
            }}
            aria-label="Close configuration"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form
          onSubmit={handleApply}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--sp-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-4)',
          }}
        >
          <FormField label="Step Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Step Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkflowNodeType)}
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
            >
              <option value="Trigger">Trigger (Event source)</option>
              <option value="Condition">Condition (Branch / Filter)</option>
              <option value="Data extraction">Data Extraction (OCR / Parsing)</option>
              <option value="AI analysis">AI Analysis (Reasoning / Fraud Scan)</option>
              <option value="Approval">Approval (Human-in-the-loop)</option>
              <option value="Notification">Notification (Slack / Email)</option>
              <option value="Database action">Database Action (Ledger write)</option>
              <option value="Enterprise connector">Enterprise Connector (ERP / CRM)</option>
              <option value="Report generation">Report Generation (PDF / XLSX)</option>
              <option value="Verification">Verification (Cryptographic check)</option>
            </select>
          </FormField>

          <FormField label="Configuration Summary">
            <Input
              type="text"
              value={configSummary}
              onChange={(e) => setConfigSummary(e.target.value)}
              placeholder="e.g. Invoices > ₹100,000 threshold"
            />
          </FormField>

          {type === 'Condition' && (
            <FormField label="Condition Expression">
              <textarea
                value={conditionExpression}
                onChange={(e) => setConditionExpression(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: 'var(--sp-2) var(--sp-3)',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--c-text-1)',
                  outline: 'none',
                }}
              />
            </FormField>
          )}

          {type === 'Approval' && (
            <FormField label="Authorized Approver Role">
              <select
                value={approverRole}
                onChange={(e) => setApproverRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--sp-2) var(--sp-3)',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--c-text-1)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                }}
              >
                <option value="Finance Lead / Controller">Finance Lead / Controller</option>
                <option value="Procurement Director">Procurement Director</option>
                <option value="Dual Officer Authorization">Dual Officer Authorization</option>
                <option value="Workspace Admin">Workspace Admin</option>
              </select>
            </FormField>
          )}

          {type === 'Notification' && (
            <FormField label="Notification Destination">
              <Input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </FormField>
          )}

          {type === 'Enterprise connector' && (
            <FormField label="Enterprise Connector">
              <select
                value={connectorType}
                onChange={(e) => setConnectorType(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--sp-2) var(--sp-3)',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--c-text-1)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                }}
              >
                <option value="SAP ERP S/4HANA Finance">SAP ERP S/4HANA Finance</option>
                <option value="Oracle NetSuite ERP">Oracle NetSuite ERP</option>
                <option value="Workday Financial Management">Workday Financial Management</option>
                <option value="Salesforce Revenue Cloud">Salesforce Revenue Cloud</option>
              </select>
            </FormField>
          )}

          <div
            style={{
              padding: 'var(--sp-3)',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '11px', color: '#1E40AF' }}>
              <ShieldCheck size={14} style={{ color: 'var(--c-blue)' }} />
              Governed Execution Sandbox
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#1E40AF', lineHeight: 1.4 }}>
              All automated step actions require cryptographic evidence hashes and RBAC permission verification before write access.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderTop: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-page)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--sp-2)',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="blue" onClick={handleApply} icon={<Check size={15} />}>
            Save Step
          </Button>
        </div>
      </div>
    </div>
  );
};
