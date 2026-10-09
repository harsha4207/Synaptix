import React, { useState } from 'react';
import {
  Plus,
  ArrowDown,
  Zap,
  GitBranch,
  FileSearch,
  BrainCircuit,
  UserCheck,
  Bell,
  Database,
  Link,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { WorkflowStepNode, WorkflowNode, WorkflowNodeType } from './WorkflowNode';

interface WorkflowCanvasProps {
  steps: WorkflowStepNode[];
  selectedNodeId: string | null;
  onSelectNode: (node: WorkflowStepNode) => void;
  onAddNode: (type: WorkflowNodeType, afterIndex?: number) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (node: WorkflowStepNode) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  steps,
  selectedNodeId,
  onSelectNode,
  onAddNode,
  onDeleteNode,
  onDuplicateNode,
}) => {
  const [showAddMenuIndex, setShowAddMenuIndex] = useState<number | null>(null);

  const availableNodeTypes: { type: WorkflowNodeType; label: string; icon: React.ReactNode }[] = [
    { type: 'Trigger', label: 'Trigger (Event)', icon: <Zap size={14} style={{ color: '#D97706' }} /> },
    { type: 'Condition', label: 'Condition (Branch)', icon: <GitBranch size={14} style={{ color: 'var(--c-blue)' }} /> },
    { type: 'Data extraction', label: 'Data Extraction (OCR)', icon: <FileSearch size={14} style={{ color: '#4F46E5' }} /> },
    { type: 'AI analysis', label: 'AI Analysis (Reasoning)', icon: <BrainCircuit size={14} style={{ color: '#7C3AED' }} /> },
    { type: 'Approval', label: 'Approval (Sign-off)', icon: <UserCheck size={14} style={{ color: 'var(--c-success)' }} /> },
    { type: 'Notification', label: 'Notification (Alert)', icon: <Bell size={14} style={{ color: '#0891B2' }} /> },
    { type: 'Database action', label: 'Database Action (Write)', icon: <Database size={14} style={{ color: '#0D9488' }} /> },
    { type: 'Enterprise connector', label: 'Enterprise Connector (ERP)', icon: <Link size={14} style={{ color: '#E11D48' }} /> },
    { type: 'Report generation', label: 'Report Generation (PDF)', icon: <FileText size={14} style={{ color: '#EA580C' }} /> },
    { type: 'Verification', label: 'Verification (Proof)', icon: <ShieldCheck size={14} style={{ color: 'var(--c-success)' }} /> },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-1 sm:px-4 py-1">
      {steps.map((step, index) => {
        const isSelected = selectedNodeId === step.id;

        return (
          <React.Fragment key={step.id}>
            <WorkflowNode
              node={step}
              stepNumber={index + 1}
              isSelected={isSelected}
              onSelect={onSelectNode}
              onDelete={onDeleteNode}
              onDuplicate={onDuplicateNode}
            />

            {index < steps.length - 1 && (
              <div className="relative flex flex-col items-center py-2 sm:py-2.5 my-0.5 select-none w-full max-w-2xl">
                {/* Top connector stem */}
                <div className="w-0.5 h-4 bg-[var(--c-border)]" />

                {/* Centered Add intermediate step button */}
                <button
                  type="button"
                  onClick={() =>
                    setShowAddMenuIndex(showAddMenuIndex === index ? null : index)
                  }
                  className="w-7 h-7 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] shadow-xs hover:border-[var(--c-blue)] hover:text-[var(--c-blue)] hover:bg-[#F0F6FE] hover:scale-105 flex items-center justify-center text-[var(--c-text-2)] transition-all cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-[var(--c-blue-ring)]"
                  title="Insert intermediate step"
                  aria-label="Insert intermediate step"
                >
                  <Plus size={14} />
                </button>

                {/* Bottom connector stem & Arrow */}
                <div className="w-0.5 h-3.5 bg-[var(--c-border)]" />
                <ArrowDown size={14} className="text-[var(--c-text-3)] -mt-1" />

                {/* Dropdown Menu */}
                {showAddMenuIndex === index && (
                  <div className="absolute top-12 w-64 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-xl p-2 z-30 animate-fade-in text-xs flex flex-col gap-1">
                    <div className="px-2.5 py-1.5 font-bold text-[var(--c-text-3)] uppercase text-[10px] tracking-wider border-b border-[var(--c-border)] mb-1">
                      Insert Intermediate Step
                    </div>
                    {availableNodeTypes.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onAddNode(item.type, index + 1);
                          setShowAddMenuIndex(null);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg border-0 bg-transparent text-[var(--c-text-1)] hover:bg-[var(--c-page)] hover:text-[var(--c-blue)] flex items-center gap-2.5 font-medium text-xs transition-colors cursor-pointer"
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}

      <div className="relative pt-4 sm:pt-5 w-full flex justify-center">
        <button
          type="button"
          onClick={() =>
            setShowAddMenuIndex(
              showAddMenuIndex === steps.length ? null : steps.length
            )
          }
          className="px-5 py-3 bg-[var(--c-surface)] hover:bg-[#F0F6FE] border-2 border-dashed border-[var(--c-border)] hover:border-[var(--c-blue)] text-[var(--c-blue)] rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
        >
          <Plus size={16} />
          <span>Add Next Workflow Step</span>
        </button>

        {showAddMenuIndex === steps.length && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl shadow-xl p-2 z-30 animate-fade-in text-xs flex flex-col gap-1">
            <div className="px-2.5 py-1.5 font-bold text-[var(--c-text-3)] uppercase text-[10px] tracking-wider border-b border-[var(--c-border)] mb-1">
              Select Step Type to Append
            </div>
            {availableNodeTypes.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  onAddNode(item.type);
                  setShowAddMenuIndex(null);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg border-0 bg-transparent text-[var(--c-text-1)] hover:bg-[var(--c-page)] hover:text-[var(--c-blue)] flex items-center gap-2.5 font-medium text-xs transition-colors cursor-pointer"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
