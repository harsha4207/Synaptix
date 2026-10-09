import React from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';

export type ReasoningStage =
  | 'Understanding'
  | 'Retrieving'
  | 'Reasoning'
  | 'Planning'
  | 'Governing'
  | 'Executing'
  | 'Verifying';

export const REASONING_STAGES: { id: ReasoningStage; label: string; desc: string }[] = [
  { id: 'Understanding', label: 'Understanding', desc: 'Parsing intent & natural language entities' },
  { id: 'Retrieving', label: 'Retrieving', desc: 'Querying indexed documents & knowledge triples' },
  { id: 'Reasoning', label: 'Reasoning', desc: 'Synthesizing data & calculating statistical variance' },
  { id: 'Planning', label: 'Planning', desc: 'Structuring reasoning tree & action execution steps' },
  { id: 'Governing', label: 'Governing', desc: 'Validating SAML 2.0 RBAC governance & risk tier policies' },
  { id: 'Executing', label: 'Executing', desc: 'Generating dynamic response, chart & visual model' },
  { id: 'Verifying', label: 'Verifying', desc: 'Hashing evidence & verifying confidence metrics' },
];

interface ReasoningProgressProps {
  currentStageIndex: number;
  isComplete: boolean;
}

export const ReasoningProgress: React.FC<ReasoningProgressProps> = ({
  currentStageIndex,
  isComplete,
}) => {
  return (
    <div className="reasoning-progress-box" aria-label="Reasoning Lifecycle Sequence">
      <div className="progress-box-header">
        <div className="header-title-group">
          <Sparkles size={16} className="progress-sparkle-icon" />
          <span className="progress-header-title">
            {isComplete ? 'Reasoning Cycle Complete' : 'Synaptix Reasoning Lifecycle'}
          </span>
        </div>
        <span className="progress-step-counter">
          {isComplete ? '7 / 7 Verified' : `Stage ${Math.min(currentStageIndex + 1, 7)} of 7`}
        </span>
      </div>

      <div className="progress-stages-list">
        {REASONING_STAGES.map((stage, idx) => {
          const isDone = isComplete || idx < currentStageIndex;
          const isCurrent = !isComplete && idx === currentStageIndex;
          const isPending = !isComplete && idx > currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`stage-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'active' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="step-indicator-node">
                {isDone ? (
                  <Check size={12} className="check-icon" />
                ) : isCurrent ? (
                  <Loader2 size={12} className="spinner-icon animate-spin" />
                ) : (
                  <span className="step-dot" />
                )}
              </div>

              <div className="step-label-group">
                <span className="step-title">{stage.label}</span>
                {isCurrent && <span className="step-desc">{stage.desc}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
