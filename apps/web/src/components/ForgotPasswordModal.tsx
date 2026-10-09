import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FormField } from './ui/FormField';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your work email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      onSuccessToast(`Reset instructions sent to ${email}`);
    }, 1000);
  };

  const handleResetState = () => {
    setSubmitted(false);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleResetState} size="md" ariaLabel="Reset your password">
      <DialogHeader
        title="Reset your password"
        description="Enter the email address associated with your enterprise account, and we will send you instructions to reset your password."
        onClose={handleResetState}
      />

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <FormField label="Work Email" htmlFor="reset-email" isRequired error={error}>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@company.com"
                leftIcon={<Mail size={16} />}
                isError={!!error}
                autoFocus
              />
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={handleResetState}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={loading}>
              Send Reset Instructions
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
              Check your inbox
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-2)', marginBottom: 'var(--sp-6)' }}>
              We have sent a password reset link to <strong>{email}</strong>.
            </p>
            <Button
              variant="secondary"
              onClick={handleResetState}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back to Sign In
            </Button>
          </div>
        </DialogBody>
      )}
    </Dialog>
  );
};
