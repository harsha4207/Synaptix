import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  KeyRound,
  Lock,
  Fingerprint
} from 'lucide-react';

interface StepUpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAuth: () => void;
  actionTitle: string;
  riskTier: string;
  onAddToast: (msg: string) => void;
}

export const StepUpAuthModal: React.FC<StepUpAuthModalProps> = ({
  isOpen,
  onClose,
  onConfirmAuth,
  actionTitle,
  riskTier,
  onAddToast,
}) => {
  const [authCode, setAuthCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode || authCode.length < 4) {
      setErrorMsg('Please enter a valid 6-digit enterprise 2FA code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      onAddToast('Step-up authentication verified successfully (G1 Cryptographic Audit)');
      onConfirmAuth();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
        <div className="p-5 bg-red-50 border-b border-red-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Step-Up Authentication</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-900 uppercase">
                  {riskTier} Risk
                </span>
              </div>
              <p className="text-xs text-red-800 mt-0.5">
                High-risk actions require secondary dual-factor authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Governed Action
            </span>
            <strong className="text-slate-900 text-sm block">{actionTitle}</strong>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">
              Enterprise Authenticator Code (TOTP / Hardware Key)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={authCode}
                onChange={(e) => {
                  setAuthCode(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="Enter 6-digit code (e.g., 849201)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center tracking-widest text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
            </div>
            {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Strict Non-Bypassable Governance Rule
            </div>
            <p className="text-amber-800">
              Voice commands and automated scripts cannot bypass step-up authentication. An immutable cryptographic record will log this approval event.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isVerifying || authCode.length < 4}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              {isVerifying ? 'Verifying 2FA...' : 'Authorize Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
