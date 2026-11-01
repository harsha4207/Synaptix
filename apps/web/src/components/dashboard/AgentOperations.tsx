import React from 'react';
import {
  Workflow,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldAlert,
  Power
} from 'lucide-react';
import { OperationalWorkflow, OperationalExecution } from './types';

interface AgentOperationsProps {
  workflows: OperationalWorkflow[];
  executions: OperationalExecution[];
  onNavigateToWorkflows?: () => void;
  onInspectExecution?: (execId: string) => void;
  onToggleWorkflow?: (workflowId: string) => void;
}

export const AgentOperations: React.FC<AgentOperationsProps> = ({
  workflows,
  executions,
  onNavigateToWorkflows,
  onInspectExecution,
  onToggleWorkflow,
}) => {
  const activeCount = workflows.filter((w) => w.isEnabled).length;
  const pendingApprovalsCount = executions.filter((e) => e.status === 'approval_required').length;

  return (
    <section
      className="dash-card-static dash-stagger-4"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
      aria-label="Agent Operations"
    >
      {/* SECTION HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Workflow size={16} style={{ color: '#1769E0' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Agent Operations & Pipeline Telemetry
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
            Configured autonomous agents, trigger handlers, and live sandboxed execution stream.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick status pills */}
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#ECFDF5',
              color: '#065F46',
              fontWeight: 600,
            }}
          >
            {activeCount} Active Pipelines
          </span>

          {pendingApprovalsCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#FFFBEB',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontWeight: 600,
              }}
            >
              {pendingApprovalsCount} Approval Gated
            </span>
          )}

          {onNavigateToWorkflows && (
            <button
              type="button"
              onClick={onNavigateToWorkflows}
              className="dash-btn-ghost"
              style={{ fontSize: '11px', height: '30px' }}
            >
              <span>Manage Workflows</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* TWO COLUMNS: WORKFLOWS LIST + EXECUTION STREAM */}
      <div className="dash-two-col">
        {/* LEFT COLUMN: CONFIGURED WORKFLOWS TABLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Configured Autonomous Workflows
            </h4>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {workflows.length} total defined
            </span>
          </div>

          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#FFFFFF',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                    Workflow Name
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                    Trigger
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px' }}>
                    Success
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px', textAlign: 'right' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => (
                  <tr
                    key={wf.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background 120ms ease',
                    }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>
                        {wf.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '240px',
                        }}
                      >
                        {wf.description}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        <span>{wf.triggerEvent}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                        {wf.stepCount} reasoning steps
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: '#16A34A' }}>{wf.successRate}</span>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{wf.executionCount} runs</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onToggleWorkflow && onToggleWorkflow(wf.id)}
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          cursor: onToggleWorkflow ? 'pointer' : 'default',
                          border: 'none',
                          background: wf.isEnabled ? '#ECFDF5' : '#F1F5F9',
                          color: wf.isEnabled ? '#059669' : '#64748B',
                        }}
                        title={wf.isEnabled ? 'Workflow is active' : 'Workflow is disabled'}
                      >
                        {wf.isEnabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT EXECUTIONS STREAM */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Recent Execution Records
            </h4>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Real-time audit log
            </span>
          </div>

          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {executions.map((exec, idx) => {
              const isApproval = exec.status === 'approval_required';
              const isSuccess = exec.status === 'success';
              const isFailed = exec.status === 'failed';

              return (
                <div
                  key={exec.id}
                  style={{
                    padding: '10px 14px',
                    borderBottom: idx < executions.length - 1 ? '1px solid #F1F5F9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: isApproval ? '#FFFDF5' : 'transparent',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      {isSuccess && <CheckCircle2 size={13} style={{ color: '#16A34A', flexShrink: 0 }} />}
                      {isApproval && <AlertTriangle size={13} style={{ color: '#D97706', flexShrink: 0 }} />}
                      {isFailed && <ShieldAlert size={13} style={{ color: '#DC2626', flexShrink: 0 }} />}

                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                        {exec.workflowName}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748B',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {exec.details}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isSuccess ? '#DCFCE7' : isApproval ? '#FEF3C7' : '#FEE2E2',
                          color: isSuccess ? '#166534' : isApproval ? '#92400E' : '#991B1B',
                        }}
                      >
                        {isSuccess ? 'Success' : isApproval ? 'Awaiting Sign-Off' : 'Failed'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>{exec.duration}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                      {exec.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

