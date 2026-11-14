import React, { useState } from 'react';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { PasswordInput } from '../ui/PasswordInput';
import { FormField } from '../ui/FormField';
import { useSupabaseAuth } from '../../lib/supabase/SupabaseAuthContext';

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onAddToast: (msg: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAddToast,
}) => {
  const { updatePassword, clearPasswordRecovery } = useSupabaseAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await updatePassword(newPassword);
      setLoading(false);

      if (res.error) {
        setError(res.error.message || 'Unable to update password. Please request a new recovery link.');
        return;
      }

      setIsSuccess(true);
      onAddToast('Your password has been reset successfully. You can now sign in.');
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to update password');
    }
  };

  const handleFinish = () => {
    clearPasswordRecovery();
    setIsSuccess(false);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
    onSuccess();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleFinish} size="md" ariaLabel="Set New Password">
      <DialogHeader
        title="Set New Password"
        description="Create a new secure master password for your Synaptix Command enterprise account."
        onClose={handleFinish}
      />

      {!isSuccess ? (
        <form onSubmit={handleSubmit}>
          <DialogBody>
            {error && (
              <div
                style={{
                  padding: '0.65rem 0.9rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            <FormField
              label="New Master Password"
              htmlFor="reset-new-password"
              isRequired
              hint="Minimum 8 characters with letters & numbers"
            >
              <PasswordInput
                id="reset-new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </FormField>

            <FormField
              label="Confirm New Password"
              htmlFor="reset-confirm-password"
              isRequired
            >
              <PasswordInput
                id="reset-confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={handleFinish}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={loading}
              rightIcon={<ArrowRight size={16} className="btn-arrow-icon" />}
            >
              Update Password
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <DialogBody>
          <div style={{ textAlign: 'center', padding: 'var(--sp-4) 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--c-success-bg)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-success)',
                marginBottom: 'var(--sp-3)',
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--c-text-1)',
                marginBottom: 'var(--sp-2)',
              }}
            >
              Password Updated Successfully
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-2)', marginBottom: 'var(--sp-6)' }}>
              Your account password has been updated in Supabase Auth. You can now use your updated credentials to sign in.
            </p>
            <Button variant="primary" onClick={handleFinish}>
              Proceed to Sign In
            </Button>
          </div>
        </DialogBody>
      )}
    </Dialog>
  );
};

