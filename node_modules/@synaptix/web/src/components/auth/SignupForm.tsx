import React, { useState } from 'react';
import { User, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { FormField } from '../ui/FormField';
import { Separator } from '../ui/Separator';
import { GoogleSignInButton } from '../ui/GoogleSignInButton';
import { useSupabaseAuth } from '../../lib/supabase/SupabaseAuthContext';

export interface SignupFormProps {
  onSuccess: (email: string) => void;
  onGoogleAuth: () => void;
  onSwitchToLogin: () => void;
  isGoogleLoading?: boolean;
  errorMessage?: string | null;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onGoogleAuth,
  onSwitchToLogin,
  isGoogleLoading = false,
  errorMessage = null,
}) => {
  const { signUpWithEmail } = useSupabaseAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmationSentEmail, setConfirmationSentEmail] = useState<string | null>(null);

  const formatErrorMessage = (err: Error | string): string => {
    const raw = typeof err === 'string' ? err : err.message || '';
    const lower = raw.toLowerCase();
    if (lower.includes('already registered') || lower.includes('user already exists') || lower.includes('unique constraint')) {
      return 'An account with this email address already exists. Please sign in instead.';
    }
    if (lower.includes('password') && (lower.includes('least') || lower.includes('weak') || lower.includes('short') || lower.includes('characters'))) {
      return 'Password does not meet security requirements. Please use at least 8 characters.';
    }
    if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch failed')) {
      return 'Unable to reach the authentication service. Please check your network connection.';
    }
    return raw;
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid work email';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      errs.terms = 'You must accept the Enterprise Service Agreement';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isGoogleLoading) return;
    if (!validate()) return;

    setIsLoading(true);
    setLocalError(null);

    try {
      const res = await signUpWithEmail(email.trim(), password, {
        fullName: fullName.trim(),
        organization: 'SYNAPTIX COMMAND Enterprise',
      });

      if (res.error) {
        setLocalError(formatErrorMessage(res.error));
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      if (res.requiresConfirmation) {
        // Show email confirmation message
        setConfirmationSentEmail(email.trim());
      } else {
        // Active session created immediately
        onSuccess(email.trim());
      }
    } catch (err) {
      setLocalError(formatErrorMessage(err instanceof Error ? err : String(err)));
      setIsLoading(false);
    }
  };

  // If email confirmation is required, render dedicated verification view
  if (confirmationSentEmail) {
    return (
      <div className="auth-form-content" style={{ textAlign: 'center', padding: '1rem 0.25rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#34d399',
          }}
        >
          <CheckCircle2 size={32} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: '0.6rem' }}>
          Verify Your Email
        </h2>

        <p style={{ fontSize: '0.875rem', color: 'var(--c-text-2)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          We have sent an authentication confirmation email to{' '}
          <strong style={{ color: 'var(--c-text-1)' }}>{confirmationSentEmail}</strong>.
          Please click the verification link inside to activate your enterprise account.
        </p>

        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--c-bg-2, rgba(255, 255, 255, 0.04))',
            border: '1px solid var(--c-border, rgba(255, 255, 255, 0.08))',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.78rem',
            color: 'var(--c-text-3)',
            lineHeight: 1.4,
          }}
        >
          💡 <strong style={{ color: 'var(--c-text-2)' }}>Tip:</strong> If you do not see the email within 2 minutes, check your spam or junk folder.
        </div>

        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={onSwitchToLogin}
          rightIcon={<ArrowRight size={16} className="btn-arrow-icon" />}
        >
          Proceed to Sign In
        </Button>
      </div>
    );
  }

  const activeError = localError || errorMessage;

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form-content">
      {/* Authentication Error Banner */}
      {activeError && (
        <div
          className="auth-error-banner"
          style={{
            padding: '0.65rem 0.9rem',
            marginBottom: '0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: '0.82rem',
            lineHeight: 1.4,
          }}
          role="alert"
        >
          {activeError}
        </div>
      )}

      {/* Google Sign-In prominent at top */}
      <GoogleSignInButton
        onClick={onGoogleAuth}
        text="Sign up with Google"
        isLoading={isGoogleLoading}
        disabled={isLoading || isGoogleLoading}
      />

      {/* Separator before email form */}
      <Separator label="Or continue with" />

      {/* Full Name */}
      <FormField
        label="Full Name"
        htmlFor="signup-name"
        isRequired
        error={errors.fullName}
      >
        <Input
          id="signup-name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          placeholder="Alex Vance"
          autoComplete="name"
          leftIcon={<User size={16} />}
          isError={!!errors.fullName}
        />
      </FormField>

      {/* Work Email */}
      <FormField
        label="Corporate Email"
        htmlFor="signup-email"
        isRequired
        error={errors.email}
      >
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="alex.vance@enterprise.com"
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          isError={!!errors.email}
        />
      </FormField>

      {/* Password */}
      <FormField
        label="Password"
        htmlFor="signup-password"
        isRequired
        error={errors.password}
        hint="Min. 8 characters with letters and numbers"
      >
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Create master password"
          autoComplete="new-password"
          isError={!!errors.password}
        />
      </FormField>

      {/* Confirm Password */}
      <FormField
        label="Confirm Password"
        htmlFor="signup-confirm-password"
        isRequired
        error={errors.confirmPassword}
      >
        <PasswordInput
          id="signup-confirm-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          placeholder="Re-enter password"
          autoComplete="new-password"
          isError={!!errors.confirmPassword}
        />
      </FormField>

      {/* Terms Checkbox */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 'var(--sp-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--c-text-2)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
            }}
            style={{ accentColor: 'var(--c-blue)', borderRadius: '4px', marginTop: '2px' }}
          />
          <span>
            I agree to the <strong style={{ color: 'var(--c-text-1)' }}>Enterprise Service Agreement</strong> and{' '}
            <strong style={{ color: 'var(--c-text-1)' }}>Security Governance Policies</strong>.
          </span>
        </label>
        {errors.terms && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--c-danger)', marginTop: '4px' }}>
            {errors.terms}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        rightIcon={<ArrowRight size={16} className="btn-arrow-icon" />}
      >
        Create Enterprise Account
      </Button>

      {/* Switch to Login */}
      <div className="auth-footer-prompt">
        <span>Already have an enterprise account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="switch-mode-btn"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};
