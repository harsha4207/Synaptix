import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Lock,
  Database,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import { StepUpAuthModal } from './StepUpAuthModal';

export interface GovernedActionItem {
  id: string;
  name: string;
  requestedBy: string;
  workspace: string;
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedSystems: string[];
  changesSummary: string;
  evidenceGrade: string;
  evidenceHash: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | 'Invalidated';
  verificationStatus: 'Unverified' | 'Verified' | 'Pending Verification' | 'Unknown';
  statusCategory: 'Pending' | 'Approved' | 'Running' | 'Completed' | 'Failed' | 'Unknown' | 'Rolled Back';
  goalUnderstood: string;
  planSummary: string;
  planVersion: string;
  planHash: string;
  isPlanValid: boolean;
  reversibility: 'Fully Reversible' | 'Partially Reversible' | 'Irreversible';
  verificationMethod: string;
  steps: {
    stepIndex: number;
    title: string;
    system: string;
    description: string;
    isApproved: boolean;
  }[];
}

interface ActionPreviewModalProps {
  action: GovernedActionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, untilStep?: number) => void;
  onReject: (id: string) => void;
  onModifyPlan: (id: string, newPlanText: string) => void;
  onAddToast: (msg: string) => void;
}

export const ActionPreviewModal: React.FC<ActionPreviewModalProps> = ({
  action,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onModifyPlan,
  onAddToast,
}) => {
  const [selectedUntilStep, setSelectedUntilStep] = useState<number>(3);
  const [isModifying, setIsModifying] = useState(false);
  const [modifiedPlanText, setModifiedPlanText] = useState('');
  const [isStepUpAuthOpen, setIsStepUpAuthOpen] = useState(false);
  const [isApprovingAnimation, setIsApprovingAnimation] = useState(false);

  if (!isOpen || !action) return null;

  const isHighRisk = action.riskTier === 'High' || action.riskTier === 'Critical';

  const handleApproveClick = (untilStep?: number) => {
    if (isHighRisk) {
      setIsStepUpAuthOpen(true);
      return;
    }

    setIsApprovingAnimation(true);
    setTimeout(() => {
      setIsApprovingAnimation(false);
      onApprove(action.id, untilStep);
      onClose();
    }, 600);
  };

  const handleStepUpAuthSuccess = () => {
    setIsApprovingAnimation(true);
    setTimeout(() => {
      setIsApprovingAnimation(false);
      onApprove(action.id, selectedUntilStep);
      onClose();
    }, 600);
  };

  const handleSaveModification = () => {
    onModifyPlan(action.id, modifiedPlanText || action.planSummary);
    setIsModifying(false);
    onAddToast(`Plan modified. Prior approval invalidated! New Plan Hash generated.`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    action.riskTier === 'Critical'
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : action.riskTier === 'High'
                      ? 'bg-orange-100 text-orange-900 border border-orange-300'
                      : action.riskTier === 'Medium'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {action.riskTier} Risk
                </span>

                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {action.workspace} Workspace
                </span>

                <div
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono flex items-center gap-1 border ${
                    action.isPlanValid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300 animate-pulse'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Hash: {action.planHash}</span>
                  <span className="font-bold">
                    ({action.planVersion} - {action.isPlanValid ? 'VALID' : 'INVALIDATED'})
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{action.name}</h2>
              <p className="text-xs text-slate-500">
                Requested by: <strong className="text-slate-800">{action.requestedBy}</strong> | ID: {action.id}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!action.isPlanValid && (
            <div className="bg-red-500/10 border-b border-red-200 px-6 py-2.5 flex items-center gap-2 text-xs text-red-900 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Plan Invalidation Alert: </strong>
                Modifying steps or parameters invalidates prior authorizations. This action must be re-approved.
              </span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider font-sans">
                  Goal Understood
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {action.goalUnderstood}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider font-sans">
                    Reversibility
                  </span>
                  <span
                    className={`font-bold ${
                      action.reversibility === 'Fully Reversible'
                        ? 'text-emerald-700'
                        : action.reversibility === 'Partially Reversible'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {action.reversibility}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider font-sans">
                    Evidence Binding
                  </span>
                  <span className="text-blue-700 font-semibold">{action.evidenceGrade}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider font-sans">
                  What Will Change (Mutations & Deltas)
                </span>
                <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                  {action.changesSummary}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider font-sans">
                  Affected Systems & Connectors
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {action.affectedSystems.map((sys) => (
                    <span
                      key={sys}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold font-mono flex items-center gap-1.5"
                    >
                      <Database className="w-3 h-3 text-blue-600" />
                      {sys}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  Plan Execution Sequence ({action.steps.length} Steps)
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsModifying(!isModifying);
                    setModifiedPlanText(action.planSummary);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isModifying ? 'Cancel Modification' : 'Modify Plan Steps'}
                </button>
              </div>

              {isModifying && (
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Modify Plan Parameters (Will invalidate current Plan Hash {action.planHash})
                  </div>
                  <textarea
                    rows={3}
                    value={modifiedPlanText}
                    onChange={(e) => setModifiedPlanText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModifying(false)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveModification}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                    >
                      Apply & Invalidate Prior Approval
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {action.steps.map((step) => (
                  <div
                    key={step.stepIndex}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold font-mono flex items-center justify-center text-xs">
                        {step.stepIndex}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 text-xs">{step.title}</strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {step.system}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{step.description}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-emerald-700 font-bold shrink-0">
                      G1 Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Immutable Governance Rule
              </div>
              <p className="text-blue-800">
                Voice commands must never bypass authorization. Verification method: {action.verificationMethod}.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Approve up to:</span>
              <select
                value={selectedUntilStep}
                onChange={(e) => setSelectedUntilStep(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold font-mono"
              >
                {action.steps.map((s) => (
                  <option key={s.stepIndex} value={s.stepIndex}>
                    Step {s.stepIndex}: {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl font-medium text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onReject(action.id);
                  onClose();
                }}
                className="px-3.5 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-xl font-bold text-xs"
              >
                Reject Action
              </button>

              <button
                type="button"
                onClick={() => handleApproveClick(selectedUntilStep)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow"
              >
                Approve Until Step {selectedUntilStep}
              </button>

              <button
                type="button"
                onClick={() => handleApproveClick()}
                disabled={isApprovingAnimation}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <Check className="w-4 h-4" />
                {isApprovingAnimation ? 'Confirming...' : 'Approve All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <StepUpAuthModal
        isOpen={isStepUpAuthOpen}
        onClose={() => setIsStepUpAuthOpen(false)}
        onConfirmAuth={handleStepUpAuthSuccess}
        actionTitle={action.name}
        riskTier={action.riskTier}
        onAddToast={onAddToast}
      />
    </>
  );
};
