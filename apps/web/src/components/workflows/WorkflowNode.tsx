import React from 'react';
import {
  Zap,
  GitBranch,
  FileSearch,
  BrainCircuit,
  UserCheck,
  Bell,
  Database,
  Link,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Copy,
  Edit2
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export type WorkflowNodeType =
  | 'Trigger'
  | 'Condition'
  | 'Data extraction'
  | 'AI analysis'
  | 'Approval'
  | 'Notification'
  | 'Database action'
  | 'Enterprise connector'
  | 'Report generation'
  | 'Verification';

export type NodeExecutionStatus =
  | 'Configured'
  | 'Active'
  | 'Running'
  | 'Passed'
  | 'Skipped'
  | 'Failed';

export interface WorkflowStepNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  configSummary: string;
  status: NodeExecutionStatus;
  details?: {
    triggerEvent?: string;
    conditionExpression?: string;
    extractionFields?: string[];
    aiModel?: string;
    approverRole?: string;
    channel?: string;
    targetDatabase?: string;
    connectorType?: string;
    reportFormat?: string;
    verificationRule?: string;
  };
}

interface WorkflowNodeProps {
  node: WorkflowStepNode;
  stepNumber: number;
  isSelected: boolean;
  onSelect: (node: WorkflowStepNode) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (node: WorkflowStepNode) => void;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  stepNumber,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const getNodeIcon = (type: WorkflowNodeType) => {
    switch (type) {
      case 'Trigger':
        return <Zap size={16} style={{ color: '#D97706' }} />;
      case 'Condition':
        return <GitBranch size={16} style={{ color: 'var(--c-blue)' }} />;
      case 'Data extraction':
        return <FileSearch size={16} style={{ color: '#4F46E5' }} />;
      case 'AI analysis':
        return <BrainCircuit size={16} style={{ color: '#7C3AED' }} />;
      case 'Approval':
        return <UserCheck size={16} style={{ color: 'var(--c-success)' }} />;
      case 'Notification':
        return <Bell size={16} style={{ color: '#0891B2' }} />;
      case 'Database action':
        return <Database size={16} style={{ color: '#0D9488' }} />;
      case 'Enterprise connector':
        return <Link size={16} style={{ color: '#E11D48' }} />;
      case 'Report generation':
        return <FileText size={16} style={{ color: '#EA580C' }} />;
      case 'Verification':
        return <ShieldCheck size={16} style={{ color: 'var(--c-success)' }} />;
    }
  };

  const renderStatusBadge = (status: NodeExecutionStatus) => {
    switch (status) {
      case 'Passed':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 size={12} style={{ marginRight: 3 }} />
            Passed
          </Badge>
        );
      case 'Running':
        return (
          <Badge variant="blue" size="sm">
            <Clock size={12} style={{ marginRight: 3 }} />
            Running
          </Badge>
        );
      case 'Skipped':
        return (
          <Badge variant="outline" size="sm">
            Skipped
          </Badge>
        );
      case 'Failed':
        return (
          <Badge variant="destructive" size="sm">
            <AlertCircle size={12} style={{ marginRight: 3 }} />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm">
            Configured
          </Badge>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(node)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 580,
        borderRadius: 'var(--radius-xl)',
        border: isSelected
          ? '2px solid var(--c-blue)'
          : node.status === 'Passed'
          ? '1px solid #C4EDCF'
          : node.status === 'Running'
          ? '2px solid #93C5FD'
          : '1px solid var(--c-border)',
        padding: 'var(--sp-4)',
        backgroundColor: isSelected
          ? '#F0F6FE'
          : node.status === 'Passed'
          ? '#F7FCF8'
          : 'var(--c-surface)',
        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--c-page)',
              border: '1px solid var(--c-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {getNodeIcon(node.type)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--c-page)',
                  color: 'var(--c-text-2)',
                  border: '1px solid var(--c-border)',
                }}
              >
                Step {stepNumber}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--c-text-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {node.type}
              </span>
            </div>

            <h4
              style={{
                fontWeight: 700,
                color: 'var(--c-text-1)',
                fontSize: 'var(--text-sm)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {node.name}
            </h4>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexShrink: 0 }}>
          {renderStatusBadge(node.status)}

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onDuplicate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(node);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--c-text-3)',
                }}
                title="Duplicate step"
              >
                <Copy size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--c-danger)',
                }}
                title="Delete step"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 'var(--sp-3)',
          paddingTop: 'var(--sp-2)',
          borderTop: '1px solid var(--c-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--text-xs)',
          color: 'var(--c-text-3)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360, color: 'var(--c-text-2)' }}>
          {node.configSummary}
        </span>
        <span style={{ color: 'var(--c-blue)', fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Edit2 size={12} />
          Edit Config
        </span>
      </div>
    </div>
  );
};
