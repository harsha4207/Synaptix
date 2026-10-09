import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  ShieldAlert,
  FileCode,
  Clock,
  Sparkles
} from 'lucide-react';
import { WorkflowStepNode } from './WorkflowNode';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DryRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  steps: WorkflowStepNode[];
  onAddToast: (msg: string) => void;
}

export const DryRunModal: React.FC<DryRunModalProps> = ({
  isOpen,
  onClose,
  workflowName,
  steps,
  onAddToast,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [hasCompleted, setHasCompleted] = useState(false);

  if (!isOpen) return null;

  const sampleInputPayload = {
    eventType: 'document.upload',
    documentId: 'DOC-2026-INV-9041',
    fileName: 'Enterprise_Vendor_Invoice_ACME.pdf',
    extractedAmount: 145000,
    currency: 'INR (₹)',
    vendorName: 'ACME Cloud Logistics Pvt Ltd',
    invoiceDate: '2026-10-02',
    isDuplicate: false,
    evidenceHash: '0x8a9f42b10e99a110',
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setHasCompleted(false);
    setActiveStepIndex(0);
    onAddToast('Starting sandboxed dry run simulation...');

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setActiveStepIndex(current);
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setHasCompleted(true);
        onAddToast('Dry run simulation completed successfully!');
      }
    }, 600);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="900px">
      <DialogHeader
        title="Dry Run Execution Simulation"
        description={`Testing workflow: ${workflowName}`}
        onClose={onClose}
      />

      {/* Safety Banner */}
      <div
        style={{
          backgroundColor: '#FFFBEB',
          borderBottom: '1px solid #FDE68A',
          padding: 'var(--sp-3) var(--sp-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
          fontSize: 'var(--text-xs)',
          color: '#92400E',
        }}
      >
        <ShieldAlert size={18} style={{ color: '#D97706', flexShrink: 0 }} />
        <div>
          <strong>No Real-World Write Action Will Occur: </strong>
          All external API calls, database mutations, notifications, and ledger writes are strictly simulated inside an isolated sandbox environment.
        </div>
      </div>

      <DialogBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        {/* Step overview cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--sp-3)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--c-page)',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--c-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--c-text-3)', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>
                1. Sample Input
              </span>
              <span style={{ fontSize: '10px', color: 'var(--c-blue)', fontWeight: 600 }}>Ready</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--c-text-1)' }}>
              Invoice Upload (₹145,000)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-2)', display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6, borderTop: '1px solid var(--c-border)' }}>
              <div>Doc: <span style={{ color: 'var(--c-text-1)' }}>INV-9041.pdf</span></div>
              <div>Amount: <span style={{ color: 'var(--c-success)', fontWeight: 700 }}>₹145,000</span></div>
              <div>Duplicate: <span style={{ color: 'var(--c-blue)' }}>False</span></div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--c-page)',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--c-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--c-text-3)', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>
                2. Planned Steps
              </span>
              <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: 600 }}>{steps.length} Steps</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--c-text-1)' }}>
              Automated Execution Chain
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-2)', display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6, borderTop: '1px solid var(--c-border)' }}>
              <div>Trigger & OCR Parse</div>
              <div>Condition (&gt;₹100k) Evaluated</div>
              <div>Approval Request Routed</div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--c-page)',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--c-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sp-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--c-text-3)', fontFamily: 'var(--font-body)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>
                3. Expected Outcome
              </span>
              <span style={{ fontSize: '10px', color: 'var(--c-success)', fontWeight: 600 }}>Simulated</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--c-text-1)' }}>
              Approval Required
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-2)', display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6, borderTop: '1px solid var(--c-border)' }}>
              <div>Slack: <span style={{ color: 'var(--c-blue)' }}>#finance-approvals</span></div>
              <div>Audit: <span style={{ color: 'var(--c-text-3)' }}>0x8a9f42...</span></div>
              <div>Status: <span style={{ color: '#D97706', fontWeight: 700 }}>Pending Approval</span></div>
            </div>
          </div>
        </div>

        {/* Step-by-step trace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--c-text-1)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <Sparkles size={16} style={{ color: 'var(--c-blue)' }} />
            Step-by-Step Simulation Trace
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {steps.map((step, idx) => {
              const isPassed = hasCompleted || (isRunning && activeStepIndex > idx);
              const isCurrent = isRunning && activeStepIndex === idx;

              return (
                <div
                  key={step.id}
                  style={{
                    padding: 'var(--sp-3) var(--sp-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: isCurrent
                      ? '2px solid var(--c-blue)'
                      : isPassed
                      ? '1px solid #C4EDCF'
                      : '1px solid var(--c-border)',
                    backgroundColor: isCurrent
                      ? '#EFF6FF'
                      : isPassed
                      ? '#F7FCF8'
                      : 'var(--c-page)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--sp-3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '11px',
                        backgroundColor: isPassed
                          ? 'var(--c-success)'
                          : isCurrent
                          ? 'var(--c-blue)'
                          : 'var(--c-border)',
                        color: isPassed || isCurrent ? '#fff' : 'var(--c-text-2)',
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={15} /> : idx + 1}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--c-text-1)', fontSize: 'var(--text-xs)' }}>
                          {step.name}
                        </span>
                        <Badge variant="outline" size="sm">
                          {step.type}
                        </Badge>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--c-text-2)', marginTop: 2 }}>
                        {step.configSummary}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>
                    {isCurrent ? (
                      <span style={{ color: 'var(--c-blue)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        Evaluating...
                      </span>
                    ) : isPassed ? (
                      <span style={{ color: 'var(--c-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} />
                        Simulated Success
                      </span>
                    ) : (
                      <span style={{ color: 'var(--c-text-3)' }}>Waiting</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock payload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--c-text-1)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <FileCode size={14} style={{ color: 'var(--c-text-3)' }} />
            Mock Payload Inspection
          </h4>
          <pre
            style={{
              padding: 'var(--sp-3)',
              backgroundColor: 'var(--c-page)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-text-1)',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              overflowX: 'auto',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {JSON.stringify(sampleInputPayload, null, 2)}
          </pre>
        </div>
      </DialogBody>

      <DialogFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginRight: 'auto' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--c-success)', display: 'inline-block' }} />
          Sandbox dry run results verified with 0 mutations
        </div>

        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleRunSimulation}
          disabled={isRunning}
          loading={isRunning}
          icon={<Play size={14} />}
        >
          {isRunning ? 'Simulating Steps...' : 'Execute Dry Run'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
