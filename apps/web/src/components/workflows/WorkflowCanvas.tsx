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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--sp-6) var(--sp-4)',
        gap: 'var(--sp-4)',
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
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
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px 0',
                }}
              >
                <div style={{ width: 2, height: 32, backgroundColor: 'var(--c-border)' }} />
                <ArrowDown size={14} style={{ color: 'var(--c-text-3)', marginTop: -4 }} />

                <button
                  type="button"
                  onClick={() =>
                    setShowAddMenuIndex(showAddMenuIndex === index ? null : index)
                  }
                  style={{
                    position: 'absolute',
                    top: -2,
                    width: 24,
                    height: 24,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--c-surface)',
                    border: '1px solid var(--c-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--c-text-2)',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                  title="Insert step here"
                >
                  <Plus size={13} />
                </button>

                {showAddMenuIndex === index && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 32,
                      width: 260,
                      backgroundColor: 'var(--c-surface)',
                      border: '1px solid var(--c-border)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: 'var(--sp-2)',
                      zIndex: 30,
                      animation: 'fade-in 0.15s ease',
                      fontSize: 'var(--text-xs)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        fontWeight: 700,
                        color: 'var(--c-text-3)',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                      }}
                    >
                      Insert Intermediate Step
                    </div>
                    {availableNodeTypes.map((item) => (
                      <button
                        key={item.type}
                        onClick={() => {
                          onAddNode(item.type, index + 1);
                          setShowAddMenuIndex(null);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--c-text-1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--sp-2)',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--c-page)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}

      <div style={{ position: 'relative', paddingTop: 'var(--sp-2)' }}>
        <button
          onClick={() =>
            setShowAddMenuIndex(
              showAddMenuIndex === steps.length ? null : steps.length
            )
          }
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--c-surface)',
            border: '2px dashed var(--c-border)',
            color: 'var(--c-blue)',
            borderRadius: 'var(--radius-xl)',
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-blue)';
            e.currentTarget.style.backgroundColor = '#F0F6FE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-border)';
            e.currentTarget.style.backgroundColor = 'var(--c-surface)';
          }}
        >
          <Plus size={16} />
          Add Next Workflow Step
        </button>

        {showAddMenuIndex === steps.length && (
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 260,
              backgroundColor: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--sp-2)',
              zIndex: 30,
              animation: 'fade-in 0.15s ease',
              fontSize: 'var(--text-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div
              style={{
                padding: '4px 8px',
                fontWeight: 700,
                color: 'var(--c-text-3)',
                textTransform: 'uppercase',
                fontSize: '10px',
              }}
            >
              Select Step Type to Append
            </div>
            {availableNodeTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  onAddNode(item.type);
                  setShowAddMenuIndex(null);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--c-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--c-page)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
