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
      className={`group relative w-full max-w-2xl rounded-2xl transition-all cursor-pointer min-w-0 p-4 sm:p-5 ${
        isSelected
          ? 'bg-[#F0F6FE] border-2 border-[var(--c-blue)] shadow-md'
          : node.status === 'Passed'
          ? 'bg-[#F7FCF8] border border-[#C4EDCF] shadow-xs hover:border-[var(--c-blue)] hover:shadow-sm'
          : node.status === 'Running'
          ? 'bg-[#EFF6FF] border-2 border-[#93C5FD] shadow-sm'
          : 'bg-[var(--c-surface)] border border-[var(--c-border)] shadow-xs hover:border-[var(--c-border-2)] hover:shadow-sm'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Workflow step ${stepNumber}: ${node.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node);
        }
      }}
    >
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        {/* Left: Icon & Title Block */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--c-page)] border border-[var(--c-border)] flex items-center justify-center flex-shrink-0 text-[var(--c-text-1)] group-hover:border-[var(--c-blue-ring)] transition-colors">
            {getNodeIcon(node.type)}
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--c-page)] text-[var(--c-text-2)] border border-[var(--c-border)] select-none">
                Step {stepNumber}
              </span>
              <span className="text-[11px] font-semibold text-[var(--c-text-3)] uppercase tracking-wider select-none">
                {node.type}
              </span>
            </div>

            <h4 className="font-bold text-[var(--c-text-1)] text-sm sm:text-[15px] leading-snug break-words tracking-tight m-0">
              {node.name}
            </h4>
          </div>
        </div>

        {/* Right: Status Badge & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[var(--c-border)]">
          <div>{renderStatusBadge(node.status)}</div>

          <div className="flex items-center gap-1">
            {onDuplicate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(node);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--c-text-3)] hover:text-[var(--c-text-1)] hover:bg-[var(--c-page)] border border-transparent hover:border-[var(--c-border)] transition-colors"
                title="Duplicate step"
                aria-label="Duplicate step"
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--c-text-3)] hover:text-[var(--c-danger)] hover:bg-red-50 hover:border-red-200 border border-transparent transition-colors"
                title="Delete step"
                aria-label="Delete step"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step Description & Edit Action */}
      <div className="mt-3.5 pt-3 border-t border-[var(--c-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
        <p className="text-xs sm:text-[13px] text-[var(--c-text-2)] leading-relaxed break-words m-0 flex-1 min-w-0">
          {node.configSummary}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node);
          }}
          className="text-[var(--c-blue)] hover:text-[var(--c-blue-hover)] font-semibold text-xs flex items-center gap-1.5 flex-shrink-0 py-1 px-2 -ml-2 sm:ml-0 rounded-md hover:bg-[var(--c-blue-soft)] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Edit2 size={12} />
          <span>Edit Config</span>
        </button>
      </div>
    </div>
  );
};
